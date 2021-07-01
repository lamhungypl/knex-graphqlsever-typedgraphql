import { ApolloError } from 'apollo-server-express';
import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation, Field, ObjectType, Authorized } from 'type-graphql';
import { RegisterInput } from '../dto/RegisterInput';
import { UpdateInput } from '../dto/UpdateInput';
import { User } from '../entities/User';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordInput } from '../dto/ChangePassword';
import { LoginInput } from '../dto/LoginInput';
import { SECRET } from '../constants/constants';

@ObjectType()
class AuthResponse {
  @Field()
  token: string;

  @Field()
  user: User;
}

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
  @Authorized()
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

  @Mutation(() => AuthResponse)
  async login(@Arg('input') input: LoginInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { user_id, password } = input;
    try {
      const [user] = await db('users').where({ user_id });
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
  async register(@Arg('input') input: RegisterInput, @Ctx() ctx) {
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
