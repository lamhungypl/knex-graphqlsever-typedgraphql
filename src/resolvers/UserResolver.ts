import { ApolloError } from 'apollo-server';
import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation } from 'type-graphql';
import { RegisterInput } from '../dto/RegisterInput';
import { UpdateInput } from '../dto/UpdateInput';
import { User } from '../entities/User';
import * as bcrypt from 'bcrypt';
import { ChangePasswordInput } from '../dto/ChangePassword';
@Resolver()
export class UserResolver {
  // constructor(private bookService: B∂ookService) {}
  @Query(() => [User])
  async users(@Ctx() ctx) {
    const db: Knex = ctx.db;
    const users = await db.select().table('users');
    console.log({ users });
    return users;
  }

  @Mutation(() => User)
  async changePassword(@Arg('changePassInput') changePassInput: ChangePasswordInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { user_id, currentPass, newPass, confirmPass } = changePassInput;
    try {
      if (newPass !== confirmPass) {
        throw new ApolloError('Password and confirm does not match');
      }

      const [matchUser] = await db('users').where({ user_id: user_id });
      if (!matchUser) {
        throw new ApolloError('User not found');
      }
      const matchedPass = await bcrypt.compare(currentPass, matchUser.password);

      if (!matchedPass) {
        throw new ApolloError('Username/ password wrong');
      }
      const hashPass = await bcrypt.hash(newPass, 10);

      const [user] = await db('users')
        .where({ user_id: user_id })
        .update({
          password: hashPass,
        })
        .returning('*');
      console.log('changed pass', { ...user, password: hashPass });
      return user;
    } catch (error) {
      throw new ApolloError(error.message);
    }
  }
  @Mutation(() => User)
  async addUser(@Arg('input') input: RegisterInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { password, ...rest } = input;
    const hashPassword = await bcrypt.hash(password, 10);
    const [user] = await db('users')
      .insert({ ...input, password: hashPassword })
      .returning('*');
    console.log({ user });
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
