import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: endpoint }),
  cache: new InMemoryCache()
});
