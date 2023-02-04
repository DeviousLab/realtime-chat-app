import { useQuery } from '@apollo/client';
import { Flex, Stack } from '@chakra-ui/react';
import { toast } from 'react-hot-toast';

import { MessagesData, MessageVariables } from '../../../../util/types';
import MessageOperations from '../../../../graphql/operations/messages';
import SkeletonLoader from '../../../SkeletonLoader';

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
						<p key={message.id}>{message.content}</p>
					))}
				</Flex>
			)}
		</Flex>
	);
};

export default Messages;
