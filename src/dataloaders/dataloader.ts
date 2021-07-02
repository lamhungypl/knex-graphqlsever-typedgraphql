import DataLoader from 'dataloader';
import { db } from '../../db/db';

export const dataLoader = {
  userDataLoader: new DataLoader<any, any, unknown>(async ids => {
    const users = await db('users').whereIn('user_id', ids);

    return ids.map(id => users.find(user => user.user_id === id));
  }),
};
