import * as Relay from 'graphql-relay';
import { ApolloError } from 'apollo-server-express';
import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation, FieldResolver, Root, Args, Authorized } from 'type-graphql';
import { MyContext } from '../@types/types';
import { AddPostInput } from '../dto/AddPostInput';
import { PostArgs } from '../dto/PostArgs';

import { UpdatePostInput } from '../dto/UpdatePostInput';
import { Post, PostConnection } from '../entities/Post';
import { User } from '../entities/User';
import { ConnectionArgs } from '../dto/RelayCursorArgs';

@Resolver(() => Post)
export class PostResolver {
  // constructor(private bookService: B∂ookService) {}
  @FieldResolver(() => User)
  async author(@Root() post: Post, @Ctx() ctx: MyContext) {
    const {
      dataLoader: { userDataLoader },
    } = ctx;
    const user = await userDataLoader.load(post.author_id);

    return user;
  }

  // @Query(() => [Post])
  // async postWithAuthor(@Arg('authorId') authorId: string, @Ctx() ctx) {
  //   const db: Knex = ctx.db;

  //   const posts = await db('posts')
  //     .join('users', 'posts.author_id', '=', 'users.user_id')
  //     .where({ 'posts.author_id': authorId })
  //     .orderBy('created_at', 'desc')
  //     .select();
  //   const users = await db('users').where({ user_id: authorId }).select();
  //   return posts.map(post => {
  //     return { ...post, author: users.find(user => user.user_id == authorId) };
  //   });
  // }

  @Query(() => PostConnection)
  async posts(
    @Ctx() ctx,
    @Args(() => PostArgs) { orderBy }: PostArgs,
    @Args() { first, after }: ConnectionArgs
  ): Promise<PostConnection> {
    const db: Knex = ctx.db;
    const { updated_at } = orderBy;
    console.log({ after: `\'${after}%\'` });
    const posts = await db
      .table('posts')
      .where('post_id', '>', after)
      .orderBy('updated_at', updated_at)
      .limit(first)
      .select();
    return {
      edges: posts,
      pageInfo: {
        startCursor: after,
        endCursor: null,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    };
  }

  @Mutation(() => Post)
  @Authorized()
  async addPost(@Arg('payload') payload: AddPostInput, @Ctx() ctx: MyContext) {
    const { db, userId } = ctx;
    const { ...postData } = payload;
    const timestamp = Date.now();
    const [post] = await db('posts')
      .insert({ ...postData, author_id: userId, created_at: timestamp, updated_at: timestamp })
      .returning('*');

    return post;
  }
  @Mutation(() => Post)
  @Authorized()
  async updatePost(@Arg('postId') postId: string, @Arg('payload') payload: UpdatePostInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { ...postData } = payload;
    try {
      const [matchPost] = await db('posts').where({ post_id: postId });
      if (!matchPost) {
        throw new ApolloError('Post not found');
      }
      const timestamp = Date.now();

      const [post] = await db('posts')
        .where({ post_id: postId })
        .update({ ...postData, updated_at: timestamp })
        .returning('*');

      return post;
    } catch (error) {
      throw new ApolloError(error.message);
    }
  }
  @Mutation(() => Post)
  @Authorized()
  async deletePost(@Arg('postId') postId: string, @Ctx() ctx) {
    const db: Knex = ctx.db;
    try {
      const [matchPost] = await db('posts').where({ post_id: postId });
      if (!matchPost) {
        throw new ApolloError('Post not found');
      }
      const [post] = await db('posts').where({ post_id: postId }).delete().returning('*');

      return post;
    } catch (error) {
      throw new ApolloError(error.message);
    }
  }
}
