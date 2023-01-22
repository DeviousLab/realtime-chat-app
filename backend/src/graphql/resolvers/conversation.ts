import { Prisma } from '@prisma/client';
import { ApolloError } from 'apollo-server-core';
import { GraphQLContext } from '../../util/types';

const resolvers = {
	Mutation: {
		createConversation: async (
			_: any,
			args: { participantIds: Array<string> },
			context: GraphQLContext
		): Promise<{ conversationId: string }> => {
			const { session, prisma } = context;
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
				return { conversationId: conversation.id };
			} catch (error) {
				console.error(error);
				throw new ApolloError('Error creating conversation');
			}
		},
	},
};

export const ParticipantPopulate = Prisma.validator<Prisma.ConversationParticipantInclude>()({
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
