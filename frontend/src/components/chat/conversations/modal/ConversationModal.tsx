import { useLazyQuery, useMutation } from '@apollo/client';
import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Session } from 'next-auth';
import { useRouter } from 'next/router';

import UserOperations from '../../../../graphql/operations/user';
import {
	SearchedUser,
	SearchUsersData,
	SearchUsersInput,
	CreateConversationVariables,
	CreateConversationData,
} from '../../../../util/types';
import Participants from './Participants';
import UserSearchList from './UserSearchList';
import ConversationOperations from '../../../../graphql/operations/conversation';

type ModalProps = {
	isOpen: boolean;
	onClose: () => void;
	session: Session;
};

const ConversationModal = ({ isOpen, onClose, session }: ModalProps) => {
	const [username, setUsername] = useState<string>('');
	const [participants, setParticipants] = useState<Array<SearchedUser>>([]);
	const [searchUsers, { data, loading, error }] = useLazyQuery<
		SearchUsersData,
		SearchUsersInput
	>(UserOperations.Queries.searchUsers);
	const [createConversation, { loading: conversationLoading }] = useMutation<
		CreateConversationData,
		CreateConversationVariables
	>(ConversationOperations.Mutations.createConversation);
	const router = useRouter();

	const {
		user: { id: userId },
	} = session;

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		searchUsers({ variables: { username } });
	};

	const addParticipant = (user: SearchedUser) => {
		setParticipants((prev) => [...prev, user]);
		setUsername('');
	};

	const removeParticipant = (userId: string) => {
		setParticipants((prev) => prev.filter((user) => user.id !== userId));
	};

	const onCreateConversation = async () => {
		const participantIds = [userId, ...participants.map((user) => user.id)];
		try {
			const { data } = await createConversation({
				variables: {
					participantIds,
				},
			});
			if (!data?.createConversation) {
				throw new Error('Failed to create conversation');
			}
			const {
				createConversation: { conversationId },
			} = data;

			router.push({ query: { conversationId } });
			toast.success('Conversation created!');

			setParticipants([]);
			setUsername('');
			onClose();
		} catch (error: any) {
			console.error(error);
			toast.error('Something went wrong! Please try again later.');
		}
	};

	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bg='#2d2d2d' pb={4}>
					<ModalHeader>Start a conversation...</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form onSubmit={onSubmit}>
							<Stack spacing={4}>
								<Input
									placeholder='Username...'
									onChange={(e) => setUsername(e.target.value)}
								/>
								<Button type='submit' disabled={!username} isLoading={loading}>
									<Text color='whiteAlpha.800'>Search</Text>
								</Button>
							</Stack>
						</form>
						{data?.searchUsers && (
							<UserSearchList
								users={data.searchUsers}
								addParticipant={addParticipant}
							/>
						)}
						{participants.length !== 0 && (
							<>
								<Participants
									participants={participants}
									removeParticipant={removeParticipant}
								/>
								<Button
									bg='brand.100'
									width='100%'
									mt={6}
									_hover={{ bg: 'brand.100' }}
									onClick={() => onCreateConversation()}
									isLoading={conversationLoading}
								>
									Start Conversation
								</Button>
							</>
						)}
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ConversationModal;
