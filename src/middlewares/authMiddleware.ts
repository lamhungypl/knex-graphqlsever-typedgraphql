import { ApolloError } from 'apollo-server-express';
import { verify } from 'jsonwebtoken';
import { AuthChecker } from 'type-graphql';
import { MyContext } from '../@types/types';
import { SECRET } from '../constants/constants';

export const extractJwtToken = (req: any) => {
  try {
    if (!req.headers || !req.headers.authorization) {
      throw new ApolloError('Unauthorized');
    }

    const parts = req.headers.authorization.split(' ');
    console.log({ parts });
    if (parts.length === 2) {
      const scheme = parts[0];
      const credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        return credentials;
      } else {
        throw new ApolloError('Invalid token');
      }
    }
    throw new ApolloError('Invalid token');
  } catch (e) {
    throw e;
  }
};

export const authChecker: AuthChecker<MyContext> = async ({ root, args, context, info }) => {
  const { db, req } = context;
  try {
    const token = extractJwtToken(req.req);
    console.log({ token });
    const data: any = verify(token, SECRET);
    const { id } = data;
    const [user] = await db('users').where('user_id', id);

    if (!user) throw new ApolloError('User not found');

    context.userId = user.id;
    return true;
  } catch (e) {
    throw e;
  }
};
