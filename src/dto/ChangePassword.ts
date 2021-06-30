import { Field, InputType } from 'type-graphql';

@InputType()
export class ChangePasswordInput {
  @Field()
  user_id: string;

  @Field()
  currentPass: string;

  @Field()
  newPass: string;

  @Field()
  confirmPass: string;
}
