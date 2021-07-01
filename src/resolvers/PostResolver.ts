import { ApolloError } from 'apollo-server-express';
import { Knex } from 'knex';
import { Query, Resolver, Ctx, Arg, Mutation, Field, ObjectType, Authorized, FieldResolver, Root } from 'type-graphql';
import { AddPostInput } from '../dto/AddPostInput';

import { UpdatePostInput } from '../dto/UpdatePostInput';
import { Post } from '../entities/Post';
import { User } from '../entities/User';

@Resolver()
export class PostResolver {
  // constructor(private bookService: B∂ookService) {}
  // @FieldResolver(() => User)
  // async user(@Root() post: Post, @Ctx() ctx) {
  //   const { db } = ctx
  //   const [user] = await db('users').where('user_id', post.author)

  //   return user
  // }

  @Query(() => [Post])
  async postWithAuthor(@Arg('authorId') authorId: string, @Ctx() ctx) {
    const db: Knex = ctx.db;

    const posts = await db('posts')
      .join('users', 'posts.author_id', '=', 'users.user_id')
      .where({ 'posts.author_id': authorId })
      .orderBy('created_at', 'desc')
      .select();
    const users = await db('users').where({ user_id: authorId }).select();
    return posts.map(post => {
      return { ...post, author: users.find(user => user.user_id == authorId) };
    });
  }

  @Query(() => [Post])
  async posts(@Ctx() ctx) {
    const db: Knex = ctx.db;
    const posts = await db.select().table('posts');
    return posts;
  }

  @Mutation(() => Post)
  async addPost(@Arg('input') input: AddPostInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { ...postData } = input;

    const [post] = await db('posts').insert(postData).returning('*');

    return post;
  }
  @Mutation(() => Post)
  async updatePost(@Arg('postId') postId: string, @Arg('input') input: UpdatePostInput, @Ctx() ctx) {
    const db: Knex = ctx.db;
    const { ...postData } = input;
    try {
      const [matchPost] = await db('posts').where({ post_id: postId });
      if (!matchPost) {
        throw new ApolloError('Post not found');
      }
      const [post] = await db('posts').where({ post_id: postId }).update(postData).returning('*');
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
