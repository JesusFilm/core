import { ApolloServer, gql } from 'apollo-server';
import client from '../prisma/client';

const typeDefs = gql`
  type Post {
    content: String
    id: ID!
    published: Boolean!
    title: String!
  }

  type Query {
    feed: [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    createDraft(content: String, title: String!): Post!
    publish(id: ID!): Post
  }
`;

const resolvers = {
  Query: {
    feed: (parent, args) => {
      return client.post.findMany({
        where: { published: true },
      });
    },
    post: (parent, args) => {
      return client.post.findOne({
        where: { id: Number(args.id) },
      });
    },
  },
  Mutation: {
    Mutation: {
      createDraft: (parent, args) => {
        return client.post.create({
          data: {
            title: args.title,
            content: args.content,
          },
        });
      },
      publish: (parent, args) => {
        return client.post.update({
          where: {
            id: Number(args.id),
          },
          data: {
            published: true,
          },
        });
      },
    },
  },
  Post: {
    content: (parent) => parent.content,
    id: (parent) => parent.id,
    published: (parent) => parent.published,
    title: (parent) => parent.title,
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
