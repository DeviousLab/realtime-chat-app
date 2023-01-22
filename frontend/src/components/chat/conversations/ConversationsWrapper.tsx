import { useQuery } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { Session } from 'next-auth';

import ConversationList from './ConversationList';
import ConversationOperations from '../../../graphql/operations/conversation';
import { ConversationsData } from '../../../util/types';

type ConversationsWrapperProps = {
	session: Session;
};

const ConversationsWrapper = ({ session }: ConversationsWrapperProps) => {
	const {
		data: conversationData,
		loading: conversationLoading,
		error: conversationError,
	} = useQuery<ConversationsData, null>(
		ConversationOperations.Queries.getConversations
	);
	return (
		<Box width={{ base: '100%', md: '25rem' }} bg='whiteAlpha.50' py={6} px={3}>
			<ConversationList session={session} />
		</Box>
	);
};

export default ConversationsWrapper;
