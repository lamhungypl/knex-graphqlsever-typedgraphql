import knex, { Knex } from 'knex';
import * as knexConfig from '../knexfile';
import KnexTinyLogger from 'knex-tiny-logger';

const config = process.env.NODE_ENV === 'test' ? knexConfig.test : knexConfig.development;
export const db: Knex = process.env.NODE_ENV === 'development' ? KnexTinyLogger(knex(config)) : knex(config);
