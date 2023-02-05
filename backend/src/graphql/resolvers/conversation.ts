import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { withFilter } from 'graphql-subscriptions';

import {
	ConversationCreatedSubscriptionPayload,
	ConversationPopulated,
	ConversationUpdatedSubscriptionPayload,
	GraphQLContext,
} from '../../util/types';
import { userIsConversationParticipant } from '../../util/functions';

const resolvers = {
	Query: {
		getConversations: async (
			_: any,
			__: any,
			context: GraphQLContext
		): Promise<Array<ConversationPopulated>> => {
			const { session, prisma } = context;

			if (!session?.user) {
				throw new GraphQLError('Not authenticated');
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
				throw new GraphQLError('Error getting conversations');
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
				throw new GraphQLError('Not authenticated');
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
									hasSeenLatestMessage: participantId !== userId,
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
				throw new GraphQLError('Error creating conversation');
			}
		},
		markConversationAsRead: async (
			_: any,
			args: { userId: string; conversationId: string },
			context: GraphQLContext
		): Promise<boolean> => {
			const { session, prisma } = context;
			const { userId, conversationId } = args;

			if (!session?.user) {
				throw new GraphQLError('Not authenticated');
			}

			try {
				const participant = await prisma.conversationParticipant.findFirst({
					where: {
						conversationId,
						hasSeenLatestMessage: false,
					},
				});

				if (!participant) {
					throw new GraphQLError('Participant not found');
				}
				await prisma.conversationParticipant.update({
					where: {
						id: participant.id,
					},
					data: {
						hasSeenLatestMessage: true,
					},
				});
			} catch (error) {
				console.error(error);
				throw new GraphQLError('Error marking conversation as read');
			}
			return true;
		},
	},
	Subscription: {
		conversationCreated: {
			subscribe: withFilter(
				(_: any, __: any, context: GraphQLContext) => {
					const { pubsub } = context;

					return pubsub.asyncIterator(['CONVERSATION_CREATED']);
				},
				(
					payload: ConversationCreatedSubscriptionPayload,
					_: any,
					context: GraphQLContext
				) => {
					const { session } = context;

					if (!session?.user) {
						throw new GraphQLError('Not authenticated');
					}
					const {
						conversationCreated: { participants },
					} = payload;

					const userIsParticipant = userIsConversationParticipant(
						participants,
						session.user.id
					);

					return userIsParticipant;
				}
			),
		},
		conversationUpdated: {
			subscribe: withFilter(
				(_: any, __: any, context: GraphQLContext) => {
					const { pubsub } = context;

					return pubsub.asyncIterator(['CONVERSATION_UPDATED']);
				},
				(
					payload: ConversationUpdatedSubscriptionPayload,
					_: any,
					context: GraphQLContext
				) => {
					const { session } = context;

					if (!session?.user) {
						throw new GraphQLError('Not authenticated');
					}

					const { id: userId } = session.user;
					
					const { conversationUpdated: { participants } } = payload;
					const userIsParticipant = userIsConversationParticipant(participants, userId);

					return userIsParticipant;
				}
			),
		},
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
