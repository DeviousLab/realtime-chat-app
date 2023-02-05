import { Box, Stack, Text } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { ConversationPopulated } from '../../../../../backend/src/util/types';
import SkeletonLoader from '../../SkeletonLoader';
import ConversationItem from './ConversationItem';
import ConversationModal from './modal/ConversationModal';

type ConversationListProps = {
	session: Session;
	conversations: Array<ConversationPopulated>;
	onViewConversation: (
		conversationId: string,
		hasSeenLatestMessage: boolean
	) => void;
	loading: boolean;
};

const ConversationList = ({
	session,
	conversations,
	onViewConversation,
	loading,
}: ConversationListProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const router = useRouter();

	const onOpen = () => setIsOpen(true);
	const onClose = () => setIsOpen(false);

	return (
		<Box width='100%' flexDirection='column'>
			<Box
				py={2}
				px={4}
				mb={4}
				bg='blackAlpha.300'
				borderRadius={4}
				cursor='pointer'
				onClick={onOpen}
			>
				<Text textAlign='center' color='whiteAlpha.800' fontWeight={500}>
					Find or start a conversation
				</Text>
			</Box>
			<ConversationModal isOpen={isOpen} onClose={onClose} session={session} />
			{loading ? (
				<Stack py={2} width='100%'>
					<SkeletonLoader count={5} height='4rem' width='12.5rem' />
				</Stack>
			) : (
				conversations.map((conversation) => {
					const participants = conversation.participants.find(
						(participant) => participant.user.id !== session.user.id
					);
					if (!participants) {
						throw new Error('No participants found');
					};
					return (
						<ConversationItem
							key={conversation.id}
							conversation={conversation}
							onClick={() =>
								onViewConversation(
									conversation.id,
									participants?.hasSeenLatestMessage
								)
							}
							hasSeenLatestMessage={participants?.hasSeenLatestMessage}
							isSelected={conversation.id === router.query.conversationId}
							userId={session.user.id}
						/>
					);
				})
			)}
		</Box>
	);
};

export default ConversationList;
