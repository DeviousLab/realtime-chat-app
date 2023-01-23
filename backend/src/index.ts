import { ApolloServer } from 'apollo-server-express';
import {
	ApolloServerPluginDrainHttpServer,
	ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import express from 'express';
import http from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import * as dotenv from 'dotenv';
import { getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { PubSub } from 'graphql-subscriptions';


import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { GraphQLContext, SubscriptionContext } from './util/types';

async function main() {
	dotenv.config();
	const app = express();
	const httpServer = http.createServer(app);
	const schema = makeExecutableSchema({ typeDefs, resolvers });
	const corsOptions = {
		origin: process.env.CLIENT_ORIGIN,
		credentials: true,
	};
	const prisma = new PrismaClient();
	const pubsub = new PubSub();

	const wsServer = new WebSocketServer({
		server: httpServer,
		path: '/graphql/subscriptions',
	});
	const serverCleanup = useServer({ schema, context: async (ctx: SubscriptionContext): Promise<GraphQLContext> => {
		if (ctx.connectionParams && ctx.connectionParams.session) {
			const { session } = ctx.connectionParams;
			return { session, prisma, pubsub };
		}
		return { session: null, prisma, pubsub };
	} }, wsServer);

	const server = new ApolloServer({
		schema,
		csrfPrevention: true,
		cache: 'bounded',
		context: async ({ req, res }): Promise<GraphQLContext> => {
			const session = await getSession({ req });
			return { session, prisma, pubsub };
		},
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }),
			{
				async serverWillStart() {
					return {
						async drainServer() {
							await serverCleanup.dispose();
						},
					};
				},
			},
			ApolloServerPluginLandingPageLocalDefault({ embed: true }),
		],
	});
	await server.start();
	server.applyMiddleware({ app, cors: corsOptions });
	await new Promise<void>((resolve) =>
		httpServer.listen({ port: 4000 }, resolve)
	);
	console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

main().catch((error) => {
	console.error(error);
});
