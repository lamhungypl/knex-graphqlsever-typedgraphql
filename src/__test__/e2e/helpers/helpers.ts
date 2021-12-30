import * as bcrypt from 'bcrypt';
import { db } from '../../../../db/db';

export const createUser = async (username = 'fanuusersme', email = 'useremail@test.com', password = 'a123456') => {
  const [user] = await db('users').where({ username });
  const hashPassword = await bcrypt.hash(password, 10);

  if (user) {
    const [resetUser] = await db('users').where({ username }).update({ email, password: hashPassword }).returning('*');
    return resetUser;
  }

  const timestamp = Date.now();

  const [newUser] = await db('users')
    .insert({ username, email, password: hashPassword, created_at: timestamp, updated_at: timestamp })
    .returning('*');
  return newUser;
};
