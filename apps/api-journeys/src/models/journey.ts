import { PrismaClient } from '.prisma/client';
import { gql } from 'apollo-server';

const client = new PrismaClient();

export const typeDefs = gql`
  type Journey {
    id: ID!
    published: Boolean!
    title: String!
  }

  extend type Query {
    journeys: [Journey!]!
    journey(id: ID!): Journey
  }

  extend type Mutation {
    journeyCreate(title: String!): Journey!
    journeyPublish(id: ID!): Journey
  }
`;

export const resolvers = {
  Query: {
    journeys() {
      return client.journey.findMany({
        where: { published: true },
      });
    },
    journey(_parent, { id }) {
      return client.journey.findFirst({
        where: { id },
      });
    },
  },
  Mutation: {
    journeyCreate(_parent, { title }) {
      return client.journey.create({
        data: {
          title,
        },
      });
    },
    journeyPublish(_parent, { id }) {
      return client.journey.update({
        where: {
          id,
        },
        data: {
          published: true,
        },
      });
    },
  },
  Journey: {
    id: ({ id }) => id,
    published: ({ published }) => published,
    title: ({ title }) => title,
  },
};
