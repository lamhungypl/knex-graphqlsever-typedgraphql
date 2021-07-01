import 'reflect-metadata';
import * as fs from 'fs';
import { ApolloServer, gql } from 'apollo-server';
// import { buildSchema } from 'graphql';
import { BookResolver } from './src/resolvers/BookResolvers';
import { buildSchema } from 'type-graphql';

import { UserResolver } from './src/resolvers/UserResolver';
import { db as database } from './db/db';
import { printSchema } from 'graphql';
import { authChecker } from './src/middlewares/authMiddleware';

async function main() {
  const schema = await buildSchema({
    authChecker: authChecker,
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
    const schemaFile = printSchema(schema);
    fs.writeFileSync(__dirname + '/src/schema/schema.graphql', schemaFile);

    console.log(`server listening at ${url}`);
  });
}
main();
