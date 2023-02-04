import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import { userIsConversationParticipant } from '../../util/functions';

import {
	GraphQLContext,
	SendMessageArgs,
	MessageSendSubscriptionPayload,
	MessagePopulated,
} from '../../util/types';
import { ConversationPopulate } from './conversation';

const resolvers = {
	Query: {
		messages: async (
			_: any,
			args: SendMessageArgs,
			context: GraphQLContext
		): Promise<Array<MessagePopulated>> => {
			const { session, prisma } = context;
			const { conversationId } = args;

			if (!session?.user) {
				throw new GraphQLError('Unauthorised');
			}

			const {
				user: { id: userId },
			} = session;

			const conversation = await prisma.conversation.findUnique({
				where: {
					id: conversationId,
				},
				include: ConversationPopulate,
			});

			if (!conversation) {
				throw new GraphQLError('Conversation not found');
			}

			const isParticipant = userIsConversationParticipant(
				conversation.participants,
				userId
			);

      if (!isParticipant) {
        throw new GraphQLError('Unauthorised');
      }

      try {
        const messages = await prisma.message.findMany({
          where: {
            conversationId,
          },
          include: MessagePopulate,
          orderBy: {
            createdAt: 'desc',
          }
        });
        return messages;
      } catch (error) {
        console.error(error);
        throw new GraphQLError('Error fetching messages');
      }

			return [];
		},
	},
	Mutation: {
		sendMessage: async (
			_: any,
			args: SendMessageArgs,
			context: GraphQLContext
		): Promise<boolean> => {
			const { session, prisma, pubsub } = context;
			const { id: messageId, conversationId, userId, content } = args;

			if (!session?.user) {
				throw new GraphQLError('Unauthorised');
			}
			const { id: sessionUserId } = session.user;

			if (sessionUserId !== userId) {
				throw new GraphQLError('Unauthorised');
			}

			try {
				const newMessage = await prisma.message.create({
					data: {
						id: messageId,
						conversationId,
						userId,
						content,
					},
					include: MessagePopulate,
				});
				const participant = await prisma.conversationParticipant.findFirst({
					where: {
						userId: sessionUserId,
						conversationId,
					}
				});
				if (!participant) {
					throw new GraphQLError('Participant not found');
				}
				const conversation = await prisma.conversation.update({
					where: {
						id: conversationId,
					},
					data: {
						lastMessageId: newMessage.id,
						participants: {
							update: {
								where: {
									id: participant.id,
								},
								data: {
									hasSeenLatestMessage: true,
								},
							},
							updateMany: {
								where: {
									NOT: {
										userId,
									},
								},
								data: {
									hasSeenLatestMessage: false,
								},
							},
						},
					},
					include: ConversationPopulate,
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
	Subscription: {
		messageSent: {
			subscribe: withFilter(
				(_: any, __: any, context: GraphQLContext) => {
					const { pubsub } = context;
					return pubsub.asyncIterator('MESSAGE_SENT');
				},
				(
					payload: MessageSendSubscriptionPayload,
					args: { conversationId: string },
					context: GraphQLContext
				) => {
					return payload.messageSent.conversationId === args.conversationId;
				}
			),
		},
	},
};

export const MessagePopulate = Prisma.validator<Prisma.MessageInclude>()({
	user: {
		select: {
			id: true,
			username: true,
		},
	},
});

export default resolvers;
