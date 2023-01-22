import { useMutation } from '@apollo/client';
import { Button, Center, Image, Input, Stack, Text } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import UserOperations from '../../graphql/operations/user';
import { CreateUserData, CreateUserVariables } from '../../util/types';

type AuthProps = {
	session: Session | null;
	reloadSession: () => void;
};

const Auth = ({ session, reloadSession }: AuthProps) => {
	const [username, setUsername] = useState('');

	const [createUser, { loading, error }] = useMutation<
		CreateUserData,
		CreateUserVariables
	>(UserOperations.Mutations.createUser);

	const onSubmit = async () => {
		if (!username) return;
		try {
			const { data } = await createUser({
				variables: {
					username,
				},
			});
			if (!data?.createUser) {
				throw new Error();
			}
			if (data.createUser.error) {
				const { createUser: { error } } = data;

				throw new Error(error);
			}
			reloadSession();
			toast.success('Username created!');
		} catch (error: any) {
			console.error(error);
			toast.error(error);
		}
	};

	return (
		<Center height='100vh'>
			<Stack align='center' spacing={4}>
				{session ? (
					<>
						<Text fontSize='3xl'>Create a username</Text>
						<Input
							placeholder='Enter a username...'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<Button width='100%' onClick={onSubmit} isLoading={loading}>
							Create
						</Button>
					</>
				) : (
					<>
						<Text fontSize='3xl'>iMessage</Text>
						<Button
							leftIcon={
								<Image
									height='20px'
									src='/images/google.png'
									alt='Google Logo'
								/>
							}
							onClick={() => signIn('google')}
						>
							Sign in with Google
						</Button>
					</>
				)}
			</Stack>
		</Center>
	);
};

export default Auth;
