import { testkit, gql, createModule } from 'graphql-modules'
import { DocumentNode, ExecutionResult } from 'graphql'
import { schemaBuilder } from '@core/shared/util-graphql'
import { dateTimeModule } from '..'

const typeDefs = gql`
  extend type Query {
    dateTime: DateTime
  }
`

const dateTimeQueryModule = createModule({
  id: 'dateTimeQuery',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers: {
    Query: {
      dateTime: () => new Date('2021-11-19T12:34:56.647Z')
    }
  }
})

describe('DateTimeModule', () => {
  let app
  beforeEach(() => {
    app = testkit.testModule(dateTimeQueryModule, {
      schemaBuilder,
      modules: [dateTimeModule]
    })
  })
  async function query(document: DocumentNode): Promise<ExecutionResult> {
    return await testkit.execute(app, { document })
  }

  it('should return DateTime in ISO format', async () => {
    const { data } = await query(gql`
      query {
        dateTime
      }
    `)
    expect(data?.dateTime).toEqual('2021-11-19T12:34:56.647Z')
  })
})
