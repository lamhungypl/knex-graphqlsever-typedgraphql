import { ApolloError } from 'apollo-server';
import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation } from 'type-graphql';
import { RegisterInput } from '../dto/RegisterInput';
import { UpdateInput } from '../dto/UpdateInput';
import { User } from '../entities/User';

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
  @Mutation(() => User)
  async updateUser(@Arg('userId') userId: string, @Arg('input') input: UpdateInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { user_id, ...userInfo } = input;
    try {
      const [matchUser] = await db('users').where({ user_id: userId });
      if (!matchUser) {
        throw new ApolloError('User not found');
      }
      const [user] = await db('users').where({ user_id: userId }).update(userInfo).returning('*');
      console.log(user);
      return user;
    } catch (error) {
      throw new ApolloError(error.message);
    }
  }
  @Mutation(() => User)
  async deleteUser(@Arg('userId') userId: string, @Ctx() ctx) {
    const db: Knex = ctx.db;
    try {
      const [matchUser] = await db('users').where({ user_id: userId });
      if (!matchUser) {
        throw new ApolloError('User not found');
      }
      const [user] = await db('users').where({ user_id: userId }).delete().returning('*');
      console.log('deleted', user);
      return user;
    } catch (error) {
      throw new ApolloError(error.message);
    }
  }
}
