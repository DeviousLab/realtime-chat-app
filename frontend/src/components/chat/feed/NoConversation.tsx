import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { BiMessageSquareDots } from 'react-icons/bi';
import { useQuery } from '@apollo/client';
import { Session } from 'next-auth';

import { ConversationsData } from '../../../util/types';
import ConversationOperations from '../../../graphql/operations/conversation';
import ConversationModal from '../conversations/modal/ConversationModal';

type NoConversationProps = {
	session: Session;
};

const NoConversation = ({ session }: NoConversationProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { data, loading, error } = useQuery<ConversationsData>(
		ConversationOperations.Queries.getConversations
	);

	if (!data?.getConversations || loading || error) return null;
	const { getConversations } = data;
	const hasConversations = getConversations.length;

	const onOpen = () => setIsOpen(true);
	const onClose = () => setIsOpen(false);

	const text = hasConversations
		? 'Select a Conversation'
		: "Let's Get Started 🥳";

	return (
		<Flex height='100%' justify='center' align='center'>
			<Stack spacing={10} align='center'>
				<Text fontSize={40}>{text}</Text>
				{hasConversations ? (
					<BiMessageSquareDots fontSize={90} />
				) : (
					<>
						<Box
							py={2}
							px={4}
							mb={4}
							bg='brand.100'
							borderRadius={4}
							cursor='pointer'
							onClick={onOpen}
						>
							<Text textAlign='center' color='whiteAlpha.800' fontWeight={500}>
								Start a conversation!
							</Text>
						</Box>
						<ConversationModal
							isOpen={isOpen}
							onClose={onClose}
							session={session}
						/>
					</>
				)}
			</Stack>
		</Flex>
	);
};
export default NoConversation;
