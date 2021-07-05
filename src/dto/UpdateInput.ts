import { Field, InputType } from 'type-graphql';

@InputType()
export class UpdateInput {
  @Field({ nullable: true })
  email: string;
}
