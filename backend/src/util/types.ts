import { Prisma, PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { Context } from 'graphql-ws/lib/server';
import { DefaultUser } from 'next-auth';
import { Session } from 'next-auth';

import {
	ConversationPopulate,
	ParticipantPopulate,
} from '../graphql/resolvers/conversation';
import { MessagePopulate } from '../graphql/resolvers/messages';


declare module 'next-auth' {
  interface Session {
		user: DefaultUser & {
			id: string;
      username: string;
      image: string;
		};
	}
}

export interface GraphQLContext {
	session: Session | null;
	prisma: PrismaClient;
	pubsub: PubSub;
}

export interface SubscriptionContext extends Context {
	connectionParams: {
		session?: Session;
	};
}

export interface CreateUserResponse {
	success: boolean;
	error?: string;
}

export type ConversationPopulated = Prisma.ConversationGetPayload<{
	include: typeof ConversationPopulate;
}>;

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
	include: typeof ParticipantPopulate;
}>;

export interface ConversationCreatedSubscriptionPayload {
	conversationCreated: ConversationPopulated;
}

export interface SendMessageArgs {
	id: string;
	conversationId: string;
	userId: string;
	content: string;
}

export type MessagePopulated = Prisma.MessageGetPayload<{
	include: typeof MessagePopulate;
}>;

export interface MessageSendSubscriptionPayload {
	messageSent: Prisma.MessageGetPayload<{}>;
}

export interface ConversationUpdatedSubscriptionPayload {
	conversationUpdated: ConversationPopulated;
}

export interface ConversationDeletedSubscriptionPayload {
	conversationDeleted: ConversationPopulated;
}
