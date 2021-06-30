import { Field, InputType } from 'type-graphql';

@InputType()
export class UpdateInput {
  @Field({ nullable: true })
  user_id: string;

  @Field({ nullable: true })
  username: string;

  @Field({ nullable: true })
  email: string;
}
