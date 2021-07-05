import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class AddPostInput {
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
}
