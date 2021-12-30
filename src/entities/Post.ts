import { Field, ID, ObjectType } from 'type-graphql';
import { ConnectionType, EdgeType } from '../dto/RelayCursorArgs';
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
  created_at: string;

  @Field({ nullable: true })
  updated_at: string;

  @Field(() => User, { nullable: true })
  author?: User;

  author_id: string;
}

@ObjectType()
export class PostEdge extends EdgeType('Post', Post) {}
@ObjectType()
export class PostConnection extends ConnectionType<PostEdge>('Post', PostEdge) {}
