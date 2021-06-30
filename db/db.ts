import Knex from 'knex';
import * as knexConfig from '../knexfile';

const config = knexConfig.development;
export const db = Knex(config);
