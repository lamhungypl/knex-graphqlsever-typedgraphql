import supertest from 'supertest';
import { gql } from 'apollo-server-express';
import { db } from '../../../db/db';

import { createTestServer } from './setup';
import { print } from 'graphql';

const getUsers = gql`
  query ($input: ArgUserInfo!) {
    users(info: $input) {
      username
      email
      created_at
    }
  }
`;
export const changePassword = gql`
  mutation ($input: ChangePasswordInput!) {
    changePassword(changePassInput: $input) {
      email
      username
    }
  }
`;

export const updateUser = gql`
  mutation ($userId: String!, $input: UpdateInput!) {
    updateUser(userId: $userId, payload: $input) {
      email
      username
    }
  }
`;

export const deleteUser = gql`
  mutation ($userId: String!) {
    deleteUser(userId: $userId) {
      email
      username
    }
  }
`;

describe('User ', () => {
  let app: Express.Application;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    app = await createTestServer();
    request = supertest(app);

    await db.migrate.latest();
    await db.seed.run();
    // you can here also seed your tables, if you have any seeding files
  });
  afterAll(async () => {
    await db.migrate.rollback();
    await db.destroy();
  });

  it('should fetch user list', async () => {
    const res = await request.post('/graphql').send({ query: print(getUsers), variables: { input: {} } });

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });
});
