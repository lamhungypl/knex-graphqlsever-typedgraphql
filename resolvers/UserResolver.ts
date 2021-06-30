import { Knex } from 'knex';
import { Query, Resolver, Ctx } from 'type-graphql';
import { User } from '../src/entities/User';

@Resolver()
export class UserResolver {
  // constructor(private bookService: BookService) {}
  @Query(() => [User])
  async users(@Ctx() ctx) {
    const db: Knex = ctx.db;
    const users = await db.select().table('users');
    console.log({ users });
    return users;
  }
}
