import {ApolloServer} from "apollo-server-fastify";
import {ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core";
import fastify from "fastify";
import {buildSubgraphSchema} from '@apollo/federation';
import gql from "graphql-tag";

import config from './config/index';
import {schema} from './schema';
import {resolvers} from './resolvers';
import {initStorage} from "./storage";
import {registerSchema} from "./schema-registry";
import {logger} from './logger'

function fastifyAppClosePlugin(app) {
    return {
        async serverWillStart() {
            return {
                async drainServer() {
                    await app.close();
                }
            };
        }
    };
}

async function startApolloServer(app, typeDefs, resolvers) {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({typeDefs: gql(typeDefs), resolvers}),
        plugins: [
            fastifyAppClosePlugin(app),
            ApolloServerPluginLandingPageGraphQLPlayground(),
            ApolloServerPluginDrainHttpServer({httpServer: app.server})
        ],
        context: (req) => {
            return {
                uid: req.request.raw.headers['internal-userid']
            };
        },
    });

    await server.start();
    app.register(server.createHandler());

    return server.graphqlPath;
}

(async function main() {
    await initStorage(logger);

    // @ts-ignore
    const app = fastify({logger});

    app.register(require('fastify-cookie'), {
        secret: "my-secret", // for cookies signature
        parseOptions: {}     // options for parsing cookies
    })

    app.setErrorHandler(async (error, request, reply) => {
        logger.error(error);

        reply.status(500).send({error: "Something went wrong"});
    });

    app.get('/health', (request, reply) => {
        reply.send({hello: 'world'})
    })

    try {
        await registerSchema(schema);
        logger.info('starting alerts apollo server');
        const path = await startApolloServer(app, schema, resolvers);

        await app.listen(4560, '0.0.0.0');
        logger.info(`🔔 alerts service is ready at http://localhost:4560${path}`);
    } catch (e) {
        console.error(e);
    }
})();
