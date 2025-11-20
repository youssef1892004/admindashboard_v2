import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL;
const adminSecret = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;

if (!endpoint || !adminSecret) {
  throw new Error(
    'Missing NEXT_PUBLIC_HASURA_GRAPHQL_URL or NEXT_PUBLIC_HASURA_ADMIN_SECRET environment variables'
  );
}

export const client = new GraphQLClient(endpoint, {
  headers: {
    "x-hasura-admin-secret": adminSecret,
  },
});

export * from './graphql/queries/users';
export * from './graphql/queries/categories';
export * from './graphql/queries/books';
export * from './graphql/queries/chapters';
export * from './graphql/queries/stats';
export * from './graphql/mutations/users';
export * from './graphql/mutations/categories';
export * from './graphql/mutations/books';
export * from './graphql/mutations/chapters';
export * from './graphql/mutations/roles';
