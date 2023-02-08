import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import { userIsConversationParticipant } from '../../util/functions';
const resolvers = {
    Query: {
        getConversations: async (_, __, context) => {
            const { session, prisma } = context;
            if (!session?.user) {
                throw new GraphQLError('Not authenticated');
            }
            const { user: { id: userId }, } = session;
            try {
                const conversations = await prisma.conversation.findMany({
                    include: ConversationPopulate,
                });
                return conversations.filter((conversation) => !!conversation.participants.find((participant) => participant.userId === userId));
            }
            catch (error) {
                console.error(error);
                throw new GraphQLError('Error getting conversations');
            }
        },
    },
    Mutation: {
        createConversation: async (_, args, context) => {
            const { session, prisma, pubsub } = context;
            const { participantIds } = args;
            if (!session?.user) {
                throw new GraphQLError('Not authenticated');
            }
            const { user: { id: userId }, } = session;
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
            }
            catch (error) {
                console.error(error);
                throw new GraphQLError('Error creating conversation');
            }
        },
        markConversationAsRead: async (_, args, context) => {
            const { session, prisma } = context;
            const { conversationId } = args;
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
            }
            catch (error) {
                console.error(error);
                throw new GraphQLError('Error marking conversation as read');
            }
            return true;
        },
        deleteConversation: async (_, args, context) => {
            const { session, prisma, pubsub } = context;
            const { conversationId } = args;
            if (!session?.user) {
                throw new GraphQLError('Not authenticated');
            }
            try {
                const [deletedConversation] = await prisma.$transaction([
                    prisma.conversation.delete({
                        where: {
                            id: conversationId,
                        },
                        include: ConversationPopulate,
                    }),
                    prisma.conversationParticipant.deleteMany({
                        where: {
                            conversationId,
                        },
                    }),
                    prisma.message.deleteMany({
                        where: {
                            conversationId,
                        },
                    }),
                ]);
                pubsub.publish('CONVERSATION_DELETED', {
                    conversationDeleted: deletedConversation,
                });
            }
            catch (error) {
                console.error(error);
                throw new GraphQLError('Error deleting conversation');
            }
            return true;
        },
    },
    Subscription: {
        conversationCreated: {
            subscribe: withFilter((_, __, context) => {
                const { pubsub } = context;
                return pubsub.asyncIterator(['CONVERSATION_CREATED']);
            }, (payload, _, context) => {
                const { session } = context;
                if (!session?.user) {
                    throw new GraphQLError('Not authenticated');
                }
                const { conversationCreated: { participants }, } = payload;
                const userIsParticipant = userIsConversationParticipant(participants, session.user.id);
                return userIsParticipant;
            }),
        },
        conversationUpdated: {
            subscribe: withFilter((_, __, context) => {
                const { pubsub } = context;
                return pubsub.asyncIterator(['CONVERSATION_UPDATED']);
            }, (payload, _, context) => {
                const { session } = context;
                if (!session?.user) {
                    throw new GraphQLError('Not authenticated');
                }
                const { id: userId } = session.user;
                const { conversationUpdated: { participants }, } = payload;
                const userIsParticipant = userIsConversationParticipant(participants, userId);
                return userIsParticipant;
            }),
        },
        conversationDeleted: {
            subscribe: withFilter((_, __, context) => {
                const { pubsub } = context;
                return pubsub.asyncIterator(['CONVERSATION_DELETED']);
            }, (payload, _, context) => {
                const { session } = context;
                if (!session?.user) {
                    throw new GraphQLError('Not authenticated');
                }
                const { id: userId } = session.user;
                const { conversationDeleted: { participants }, } = payload;
                const userIsParticipant = userIsConversationParticipant(participants, userId);
                return userIsParticipant;
            }),
        },
    },
};
export const ParticipantPopulate = Prisma.validator()({
    user: {
        select: {
            id: true,
            username: true,
        },
    },
});
export const ConversationPopulate = Prisma.validator()({
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
