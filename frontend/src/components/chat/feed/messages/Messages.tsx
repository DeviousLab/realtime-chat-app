import { useQuery } from '@apollo/client';
import { Flex, Stack } from '@chakra-ui/react';
import { toast } from 'react-hot-toast';

import {
	MessagesData,
	MessageSubscriptionData,
	MessageVariables,
} from '../../../../util/types';
import MessageOperations from '../../../../graphql/operations/messages';
import SkeletonLoader from '../../../SkeletonLoader';
import { useEffect } from 'react';
import MessageItem from './MessageItem';

type MessagesProps = {
	userId: string;
	conversationId: string;
};

const Messages = ({ userId, conversationId }: MessagesProps) => {
	const { data, loading, error, subscribeToMore } = useQuery<
		MessagesData,
		MessageVariables
	>(MessageOperations.Queries.messages, {
		variables: {
			conversationId,
		},
		onError: ({ message }) => {
			toast.error(message);
		},
	});

	const subscribeToNewMessages = (conversationId: string) => {
		subscribeToMore({
			document: MessageOperations.Subscriptions.messageSent,
			variables: {
				conversationId,
			},
			updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
				if (!subscriptionData) return prev;
				const newMessage = subscriptionData.data.messageSent;
				return Object.assign({}, prev, {
					messages: [newMessage, ...prev.messages],
				});
			},
		});
	};

	useEffect(() => {
		subscribeToNewMessages(conversationId);
	}, [conversationId]);

	if (error) return null;

	return (
		<Flex direction='column' justify='flex-end' overflow='hidden'>
			{loading && (
				<Stack spacing={4} px={4}>
					<SkeletonLoader count={3} height='4rem' />
				</Stack>
			)}
			{data?.messages && (
				<Flex direction='column-reverse' overflow='scroll' height='100%'>
					{data.messages.map((message) => (
						<MessageItem
							key={message.id}
							message={message}
							sentByMe={message.user.id === userId}
						/>
					))}
				</Flex>
			)}
		</Flex>
	);
};

export default Messages;
