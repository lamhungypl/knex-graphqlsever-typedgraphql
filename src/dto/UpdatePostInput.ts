import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field(() => ID, { nullable: true })
  author_id: string;
}
