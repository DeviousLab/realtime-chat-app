import { useMutation } from '@apollo/client';
import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { signOut } from 'next-auth/react';

import { ConversationPopulated } from '../../../../../backend/src/util/types';
import SkeletonLoader from '../../SkeletonLoader';
import ConversationItem from './ConversationItem';
import ConversationModal from './modal/ConversationModal';
import ConversationOperations from '../../../graphql/operations/conversation';

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

	const [deleteConversation] = useMutation<{
		deleteConversation: boolean;
		conversationId: string;
	}>(ConversationOperations.Mutations.deleteConversation);

	const onOpen = () => setIsOpen(true);
	const onClose = () => setIsOpen(false);

	const sortedConversations = [...conversations].sort(
		(a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
	);

	const handleDeleteConversation = async (conversationId: string) => {
		try {
			toast.promise(
				deleteConversation({
					variables: { conversationId },
					update: (cache) => {
						router.replace(typeof process.env.NEXT_PUBLIC_BASE_URL === 'string' ? process.env.NEXT_PUBLIC_BASE_URL : '');
					},
				}),
				{
					loading: 'Deleting conversation...',
					success: 'Conversation deleted',
					error: 'Error deleting conversation',
				}
			);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Box width='24rem' flexDirection='column' position="relative">
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
				sortedConversations.map((conversation) => {
					const participants = conversation.participants.find(
						(participant) => participant.user.id !== session.user.id
					);
					if (!participants) {
						throw new Error('No participants found');
					}
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
							onDeleteConversation={handleDeleteConversation}
							isSelected={conversation.id === router.query.conversationId}
							userId={session.user.id}
						/>
					);
				})
			)}
			<Box position="absolute" bottom={0} left={0} px={8} py={6} width="100%">
				<Button width="100%" onClick={() => signOut()}>
					Sign Out
				</Button>
			</Box>
		</Box>
	);
};

export default ConversationList;
