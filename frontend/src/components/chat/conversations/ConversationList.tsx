import { Box, Text } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useState } from 'react';

import ConversationModal from './modal/ConversationModal';

type ConversationListProps = {
	session: Session;
};

const ConversationList = ({ session }: ConversationListProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

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
			<ConversationModal isOpen={isOpen} onClose={onClose} session={session}/>
		</Box>
	);
};

export default ConversationList;
