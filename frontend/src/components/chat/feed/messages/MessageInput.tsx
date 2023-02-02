import { Box, Input } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

type InputProps = {
	session: Session;
	conversationId: string;
};

const MessageInput = ({ session, conversationId }: InputProps) => {
	const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Something went wrong');
    }
  }

	return (
		<Box px={4} py={6} width='100%'>
			<form onSubmit={() => {}}>
				<Input
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder='Type a message...'
					size='md'
          resize="none"
          _focus={{ borderColor: 'whiteAlpha.400', boxShadow: 'none', border: '1px solid' }}
				/>
			</form>
		</Box>
	);
};

export default MessageInput;
