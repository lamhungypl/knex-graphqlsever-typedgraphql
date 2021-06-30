import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation } from 'type-graphql';
import { RegisterInput } from '../dto/RegisterInput';
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

  @Mutation(() => User)
  async addUser(@Arg('input') input: RegisterInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const [user] = await db('users').insert(input).returning('*');
    console.log(user);
    return user;
  }
}
