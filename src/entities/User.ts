import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class User {
  @Field(type => ID)
  user_id: string;

  @Field({ nullable: true })
  username: string;

  @Field({ nullable: true })
  email: string;

  password: string;

  @Field({ nullable: true })
  created_at: Date;

  @Field({ nullable: true })
  updated_at: Date;
}
