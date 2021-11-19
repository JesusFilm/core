import { testkit, gql } from 'graphql-modules'
import { DocumentNode, ExecutionResult } from 'graphql'
import { schemaBuilder } from '@core/shared/util-graphql'
import {
    dateTimeModule
} from '..'
import dbMock from '../../../tests/dbMock'
// import dbMock from '../../../tests/dbMock'

test('ing', () => {
    const app = testkit.testModule(dateTimeModule, {
        schemaBuilder
    });
  
    console.log('testing');
    if(app.schema.getQueryType() === null){
        console.log("type null");
    }
    expect(app.schema.getQueryType()).toBeDefined();
  });

describe('DateTimeModule', () => {
    let app
    // var dateTimeScalar = require()
    beforeEach(() => {
        app = testkit.testModule(dateTimeModule, {
          schemaBuilder
        })
      })
      async function query(document: DocumentNode): Promise<ExecutionResult> {
        return await testkit.execute(app, {
          document,
          variableValues: {
            id: null
          },
          contextValue: {
            db: dbMock
          }
        })
      }

    it('should return DateTime in ISO format', async () => {
        const data = await query(gql`
            query {
                dateTime
          }`)
          console.log(data);
          return true;
    })
});