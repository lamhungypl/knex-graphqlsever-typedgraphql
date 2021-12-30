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
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });
  afterAll(async () => {
    await db.migrate.rollback();
    await db.destroy();
  });

  test('it should register a user', async () => {
    const app = await createTestServer();
    const request = supertest(app);

    // const res = await mutate(Register, { variables: { input: { username: 'fanuusersme', password: 'a123456' } } });

    const res = await request
      .post('/graphql')
      .send({ query: print(Register), variables: { input: { username: 'fanuusersme', password: 'a123456' } } });

    expect(res.statusCode).toEqual(200);
    console.log({ response: JSON.stringify(res.body) });
    const { register: newUser } = res.body.data;

    expect(newUser).not.toBeUndefined;
    expect(newUser.username).toEqual('fanuusersme');
  });

  test('it should not register a user if the email already exists', async () => {
    const app = await createTestServer();
    const request = supertest(app);

    const res = await request
      .post('/graphql')
      .send({ query: print(Register), variables: { input: { username: 'username1', password: 'a123456' } } });

    const {
      body: { errors, data },
    } = res;
    expect(errors).not.toBeNull();

    const { message } = errors[0];

    expect(message).toEqual('This User is already taken');
    expect(data).toBeNull();
  });

  test('should log in a user', async () => {
    const app = await createTestServer();
    const request = supertest(app);

    const res = await request
      .post('/graphql')
      .send({ query: print(Login), variables: { input: { username: 'username1', password: 'a123456' } } });

    const { token, user } = res.body.data.login;
    expect(token).not.toBeNull();
    expect(user.username).toEqual('username1');
  });

  test('should throw error if the password is wrong', async () => {
    const app = await createTestServer();
    const request = supertest(app);

    const res = await request
      .post('/graphql')
      .send({ query: print(Login), variables: { input: { username: 'username1', password: '' } } });

    expect(res.body.data).toBeNull();
    expect(res.body.errors).not.toBeNull();

    const { message }: any = res.body.errors![0];
    expect(message).toEqual('Username/ password wrong');
  });
});
