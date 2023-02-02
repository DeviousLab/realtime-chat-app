import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { withFilter } from 'graphql-subscriptions';

import { GraphQLContext, SendMessageArgs } from '../../util/types';

const resolvers = {
	Query: {},
	Mutation: {
		sendMessage: async (
			_: any,
			args: SendMessageArgs,
			context: GraphQLContext
		): Promise<boolean> => {
			const { session, prisma, pubsub } = context;
			const { id: messageId, conversationId, senderId, body } = args;

			if (!session?.user) {
				throw new GraphQLError('Unauthorized');
			}
			const { id: sessionUserId } = session.user;

			if (sessionUserId !== senderId) {
				throw new GraphQLError('Unauthorized');
			}

			try {
				const newMessage = await prisma.message.create({
					data: {
						id: messageId,
						conversationId,
						userId: senderId,
						content: body,
					},
					include: messagePopulated,
				});
				const conversation = await prisma.conversation.update({
					where: {
						id: conversationId,
					},
					data: {
						lastMessageId: newMessage.id,
						participants: {
							update: {
								where: {
									id: senderId,
								},
								data: {
									hasSeenLatestMessage: true,
								},
							},
							updateMany: {
								where: {
									NOT: {
										id: sessionUserId,
									},
								},
								data: {
									hasSeenLatestMessage: false,
								},
							},
						},
					},
				});

				pubsub.publish('MESSAGE_SENT', { messageSent: newMessage });
				pubsub.publish('CONVERSATION_UPDATED', {
					conversationUpdated: conversation,
				});
			} catch (error) {
				console.error(error);
				throw new GraphQLError('Error sending message');
			}
			return true;
		},
	},
	Subscription: {},
};

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
	user: {
		select: {
			id: true,
			username: true,
		},
	},
});

export default resolvers;
