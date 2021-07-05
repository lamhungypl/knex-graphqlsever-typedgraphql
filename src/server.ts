import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-express';

import { buildSchema } from 'type-graphql';

import { db as database } from '../db/db';
import { authChecker } from './middlewares/authMiddleware';
import { BookResolver } from './resolvers/BookResolvers';
import { UserResolver } from './resolvers/UserResolver';
import { PostResolver } from './resolvers/PostResolver';
import { dataLoader } from './dataloaders/dataloader';

export const createApolloServer = async () => {
  const schema = await buildSchema({
    authChecker: authChecker,
    resolvers: [BookResolver, UserResolver, PostResolver],
  });
  const server = new ApolloServer({
    schema: schema,
    context: (req, res) => {
      return {
        req,
        res,
        db: database,
        dataLoader: dataLoader,
      };
    },
  });
  return { server, schema };
};

export default createApolloServer;
