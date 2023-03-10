import { gql, useMutation, useQuery, useSubscription } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import ConversationList from './ConversationList';
import ConversationOperations from '../../../graphql/operations/conversation';
import {
	ConversationDeletedData,
	ConversationsData,
	ConversationUpdatedData,
} from '../../../util/types';
import {
	ConversationPopulated,
	ParticipantPopulated,
} from '../../../util/types';

type ConversationsWrapperProps = {
	session: Session;
};

const ConversationsWrapper = ({ session }: ConversationsWrapperProps) => {
	const {
		data: conversationData,
		loading: conversationLoading,
		error: conversationError,
		subscribeToMore,
	} = useQuery<ConversationsData>(
		ConversationOperations.Queries.getConversations
	);

	const [markConversationAsRead] = useMutation<
		{ markConversationAsRead: boolean },
		{ userId: string; conversationId: string }
	>(ConversationOperations.Mutations.markConversationAsRead);

	useSubscription<ConversationUpdatedData>(
		ConversationOperations.Subscriptions.conversationUpdated,
		{
			onData: ({ client, data }) => {
				const { data: subscriptionData } = data;
				if (!subscriptionData) return;

				const { conversationUpdated } = subscriptionData;

				const currentConversation =
					conversationUpdated.id === router.query.conversationId;
				if (currentConversation) {
					onViewConversation(router.query.conversationId as string, true);
				}
			},
		}
	);

	useSubscription<ConversationDeletedData>(
		ConversationOperations.Subscriptions.conversationDeleted,
		{
			onData: ({ client, data }) => {
				const { data: subscriptionData } = data;
				if (!subscriptionData) return;

				const { conversationDeleted } = subscriptionData;

				const existingConversations = client.readQuery<ConversationsData>({
					query: ConversationOperations.Queries.getConversations,
				});
				if (!existingConversations) return;

				const { getConversations } = existingConversations;

				client.writeQuery<ConversationsData>({
					query: ConversationOperations.Queries.getConversations,
					data: {
						getConversations: getConversations.filter(
							(conversation) => conversation.id !== conversationDeleted.id
						),
					},
				});
				router.push('/');
			},
		}
	);

	const router = useRouter();

	const subscribeToNewConversations = () => {
		subscribeToMore({
			document: ConversationOperations.Subscriptions.conversationCreated,
			updateQuery: (
				prev,
				{
					subscriptionData,
				}: {
					subscriptionData: {
						data: { conversationCreated: ConversationPopulated };
					};
				}
			) => {
				if (!subscriptionData.data) return prev;
				const newConversation = subscriptionData.data.conversationCreated;
				return Object.assign({}, prev, {
					getConversations: [newConversation, ...prev.getConversations],
				});
			},
		});
	};

	const onViewConversation = async (
		conversationId: string,
		hasSeenLatestMessage: boolean
	) => {
		router.push({ query: { conversationId } });

		if (hasSeenLatestMessage) return;
		try {
			await markConversationAsRead({
				variables: {
					userId: session.user.id,
					conversationId,
				},
				optimisticResponse: {
					markConversationAsRead: true,
				},
				update: (cache) => {
					const participantsFragment = cache.readFragment<{
						participants: Array<ParticipantPopulated>;
					}>({
						id: `Conversation:${conversationId}`,
						fragment: gql`
							fragment Participants on Conversation {
								participants {
									user {
										id
										username
									}
									hasSeenLatestMessage
								}
							}
						`,
					});
					if (!participantsFragment) return;

					const participants = [...participantsFragment.participants];
					const participantIndex = participants.findIndex(
						(participant) => participant.user.id !== session.user.id
					);
					if (participantIndex === -1) return;
					const userParticipant = participants[participantIndex];
					participants[participantIndex] = {
						...userParticipant,
						hasSeenLatestMessage: true,
					};

					cache.writeFragment({
						id: `Conversation:${conversationId}`,
						fragment: gql`
							fragment UpdatedParticipants on Conversation {
								participants
							}
						`,
						data: {
							participants,
						},
					});
				},
			});
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		subscribeToNewConversations();
	}, []);

	return (
		<Box
			width={{ base: '100%', md: '25rem' }}
			bg='whiteAlpha.50'
			py={6}
			px={3}
			display={{
				base: router.query.conversationId ? 'none' : 'flex',
				md: 'flex',
			}}
		>
			<ConversationList
				session={session}
				conversations={conversationData?.getConversations || []}
				onViewConversation={onViewConversation}
				loading={conversationLoading}
			/>
		</Box>
	);
};

export default ConversationsWrapper;
