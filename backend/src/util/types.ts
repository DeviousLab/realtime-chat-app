import { Prisma, PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { Context } from "graphql-ws/lib/server";
import { Session } from "next-auth"

import { ConversationPopulate, ParticipantPopulate } from "../graphql/resolvers/conversation";
import { MessagePopulate } from "../graphql/resolvers/messages";

export interface GraphQLContext {
  session: Session | null;
  prisma: PrismaClient;
  pubsub: PubSub
}

export interface SubscriptionContext extends Context {
  connectionParams: {
    session?: Session
  }
}

export interface CreateUserResponse {
  success: boolean;
  error?: string;
}

export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof ConversationPopulate
}>

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof ParticipantPopulate
}>

export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated
}

export interface SendMessageArgs {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}

export type MessagePopulated = Prisma.MessageGetPayload<{
  include: typeof MessagePopulate
}>

export interface MessageSendSubscriptionPayload {
  messageSent: Prisma.MessageGetPayload<{}>
}