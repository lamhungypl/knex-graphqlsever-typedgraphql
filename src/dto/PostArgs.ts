import { ArgsType, Field, InputType, ObjectType } from 'type-graphql';
import { Post } from '../entities/Post';

type Direction = 'asc' | 'desc';

@InputType()
class PostOrder {
  @Field()
  updated_at: Direction;
}

@ArgsType()
export class PostArgs {
  @Field({ nullable: true })
  orderBy: PostOrder;
}
