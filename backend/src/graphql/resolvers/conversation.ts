import { Prisma } from '@prisma/client';
import { ApolloError } from 'apollo-server-core';
import { ConversationPopulated, GraphQLContext } from '../../util/types';

const resolvers = {
	Query: {
		getConversations: async (
			_: any,
			__: any,
			context: GraphQLContext
		): Promise<Array<ConversationPopulated>> => {
			const { session, prisma } = context;

			if (!session?.user) {
				throw new ApolloError('Not authenticated');
			}

			const {
				user: { id: userId },
			} = session;

			try {
				const conversations = await prisma.conversation.findMany({
					include: ConversationPopulate,
				});
				return conversations.filter(
					(conversation) =>
						!!conversation.participants.find(
							(participant) => participant.userId === userId
						)
				);
			} catch (error) {
				console.error(error);
				throw new ApolloError('Error getting conversations');
			}
		},
	},
	Mutation: {
		createConversation: async (
			_: any,
			args: { participantIds: Array<string> },
			context: GraphQLContext
		): Promise<{ conversationId: string }> => {
			const { session, prisma, pubsub } = context;
			const { participantIds } = args;

			if (!session?.user) {
				throw new ApolloError('Not authenticated');
			}

			const {
				user: { id: userId },
			} = session;

			try {
				const conversation = await prisma.conversation.create({
					data: {
						participants: {
							createMany: {
								data: participantIds.map((participantId) => ({
									userId: participantId,
									hasSeenLatestMessage: participantId === userId,
								})),
							},
						},
					},
					include: ConversationPopulate,
				});

				pubsub.publish('CONVERSATION_CREATED', {
					conversationCreated: conversation,
				});

				return { conversationId: conversation.id };
			} catch (error) {
				console.error(error);
				throw new ApolloError('Error creating conversation');
			}
		},
	},
	Subscription: {
		conversationCreated: {
			subscribe: (_: any, __: any, context: GraphQLContext) => {
				const { pubsub } = context;

				pubsub.asyncIterator(['CONVERSATION_CREATED'])
			}
		}
	},
};

export const ParticipantPopulate =
	Prisma.validator<Prisma.ConversationParticipantInclude>()({
		user: {
			select: {
				id: true,
				username: true,
			},
		},
	});

export const ConversationPopulate =
	Prisma.validator<Prisma.ConversationInclude>()({
		participants: {
			include: ParticipantPopulate,
		},
		lastMessage: {
			include: {
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		},
	});

export default resolvers;
