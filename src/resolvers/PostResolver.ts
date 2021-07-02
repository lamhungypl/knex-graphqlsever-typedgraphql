import { ApolloError } from 'apollo-server-express';
import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation, FieldResolver, Root, Args } from 'type-graphql';
import { MyContext } from '../@types/types';
import { AddPostInput } from '../dto/AddPostInput';
import { PostArgs } from '../dto/PostArgs';

import { UpdatePostInput } from '../dto/UpdatePostInput';
import { Post } from '../entities/Post';
import { User } from '../entities/User';

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

  @Query(() => [Post])
  async posts(@Ctx() ctx, @Args(() => PostArgs) { orderBy }: PostArgs) {
    const db: Knex = ctx.db;
    const { updated_at } = orderBy;
    const posts = await db.table('posts').orderBy('updated_at', updated_at).select();
    return posts;
  }

  @Mutation(() => Post)
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
      console.log(post);
      return post;
    } catch (error) {
      throw new ApolloError(error.message);
    }
  }
  @Mutation(() => Post)
  async deleteUser(@Arg('postId') postId: string, @Ctx() ctx) {
    const db: Knex = ctx.db;
    try {
      const [matchPost] = await db('posts').where({ post_id: postId });
      if (!matchPost) {
        throw new ApolloError('Post not found');
      }
      const [post] = await db('posts').where({ post_id: postId }).delete().returning('*');
      console.log('deleted', post);
      return post;
    } catch (error) {
      throw new ApolloError(error.message);
    }
  }
}
