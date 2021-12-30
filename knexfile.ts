export const development = {
  client: 'postgresql',
  connection: {
    host: '127.0.0.1',
    user: 'mac',
    password: 'a123456',
    database: 'fsdbackend',
  },
};
export const test = {
  client: 'postgresql',
  seeds: {
    directory: './seeds',
  },
  connection: {
    host: '127.0.0.1',
    user: 'mac',
    password: 'a123456',
    database: 'db-test',
  },
};
