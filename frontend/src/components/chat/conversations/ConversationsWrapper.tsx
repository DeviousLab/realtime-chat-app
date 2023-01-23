import { useQuery } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { Session } from 'next-auth';

import ConversationList from './ConversationList';
import ConversationOperations from '../../../graphql/operations/conversation';
import { ConversationsData } from '../../../util/types';
import { ConversationPopulated } from '../../../../../backend/src/util/types';
import { useEffect } from 'react';

type ConversationsWrapperProps = {
	session: Session;
};

const ConversationsWrapper = ({ session }: ConversationsWrapperProps) => {
	const {
		data: conversationData,
		loading: conversationLoading,
		error: conversationError,
		subscribeToMore,
	} = useQuery<ConversationsData, null>(
		ConversationOperations.Queries.getConversations
	);

	const subscribeToNewConversations = () => {
		subscribeToMore({
			document: ConversationOperations.Subscriptions.conversationCreated,
			updateQuery: (
				prev,
				{
					subscriptionData,
				}: {
					subscriptionData: {
						data: { conversationCreated: ConversationPopulated };
					};
				}
			) => {
				if (!subscriptionData.data) return prev;
				console.log('subscriptionData: ', subscriptionData)
				const newConversation = subscriptionData.data.conversationCreated;
				return Object.assign({}, prev, {
					getConversations: [newConversation, ...prev.getConversations],
				});
			},
		});
	};

	useEffect(() => {
		subscribeToNewConversations();
	}, []);

	console.log(conversationData);
	return (
		<Box width={{ base: '100%', md: '25rem' }} bg='whiteAlpha.50' py={6} px={3}>
			<ConversationList
				session={session}
				conversations={conversationData?.getConversations || []}
			/>
		</Box>
	);
};

export default ConversationsWrapper;
