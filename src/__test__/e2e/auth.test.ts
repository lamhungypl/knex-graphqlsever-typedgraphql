import supertest from 'supertest';
import { gql } from 'apollo-server-express';
import { db } from '../../../db/db';
import { createUser } from './helpers/helpers';

import { testClient, createTestServer } from './setup';
import { print } from 'graphql';

const Register = gql`
  mutation ($input: RegisterInput!) {
    register(payload: $input) {
      username
      email
      created_at
    }
  }
`;
export const Login = gql`
  mutation ($input: LoginInput!) {
    login(payload: $input) {
      token
      user {
        email
        username
      }
    }
  }
`;

describe('Auth', () => {
  test('it should register a user', async () => {
    const app = await createTestServer();
    const request = supertest(app);

    // const res = await mutate(Register, { variables: { input: { username: 'fanuusersme', password: 'a123456' } } });

    const res = await request
      .post('/graphql')
      .send({ query: print(Register), variables: { input: { username: 'fanuusersme', password: 'a123456' } } });

    expect(res.statusCode).toEqual(200);

    const [newUser] = await db('users').where('username', 'fanuusersme');

    expect(newUser).not.toBeUndefined;
    expect(newUser.username).toEqual('fanuusersme');
  });

  test('it should not register a user if the email already exists', async () => {
    await createUser('fanuusersme', 'useremail@test.com');

    const app = await createTestServer();
    const request = supertest(app);

    const res = await request
      .post('/graphql')
      .send({ query: print(Register), variables: { input: { username: 'fanuusersme', password: 'a123456' } } });

    const {
      body: { errors, data },
    } = res;
    expect(errors).not.toBeNull();

    const { message } = errors[0];

    expect(message).toEqual('This User is already taken');
    expect(data).toBeNull();
  });

  test('should log in a user', async () => {
    await createUser();

    const app = await createTestServer();
    const request = supertest(app);

    const res = await request
      .post('/graphql')
      .send({ query: print(Login), variables: { input: { username: 'fanuusersme', password: 'a123456' } } });

    const { token, user } = res.body.data.login;
    expect(token).not.toBeNull();
    expect(user.username).toEqual('fanuusersme');
  });

  test('should throw error if the password is wrong', async () => {
    await createUser();
    const app = await createTestServer();
    const request = supertest(app);

    const res = await request
      .post('/graphql')
      .send({ query: print(Login), variables: { input: { username: 'fanuusersme', password: '' } } });

    expect(res.body.data).toBeNull();
    expect(res.body.errors).not.toBeNull();

    const { message }: any = res.body.errors![0];
    expect(message).toEqual('Username/ password wrong');
  });
});
