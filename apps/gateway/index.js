const { ApolloServer } = require("apollo-server");
const { ApolloGateway } = require("@apollo/gateway");

const gateway = new ApolloGateway();

const server = new ApolloServer({ 
  gateway, 

  // Apollo Graph Manager (previously known as Apollo Engine)
  // When enabled and an `ENGINE_API_KEY` is set in the environment,
  // provides metrics, schema management and trace reporting.
  engine: false,

  // Subscriptions are unsupported but planned for a future Gateway version.
  subscriptions: false,
});

server.listen({ port: gw-port }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
