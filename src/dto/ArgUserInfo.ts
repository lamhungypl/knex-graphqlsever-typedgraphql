import { ArgsType, Field, InputType, Int } from 'type-graphql';

@ArgsType()
export class ArgUserInfo {
  @Field({ nullable: true })
  email: string = '';

  @Field(() => Int, { nullable: true })
  limit: number = 20;

  @Field(() => Int, { nullable: true })
  offset: number = 0;
}
