import { GraphQLSchema } from 'graphql'
import { createApplication, createModule, gql } from 'graphql-modules'
import { buildModuleSubgraphSchema } from './buildModuleSubgraphSchema'

describe('buildModuleSubgraphSchema', () => {
  it('allows createApplication to accept module schemas having federation directives', async () => {
    const m1 = createModule({
      id: 'm1',
      dirname: __dirname,
      typeDefs: [
        gql`        
          type Foo @key(fields: "id") {
            id: ID!
            fooname: String!
          }
                  
          extend type Query {            
            myfoo: Foo      
          }   
        `
      ],
      resolvers: {
        Query: {
          myfoo: () => ({ id: 'f1', fooname: 'foo1' })
        }
      }
    })

    const m2 = createModule({
      id: 'm2',
      dirname: __dirname,
      typeDefs: [
        gql`      
          type Boo @key(fields: "id") {
            id: ID!
            booname: String!
            goo: Goo @provides(fields: "gooname")
          }

          extend type Goo @key(fields: "id") {
            id: ID! @external
            gooname: String! @external
            foo: Foo
          }
        `
      ],
      resolvers: {}
    })

    expect(() => createApplication({
      modules: [m1, m2]
    })).toThrow()

    const application = createApplication({
      modules: [m1, m2],
      schemaBuilder: buildModuleSubgraphSchema
    })

    expect(application.schema).toBeInstanceOf(GraphQLSchema)

    expect(application.schema.getType('_Service')).toBeDefined()
    expect(application.schema.getType('_Entity')).toBeDefined()
    expect(application.schema.getType('_Any')).toBeDefined()

    const directiveNames = application.schema.getDirectives().map(a => a.name)
    expect(directiveNames).toContain('key')
    expect(directiveNames).toContain('extends')
    expect(directiveNames).toContain('external')
    expect(directiveNames).toContain('provides')
    expect(directiveNames).toContain('requires')
  })
})
