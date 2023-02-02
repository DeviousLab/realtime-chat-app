import { Flex } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/router';
import Input from './messages/MessageInput';
import Messages from './messages/Messages';
import MessagesHeader from './messages/MessagesHeader';

type FeedWrapperProps = {
	session: Session;
};

const FeedWrapper = ({ session }: FeedWrapperProps) => {
	const router = useRouter();
	const { conversationId } = router.query;
	const { user: { id: userId } } = session;

	return (
		<Flex
			display={{ base: conversationId ? 'flex' : 'none', md: 'flex' }}
			direction='column'
			width='100%'
		>
			{conversationId && typeof conversationId === 'string' ? (
				<>
					<Flex
						direction='column'
						justify='space-between'
						overflow='hidden'
						flexGrow={1}
					>
						<MessagesHeader conversationId={conversationId} userId={userId}/>
						<Messages userId={userId} conversationId={conversationId}/>
					</Flex>
					<Input session={session} conversationId={conversationId} />
				</>
			) : (
				<div>No Conversation</div>
			)}
		</Flex>
	);
};

export default FeedWrapper;
