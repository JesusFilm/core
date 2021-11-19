import { createModule, gql } from "graphql-modules";
import {GraphQLScalarType, Kind} from 'graphql';

// scalar DateTime;

const typeDefs = gql`
    scalar DateTime

   extend type Query {
        dateTime: DateTime
    }
`;

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 8601 Date Time Scalar type',
  serialize(value) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); 
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null; // Invalid hard-coded value (not an integer)
  },

});

const resolvers = {
    DateTime: dateTimeScalar,

    
  Query: {
    dateTime: () => new Date().toISOString()
  }
}

export const dateTimeModule = createModule({
    id: 'dateTime',
    dirname: __dirname,
    typeDefs: [typeDefs],
    resolvers
});