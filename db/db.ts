import knex, { Knex } from 'knex';
import * as knexConfig from '../knexfile';
import KnexTinyLogger from 'knex-tiny-logger';

const config = knexConfig.development;
export const db: Knex = process.env.NODE_ENV === 'development' ? KnexTinyLogger(knex(config)) : knex(config);
