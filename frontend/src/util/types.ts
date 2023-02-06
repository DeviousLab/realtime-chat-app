import { ConversationPopulated, MessagePopulated } from "../../../backend/src/util/types";

export interface CreateUserData {
	createUser: {
		success: boolean;
		error: string;
	};
}

export interface CreateUserVariables {
	username: string;
}

export interface SearchUsersInput {
	username: string;
}

export interface SearchedUser {
	id: string;
	username: string;
}

export interface SearchUsersData {
	searchUsers: Array<SearchedUser>;
}

export interface CreateConversationData {
	createConversation: {
		conversationId: string;
	}
}

export interface CreateConversationVariables {
	participantIds: Array<string>;
}

export interface ConversationsData {
	getConversations: Array<ConversationPopulated>
}

export interface MessagesData {
	messages: Array<MessagePopulated>;
}

export interface MessageVariables {
	conversationId: string;
}

export interface MessageSubscriptionData {
	subscriptionData: {
		data: {
			messageSent: MessagePopulated;
		}
	}
}

export interface ConversationUpdatedData {
	conversationUpdated: ConversationPopulated;
	}

export interface ConversationDeletedData {
	conversationDeleted: ConversationPopulated;
}