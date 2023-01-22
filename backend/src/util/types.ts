import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth"

import { ConversationPopulate, ParticipantPopulate } from "../graphql/resolvers/conversation";

export interface GraphQLContext {
  session: Session | null;
  prisma: PrismaClient;
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