import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class AddPostInput {
  @Field(type => ID)
  post_id: string;

  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;
}
