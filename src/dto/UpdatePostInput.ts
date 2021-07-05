import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;

  @Field(() => ID, { nullable: true })
  author_id: string;
}
