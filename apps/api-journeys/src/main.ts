import { ApolloServer, gql } from 'apollo-server';
import { merge } from 'lodash';
import {
  typeDefs as journeyTypeDefs,
  resolvers as journeyResolvers,
} from './models/journey';

const Query = gql`
  type Query {
    _empty: String
  }
`;

const Mutation = gql`
  type Mutation {
    _empty: String
  }
`;

const resolvers = {};

const server = new ApolloServer({
  typeDefs: [Query, Mutation, journeyTypeDefs],
  resolvers: merge(resolvers, journeyResolvers),
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
