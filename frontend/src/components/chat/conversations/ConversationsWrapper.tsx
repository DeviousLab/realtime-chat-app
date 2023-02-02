import { useQuery } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import ConversationList from './ConversationList';
import ConversationOperations from '../../../graphql/operations/conversation';
import { ConversationsData } from '../../../util/types';
import { ConversationPopulated } from '../../../../../backend/src/util/types';

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
	const router = useRouter();

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
				const newConversation = subscriptionData.data.conversationCreated;
				return Object.assign({}, prev, {
					getConversations: [newConversation, ...prev.getConversations],
				});
			},
		});
	};

	const onViewConversation = async (conversationId: string) => {
		router.push({ query: { conversationId } });
	};

	useEffect(() => {
		subscribeToNewConversations();
	}, []);


	return (
		<Box
			width={{ base: '100%', md: '25rem' }}
			bg='whiteAlpha.50'
			py={6}
			px={3}
			display={{
				base: router.query.conversationId ? 'none' : 'flex',
				md: 'flex',
			}}
		>
			<ConversationList
				session={session}
				conversations={conversationData?.getConversations || []}
				onViewConversation={onViewConversation}
			/>
		</Box>
	);
};

export default ConversationsWrapper;
