import knex, { Knex } from 'knex';
import * as knexConfig from '../knexfile';
import KnexTinyLogger from 'knex-tiny-logger';

const config = knexConfig.development;
export const db: Knex = KnexTinyLogger(knex(config));
