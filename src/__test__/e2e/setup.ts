import { createTestClient } from 'apollo-server-integration-testing';
import express from 'express';
import createApolloServer from '../../server';

export const testClient = async () => {
  const { server } = await createApolloServer();
  return createTestClient({ apolloServer: server });
};
export const createTestServer = async () => {
  const app = express();

  const { server } = await createApolloServer();

  server.applyMiddleware({ app });

  return app;
};
