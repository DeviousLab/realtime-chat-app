import { Box, Text } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { ConversationPopulated } from '../../../../../backend/src/util/types';
import ConversationItem from './ConversationItem';
import ConversationModal from './modal/ConversationModal';

type ConversationListProps = {
	session: Session;
	conversations: Array<ConversationPopulated>;
	onViewConversation: (conversationId: string) => void;
};

const ConversationList = ({
	session,
	conversations,
	onViewConversation,
}: ConversationListProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const router = useRouter();

	const onOpen = () => setIsOpen(true);
	const onClose = () => setIsOpen(false);

	return (
		<Box width='100%'>
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
			{conversations.map((conversation) => (
				<ConversationItem
					key={conversation.id}
					conversation={conversation}
					onClick={() => onViewConversation(conversation.id)}
					isSelected={conversation.id === router.query.conversationId}
					userId={session.user.id}
				/>
			))}
		</Box>
	);
};

export default ConversationList;
