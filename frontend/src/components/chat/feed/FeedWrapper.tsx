import { Flex } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/router';

type FeedWrapperProps = {
	session: Session;
};

const FeedWrapper = ({ session }: FeedWrapperProps) => {
	const router = useRouter();
	const { conversationId } = router.query;
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
						{conversationId}
					</Flex>
				</>
			) : (
				<div>No Conversation</div>
			)}
		</Flex>
	);
};

export default FeedWrapper;
