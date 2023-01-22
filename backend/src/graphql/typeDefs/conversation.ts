import { gql } from 'apollo-server-core';

const typeDefs = gql`
  scalar Date

  type Mutation {
    createConversation(participantIds: [String]): CreateConversationResponse
  }

  type CreateConversationResponse {
    conversationId: String
  }
  
  type ConversationParticipant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
  }

  type Conversation {
    id: String
    participants: [ConversationParticipant]
    lastMessage: Message
    createdAt: Date
    updatedAt: Date
  }

  type Query {
    getConversations: [Conversation]
  }
`;

export default typeDefs;
