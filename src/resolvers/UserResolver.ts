import { ApolloError, AuthenticationError, ForbiddenError } from 'apollo-server-express';

import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation, ObjectType, Field, Authorized, FieldResolver, Root } from 'type-graphql';
import { LoginInput } from '../dto/LoginInput';
import { RegisterInput } from '../dto/RegisterInput';
import { User } from '../entities/User';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SECRET } from '../constants/constants';
import { ChangePasswordInput } from '../dto/ChangePassword';
import { UpdateInput } from '../dto/UpdateInput';
import { ArgUserInfo } from '../dto/ArgUserInfo';

import { Post } from '../entities/Post';
import { MyContext } from '../@types/types';

@ObjectType()
class AuthResponse {
  @Field()
  token: string;

  @Field()
  user: User;
}

@Resolver(() => User)
export class UserResolver {
  // constructor(private bookService: BookService) {}

  @FieldResolver(() => [Post])
  async posts(@Root() user: User, @Ctx() ctx: MyContext) {
    const {
      dataLoader: { postLoader },
    } = ctx;
    const posts = await postLoader.load(user.user_id);

    return posts;
  }

  @Query(() => [User])
  async users(@Ctx() ctx, @Arg('info') info: ArgUserInfo) {
    const db: Knex = ctx.db;
    const { limit, offset, email } = info;
    const users = await db.select().table('users').where('email', 'like', `%${email}%`).limit(limit).offset(offset);
    console.log({ users });
    return users;
  }

  @Mutation(() => User)
  @Authorized()
  async changePassword(@Arg('changePassInput') changePassInput: ChangePasswordInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { username, currentPass, newPass, confirmPass } = changePassInput;
    try {
      if (newPass !== confirmPass) {
        throw new ApolloError('Password and confirm does not match');
      }

      const [matchUser] = await db('users').where({ username: username });
      if (!matchUser) {
        throw new ApolloError('User not found');
      }
      const matchedPass = await bcrypt.compare(currentPass, matchUser.password);

      if (!matchedPass) {
        throw new ApolloError('Username/ password wrong');
      }
      const hashPass = await bcrypt.hash(newPass, 10);

      const [user] = await db('users')
        .where({ username: username })
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

  @Mutation(() => AuthResponse)
  async login(@Arg('payload') payload: LoginInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { username, password } = payload;
    try {
      const [user] = await db('users').where({ username });
      if (!user) {
        throw new AuthenticationError('User not found');
      }
      const matchPass = await bcrypt.compare(password, user.password);
      if (!matchPass) {
        throw new AuthenticationError('Username/ password wrong');
      }

      const token = jwt.sign({ id: user.user_id }, SECRET, {
        expiresIn: 3600,
      });
      return { token, user };
    } catch (error) {
      throw new AuthenticationError(error.message);
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

  /*
  @Mutation(() => User)
  async addUser(@Arg('input') input: RegisterInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const [user] = await db('users').insert(input).returning('*');
    console.log(user);
    return user;
  }
  */

  @Mutation(() => User)
  @Authorized()
  async updateUser(@Arg('userId') userId: string, @Arg('payload') payload: UpdateInput, @Ctx() ctx: MyContext) {
    const { db, userId: userIdCtx } = ctx;
    const { ...userInfo } = payload;
    try {
      const [matchUser] = await db('users').where({ user_id: userId });
      if (!matchUser) {
        throw new ApolloError('User not found');
      }
      if (matchUser.user_id != userIdCtx) {
        throw new ForbiddenError('Permission required');
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
  @Authorized()
  async deleteUser(@Arg('userId') userId: string, @Ctx() ctx: MyContext) {
    const { db, userId: userIdCtx } = ctx;
    try {
      const [matchUser] = await db('users').where({ user_id: userId });
      if (!matchUser) {
        throw new ApolloError('User not found');
      }
      if (matchUser.user_id != userIdCtx) {
        throw new ForbiddenError('Permission required');
      }
      const [user] = await db('users').where({ user_id: userId }).delete().returning('*');
      console.log('deleted', user);
      return user;
    } catch (error) {
      throw new ApolloError(error.message);
    }
  }
}
