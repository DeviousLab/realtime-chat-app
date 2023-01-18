import { useLazyQuery } from '@apollo/client';
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

import UserOperations from '../../../../graphql/operations/user';
import { SearchUsersData, SearchUsersInput } from '../../../../util/types';

type ModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

const ConversationModal = ({ isOpen, onClose }: ModalProps) => {
	const [username, setUsername] = useState<string>('');
	const [searchUsers, { data, loading, error }] = useLazyQuery<
		SearchUsersData,
		SearchUsersInput
	>(UserOperations.Queries.searchUsers);

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		searchUsers({ variables: { username } });
	};

	console.log(data)

	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bg='#2d2d2d' pb={4}>
					<ModalHeader>Modal Title</ModalHeader>
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
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ConversationModal;
