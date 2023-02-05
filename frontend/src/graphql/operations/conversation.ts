import { gql } from '@apollo/client';
import { MessageFields } from './messages';

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
      ${MessageFields}
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
		markConversationAsRead: gql`
			mutation MarkConversationAsRead(
				$userId: String!
				$conversationId: String!
			) {
				markConversationAsRead(userId: $userId, conversationId: $conversationId)
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
    `,
		conversationUpdated: gql`
			subscription ConversationUpdated {
				conversationUpdated {
					${ConversationFields}
				}
			}
		`
	},
};
