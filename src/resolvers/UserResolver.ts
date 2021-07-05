import { ApolloError } from 'apollo-server-express';

import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation, ObjectType, Field } from 'type-graphql';
import { LoginInput } from '../dto/LoginInput';
import { RegisterInput } from '../dto/RegisterInput';
import { User } from '../entities/User';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
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
    const { user_id, password } = payload;
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
  async addUser(@Arg('input') input: RegisterInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const [user] = await db('users').insert(input).returning('*');
    console.log(user);
    return user;
  }
}
