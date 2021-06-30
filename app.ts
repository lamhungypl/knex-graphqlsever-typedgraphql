import 'reflect-metadata';
import { ApolloServer, gql } from 'apollo-server';
// import { buildSchema } from 'graphql';
import { BookResolver } from './resolvers/BookResolvers';
import { buildSchema } from 'type-graphql';

import { UserResolver } from './resolvers/UserResolver';
import { db as database } from './db/db';

async function main() {
  const schema = await buildSchema({
    resolvers: [BookResolver, UserResolver],
  });
  const server = new ApolloServer({
    schema: schema,
    context: (req, res) => {
      return {
        req,
        res,
        db: database,
      };
    },
  });
  server.listen().then(({ url }) => {
    console.log(`server listening at ${url}`);
  });
}
main();
