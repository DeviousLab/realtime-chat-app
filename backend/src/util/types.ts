import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth"

export interface GraphQLContext {
  session: Session | null;
  prisma: PrismaClient;
}

export interface CreateUserResponse {
  success: boolean;
  error?: string;
}