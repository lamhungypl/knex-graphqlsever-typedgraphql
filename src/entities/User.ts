import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class User {
  @Field(type => ID)
  user_id: string;

  @Field({ nullable: true })
  username: string;

  @Field()
  email: string;

  password: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
