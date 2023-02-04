import gql from 'graphql-tag';

const typeDefs = gql`
	scalar Date

	type Message {
		id: String
		user: User
		content: String
		createdAt: Date
	}

	type Mutation {
		sendMessage(
			id: String
			conversationId: String
			userId: String
			content: String
		): Boolean
	}

  type Subscription {
    messageSent(conversationId: String): Message
  }

	type Query {
		messages(conversationId: String): [Message]
	}
`;

export default typeDefs;
