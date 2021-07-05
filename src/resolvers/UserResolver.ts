import { ApolloError } from 'apollo-server-express';

import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation, ObjectType, Field } from 'type-graphql';
import { LoginInput } from '../dto/LoginInput';
import { RegisterInput } from '../dto/RegisterInput';
import { User } from '../entities/User';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SECRET } from '../constants/constants';

import { UpdateInput } from '../dto/UpdateInput';
@ObjectType()
class AuthResponse {
  @Field()
  token: string;

  @Field()
  user: User;
}

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

  @Mutation(() => AuthResponse)
  async login(@Arg('payload') payload: LoginInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { username, password } = payload;
    try {
      const [user] = await db('users').where({ username });
      if (!user) {
        throw new ApolloError('User not found');
      }
      const matchPass = await bcrypt.compare(password, user.password);
      if (!matchPass) {
        throw new ApolloError('Username/ password wrong');
      }

      const token = jwt.sign({ id: user.user_id }, SECRET, {
        expiresIn: 3600,
      });
      return { token, user };
    } catch (error) {
      throw new ApolloError(error.message);
    }
  }
  @Mutation(() => User)
  async register(@Arg('payload') payload: RegisterInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { password, username, ...rest } = payload;
    const [user] = await db('users').where({ username });
    if (user) {
      throw new ApolloError('This User is already taken');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const timestamp = Date.now();

    const [newUser] = await db('users')
      .insert({ username, ...rest, password: hashPassword, created_at: timestamp, updated_at: timestamp })
      .returning('*');
    console.log({ newUser });
    return newUser;
  }
  @Mutation(() => User)
  async addUser(@Arg('input') input: RegisterInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const [user] = await db('users').insert(input).returning('*');
    console.log(user);
    return user;
  }
  @Mutation(() => User)
  async updateUser(@Arg('userId') userId: string, @Arg('payload') payload: UpdateInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { user_id, ...userInfo } = payload;
    try {
      const [matchUser] = await db('users').where({ user_id: userId });
      if (!matchUser) {
        throw new ApolloError('User not found');
      }

      const timestamp = Date.now();

      const [user] = await db('users')
        .where({ user_id: userId })
        .update({ ...userInfo, updated_at: timestamp })
        .returning('*');
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
