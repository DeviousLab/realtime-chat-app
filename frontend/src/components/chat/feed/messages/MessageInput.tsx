import { useMutation } from '@apollo/client';
import { Box, Input } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ObjectId } from 'bson';

import MessageOperations from '../../../../graphql/operations/messages';
import { SendMessageArgs } from '../../../../../../backend/src/util/types';

type InputProps = {
	session: Session;
	conversationId: string;
};

const MessageInput = ({ session, conversationId }: InputProps) => {
	const [messageContent, setMessageContent] = useState<string>('');
	const [sendMessage] = useMutation<{ sendMessage: boolean }, SendMessageArgs>(
		MessageOperations.Mutations.sendMessage
	);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const { id: userId } = session.user;
			const messageId = new ObjectId().toString();
			const newMessage: SendMessageArgs = {
				conversationId,
				userId,
				id: messageId,
				content: messageContent,
			};

			const { data, errors } = await sendMessage({
				variables: {
					...newMessage,
				},
			});

			if (!data?.sendMessage || errors) {
				throw new Error('Error sending message');
			}
		} catch (error: any) {
			console.error(error);
			toast.error(error?.message || 'Something went wrong');
		}
	};

	return (
		<Box px={4} py={6} width='100%'>
			<form onSubmit={handleSubmit}>
				<Input
					value={messageContent}
					onChange={(e) => setMessageContent(e.target.value)}
					placeholder='Type a message...'
					size='md'
					resize='none'
					_focus={{
						borderColor: 'whiteAlpha.400',
						boxShadow: 'none',
						border: '1px solid',
					}}
				/>
			</form>
		</Box>
	);
};

export default MessageInput;
