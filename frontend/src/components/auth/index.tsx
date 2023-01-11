import { Button, Center, Image, Input, Stack, Text } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

type AuthProps = {
	session: Session | null;
	reloadSession: () => void;
};

const Auth = (props: AuthProps) => {
  const [username, setUsername] = useState("");

  const onSubmit = async () => {
    try {
      
    } catch (error) {
      console.log(error)
    }
  };

	return (
		<Center height='100vh'>
			<Stack align='center' spacing={4} >
				{props.session ? (
          <>
					<Text fontSize="3xl">Create a username</Text>
          <Input placeholder='Enter a username...' value={username} onChange={(e) => setUsername(e.target.value)}/>
          <Button width="100%" onClick={onSubmit}>Create</Button>
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
