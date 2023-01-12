export interface CreateUserData {
	createUser: {
		success: boolean;
		error: string;
	};
}

export interface CreateUserVariables {
	username: string;
}