import { gql } from '@apollo/client';

const ConversationFields = `
    id
    participants {
    user {
      id
      username
    }
    hasSeenLatestMessage
    }
    lastMessage {
      id
      user {
        id
        username
      }
      content
      createdAt
    }
    updatedAt
`;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	Queries: {
		getConversations: gql`
			query GetConversations {
				getConversations {
          ${ConversationFields}
        }
			}
		`,
	},
	Mutations: {
		createConversation: gql`
			mutation CreateConversation($participantIds: [String]!) {
				createConversation(participantIds: $participantIds) {
					conversationId
				}
			}
		`,
	},
	Subscriptions: {
    conversationCreated: gql`
      subscription ConversationCreated {
        conversationCreated {
          ${ConversationFields}
        }
      }
    `
  },
};
