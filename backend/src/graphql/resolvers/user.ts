import { User } from '@prisma/client';
import { ApolloError } from 'apollo-server-core';
import { CreateUserResponse, GraphQLContext } from '../../util/types';

const resolvers = {
	Query: {
		searchUsers: async (
			_: any,
			args: { username: string },
			context: GraphQLContext
		): Promise<Array<User>> => {
			const { username: usernameQuery } = args;
			const { prisma, session } = context;
			if (!session?.user) {
				throw new ApolloError('You must be logged in to search users');
			}
			const { user: { username: currentUsername } } = session;
			try {
				const users = await prisma.user.findMany({
					where: {
						username: {
							contains: usernameQuery,
							mode: 'insensitive',
							not: currentUsername,
						}
					}
				});
				return users;
			} catch (error) {
				console.error(error);
				throw new ApolloError('There was an error searching users');
			}
		},
	},

	Mutation: {
		createUser: async (
			_: any,
			args: { username: string },
			context: GraphQLContext
		): Promise<CreateUserResponse> => {
			const { username } = args;
			const { session, prisma } = context;
			if (!session?.user) {
				return {
					success: false,
					error: 'You must be logged in to create a user',
				};
			}
			const { id: userId } = session.user;
			try {
				const existingUser = await prisma.user.findUnique({
					where: { username },
				});
				if (existingUser) {
					return {
						success: false,
						error: 'That username is already taken',
					};
				}
				await prisma.user.update({
					where: { id: userId },
					data: { username },
				});
				return {
					success: true
				}
			} catch (error) {
				console.error(error);
				return {
					success: false,
					error: 'There was an error creating your user',
				}
			}
		},
	},
};

export default resolvers;
