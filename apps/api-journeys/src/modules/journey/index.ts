import 'reflect-metadata'
import { DataSource } from 'apollo-datasource'
import { Scope, createModule, gql, Injectable, Inject, CONTEXT } from 'graphql-modules'
import { JourneyModule } from './__generated__/types'
import { Journey } from '.prisma/api-journeys-client'

const typeDefs = gql`
  type Journey {
    id: ID!
    published: Boolean!
    title: String!
  }

  type Query {
    journeys: [Journey!]!
    journey(id: ID!): Journey
  }

  type Mutation {
    journeyCreate(title: String!): Journey!
    journeyPublish(id: ID!): Journey
  }
`

@Injectable({
  scope: Scope.Operation
})
class JourneyAPI extends DataSource {
  constructor (@Inject(CONTEXT) private readonly context: GraphQLModules.GlobalContext) {
    super()
  }

  async getJourneys (): Promise<Journey[]> {
    return await this.context.db.journey.findMany({
      where: { published: true }
    })
  }

  async getJourney (id: string): Promise<Journey | null> {
    return await this.context.db.journey.findFirst({
      where: { id }
    })
  }

  async journeyCreate (title: string): Promise<Journey> {
    return await this.context.db.journey.create({
      data: {
        title
      }
    })
  }

  async journeyPublish (id: string): Promise<Journey> {
    return await this.context.db.journey.update({
      where: { id },
      data: {
        published: true
      }
    })
  }
}

const resolvers: JourneyModule.Resolvers = {
  Query: {
    async journeys (_, __, { injector }) {
      return await injector.get(JourneyAPI).getJourneys()
    },
    async journey (_parent, { id }, { injector }) {
      return await injector.get(JourneyAPI).getJourney(id)
    }
  },
  Mutation: {
    async journeyCreate (_parent, { title }, { injector }) {
      return await injector.get(JourneyAPI).journeyCreate(title)
    },
    async journeyPublish (_parent, { id }, { injector }) {
      return await injector.get(JourneyAPI).journeyPublish(id)
    }
  }
}

export default createModule({
  id: 'journey',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers,
  providers: [JourneyAPI]
})
