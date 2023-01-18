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
