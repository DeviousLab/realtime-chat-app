import gql from "graphql-tag";
const typeDefs = gql `
  scalar Date

  type Mutation {
    createConversation(participantIds: [String]): CreateConversationResponse
  }

  type Mutation {
    markConversationAsRead(userId: String!, conversationId: String!): Boolean
  }

  type Mutation {
    deleteConversation(conversationId: String!): Boolean
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

  type Subscription {
    conversationCreated: Conversation
  }

  type Subscription {
    conversationUpdated: Conversation
  }

  type Subscription {
    conversationDeleted: Conversation
  }
`;
export default typeDefs;
