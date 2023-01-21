import { Flex, Stack, Text } from '@chakra-ui/react';
import { SearchedUser } from '../../../../util/types';
import { IoIosCloseCircle } from 'react-icons/io';

type ParticipantsProps = {
	participants: Array<SearchedUser>;
	removeParticipant: (userId: string) => void;
};

const Participants = ({
	participants,
	removeParticipant,
}: ParticipantsProps) => {
	return (
		<Flex mt={6} gap='10px' flexWrap='wrap'>
			{participants.map((user) => (
				<Stack
					key={user.id}
					direction='row'
					align='center'
					bg='whiteAlpha.200'
					borderRadius={4}
					p={2}
				>
					<Text>{user.username}</Text>
					<IoIosCloseCircle
						size={20}
						cursor='pointer'
						onClick={() => removeParticipant(user.id)}
					/>
				</Stack>
			))}
		</Flex>
	);
};

export default Participants;
