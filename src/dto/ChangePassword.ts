import { Field, InputType } from 'type-graphql';

@InputType()
export class ChangePasswordInput {
  @Field()
  username: string;

  @Field()
  currentPass: string;

  @Field()
  newPass: string;

  @Field()
  confirmPass: string;
}
