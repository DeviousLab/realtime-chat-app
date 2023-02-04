import { gql } from '@apollo/client';

export const MessageFields = `
  id
  user {
    id
    username
  }
  content
  createdAt
`;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	Queries: {
		messages: gql`
      query Messages($conversationId: String!) {
        messages(conversationId: $conversationId) {
          ${MessageFields}
        }
      }
    `,
	},
	Mutations: {
		sendMessage: gql`
			mutation SendMessage(
				$id: String!
				$conversationId: String!
				$userId: String!
				$content: String!
			) {
				sendMessage(
					id: $id
					conversationId: $conversationId
					userId: $userId
					content: $content
				)
			}
		`,
	},
	Subscriptions: {
		messageSent: gql`
      subscription MessageSent($conversationId: String!) {
        messageSent(conversationId: $conversationId) {
          ${MessageFields}
        }
      }
    `,
	},
};
