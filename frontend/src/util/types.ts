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
	};
}

export interface CreateConversationVariables {
	participantIds: Array<string>;
}

export interface ConversationsData {
	getConversations: Array<ConversationPopulated>;
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
		};
	};
}

export interface ConversationUpdatedData {
	conversationUpdated: ConversationPopulated;
}

export interface ConversationDeletedData {
	conversationDeleted: ConversationPopulated;
}

export type User = {
	id: string;
	username: string;
};

export type Message = {
	id: string;
	user: User;
	content: string;
	userId: string;
	conversationId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type MessagePopulated = Message & {
	user: {
		id: string;
		username: string;
	};
};

export type ConversationParticipant = {
	id: string;
	user: User;
	hasSeenLatestMessage: boolean;
	conversationId: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

export type Conversation = {
	id: string;
	participants: Array<ConversationParticipant>;
	lastMessage: Message;
	createdAt: Date;
	updatedAt: Date;
	lastMessageId: string | null;
}

export type ParticipantPopulated = ConversationParticipant & {
	user: {
		id: string;
		username: string | null;
	}
}

export type ConversationPopulated = Conversation & {
	lastMessage:(Message & {
		user: {
			id: string;
			username: string | null;
		};
	}) | null;
	participants: ParticipantPopulated[];
}[]

export interface SendMessageArgs {
	id: string;
	conversationId: string;
	userId: string;
	content: string;
}