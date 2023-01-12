import { CreateUserResponse, GraphQLContext } from '../../util/types';

const resolvers = {
	Query: {
		searchUsers: () => {},
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
