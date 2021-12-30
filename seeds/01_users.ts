import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  const hasPassword = await bcrypt.hash('a123456', 10);
  // Inserts seed entries
  await knex('users').insert([
    { username: 'username1', password: hasPassword, email: 'useremail@gmaiil.com' },
    { username: 'username2', password: hasPassword, email: 'useremail@gmaiil.com' },
    { username: 'username3', password: hasPassword, email: 'useremail@gmaiil.com' },
  ]);
}
