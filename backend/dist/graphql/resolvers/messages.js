import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import { userIsConversationParticipant } from '../../util/functions';
import { ConversationPopulate } from './conversation';
const resolvers = {
    Query: {
        messages: async (_, args, context) => {
            const { session, prisma } = context;
            const { conversationId } = args;
            if (!session?.user) {
                throw new GraphQLError('Unauthorised');
            }
            const { user: { id: userId }, } = session;
            const conversation = await prisma.conversation.findUnique({
                where: {
                    id: conversationId,
                },
                include: ConversationPopulate,
            });
            if (!conversation) {
                throw new GraphQLError('Conversation not found');
            }
            const isParticipant = userIsConversationParticipant(conversation.participants, userId);
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
            }
            catch (error) {
                console.error(error);
                throw new GraphQLError('Error fetching messages');
            }
            return [];
        },
    },
    Mutation: {
        sendMessage: async (_, args, context) => {
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
                                    hasSeenLatestMessage: false,
                                },
                            },
                            updateMany: {
                                where: {
                                    NOT: {
                                        userId,
                                    },
                                },
                                data: {
                                    hasSeenLatestMessage: true,
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
            }
            catch (error) {
                console.error(error);
                throw new GraphQLError('Error sending message');
            }
            return true;
        },
    },
    Subscription: {
        messageSent: {
            subscribe: withFilter((_, __, context) => {
                const { pubsub } = context;
                return pubsub.asyncIterator('MESSAGE_SENT');
            }, (payload, args, context) => {
                return payload.messageSent.conversationId === args.conversationId;
            }),
        },
    },
};
export const MessagePopulate = Prisma.validator()({
    user: {
        select: {
            id: true,
            username: true,
        },
    },
});
export default resolvers;
