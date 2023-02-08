import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import * as dotenv from 'dotenv';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { PubSub } from 'graphql-subscriptions';
import cors from 'cors';
import bodyParser from 'body-parser';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
async function main() {
    dotenv.config();
    const app = express();
    const httpServer = http.createServer(app);
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const prisma = new PrismaClient();
    const pubsub = new PubSub();
    const port = process.env.PORT || 3001;
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql/subscriptions',
    });
    const serverCleanup = useServer({ schema, context: async (ctx) => {
            if (ctx.connectionParams && ctx.connectionParams.session) {
                const { session } = ctx.connectionParams;
                return { session, prisma, pubsub };
            }
            return { session: null, prisma, pubsub };
        } }, wsServer);
    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
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
        ],
    });
    await server.start();
    const corsOptions = {
        origin: process.env.CLIENT_ORIGIN,
        credentials: true,
    };
    app.use("/graphql", cors(corsOptions), bodyParser.json(), expressMiddleware(server, {
        context: async ({ req }) => {
            const session = await getSession({ req });
            return { session: session, prisma, pubsub };
        },
    }));
    await new Promise((resolve) => httpServer.listen({ port }, resolve));
    console.log('🚀 Server ready at http://localhost:4000/graphql');
}
main().catch((error) => {
    console.error(error);
});
