import { createTestClient } from 'apollo-server-integration-testing';
import createApolloServer from '../../server';

export const testClient = async () => {
  const { server } = await createApolloServer();
  return createTestClient({ apolloServer: server });
};
