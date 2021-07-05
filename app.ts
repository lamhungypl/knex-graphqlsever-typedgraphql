import 'reflect-metadata';
import express from 'express';

import * as fs from 'fs';

import { printSchema } from 'graphql';

import createApolloServer from './src/server';

async function main() {
  const app = express();

  const { server, schema } = await createApolloServer();

  server.applyMiddleware({ app });

  app.listen(4000, () => {
    const schemaFile = printSchema(schema);
    fs.writeFileSync(__dirname + '/src/schema/schema.graphql', schemaFile);

    console.log(`server listening at ${4000}`);
  });
}
main();
