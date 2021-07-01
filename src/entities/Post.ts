import { Field, ID, ObjectType } from 'type-graphql';
import { User } from './User';

@ObjectType()
export class Post {
  @Field(type => ID)
  post_id: string;

  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;

  @Field(() => User, { nullable: true })
  author?: User;

  author_id: string;
}
