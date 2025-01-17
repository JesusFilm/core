import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { graphql } from 'gql.tada'

import { PrismaClient, Service } from '.prisma/api-media-client'

const GET_SHORT_LINK_DOMAIN = graphql(`
  query shortLinkDomain($id: String!) {
    shortLinkDomain(id: $id) {
      ... on NotFoundError {
        message
      }
      ... on QueryShortLinkDomainSuccess {
        data {
          id
        }
      }
    }
  }
`)

const CREATE_SHORT_LINK_DOMAIN = graphql(`
  mutation shortLinkDomainCreate($input: MutationShortLinkDomainCreateInput!) {
    shortLinkDomainCreate(input: $input) {
      ... on ZodError {
        message
      }
      ... on NotUniqueError {
        message
      }
      ... on MutationShortLinkCreateSuccess {
        data {
          id
        }
      }
    }
  }
`)

const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-journeys',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

// const prisma = new PrismaClient()
const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

export async function shortLinkDomain(): Promise<void> {
  const id = '898626fa-6204-4b53-ae9d-12093831c61d'

  if (process.env.JOURNEYS_SHORTLINK_DOMAIN == null) {
    throw new Error('Shortlink domain not set')
  }

  // const shortLinkDomain = await prisma.shortLinkDomain.findUnique({
  //   where: { id }
  // })

  const initialShortLinkDomain = await apollo.query({
    query: GET_SHORT_LINK_DOMAIN,
    variables: { id }
  })

  if (initialShortLinkDomain == null) {
    await apollo.mutate({
      mutation: CREATE_SHORT_LINK_DOMAIN,
      variables: {
        input: {
          hostname: process.env.JOURNEYS_SHORTLINK_DOMAIN,
          services: [Service.apiJourneys]
        }
      }
    })
  }
}
