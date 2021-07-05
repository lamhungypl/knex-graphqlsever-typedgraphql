import { Knex } from 'knex';
import { dataLoader } from '../dataloaders/dataloader';

export type MyContext = {
  req: any;
  res: any;
  db: Knex;
  userId: any;
  dataLoader: typeof dataLoader;
};
