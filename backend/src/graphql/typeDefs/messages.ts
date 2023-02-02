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
			senderId: String
			body: String
		): Boolean
	}

  type Subscription {
    messageSent(conversationId: String): Message
  }
`;

export default typeDefs;
