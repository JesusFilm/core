import fs from 'fs'

import { gql } from '@apollo/client'
import csv from 'csv-parser'
import compact from 'lodash/compact'

import { AddTagsScriptGetTags } from '../../../__generated__/AddTagsScriptGetTags'
import {
  AddTagsScriptJourneyTagsUpdate,
  AddTagsScriptJourneyTagsUpdateVariables
} from '../../../__generated__/AddTagsScriptJourneyTagsUpdate'
import { createApolloClient } from '../apolloClient'

const GET_TAGS = gql`
  query AddTagsScriptGetTags {
    tags {
      id
      name {
        value
      }
    }
  }
`

const JOURNEY_TAGS_UPDATE = gql`
  mutation AddTagsScriptJourneyTagsUpdate(
    $journeyId: ID!
    $input: JourneyUpdateInput!
  ) {
    journeyUpdate(id: $journeyId, input: $input) {
      id
      tags {
        id
      }
    }
  }
`

async function readCSVFile(filePath: string): Promise<object[]> {
  const results: object[] = []

  return await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error))
  })
}

/**
 * This function opens a provided CSV file and calls the API to add tags
 * The CSV file should have journeyId in first column and a
 * comma seperated values in the second column of tags
 */

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (args[0] == null || args[1] == null || args[2] == null) {
    console.log(`Add Tags to Journeys CLI v0.1

Usage: nx add-tags journeys-admin <GATEWAY_URL> <API_TOKEN> <CSV_FILE_PATH>
`)
    return
  }
  const [gatewayUrl, apiToken, csvFilePath] = args
  const client = createApolloClient(apiToken, gatewayUrl)
  const rows = (await readCSVFile(csvFilePath)) as Array<{
    journeyId: string
    tagNames: string
  }>
  const { data } = await client.query<AddTagsScriptGetTags>({ query: GET_TAGS })

  await Promise.all(
    rows.map(async ({ journeyId, tagNames }, index) => {
      const tags = compact(
        tagNames.split(',').map((tagName) => {
          const tidyTagName = tagName.trim()
          const tag = data.tags.find(({ name }) =>
            name.some(({ value }) => value === tidyTagName)
          )
          if (tag != null) return { id: tag.id, name: tag.name[0].value }
          return undefined
        })
      )
      if (tags.length === 0) return
      console.log(
        `UPDATING (${index}):\n`,
        `  journeyId: ${journeyId}\n`,
        `  tags: ${tags.map(({ name }) => name).join(', ')}\n`
      )
      try {
        await client.mutate<
          AddTagsScriptJourneyTagsUpdate,
          AddTagsScriptJourneyTagsUpdateVariables
        >({
          mutation: JOURNEY_TAGS_UPDATE,
          variables: { journeyId, input: { tagIds: tags.map(({ id }) => id) } }
        })
      } catch (err) {
        console.log(
          `ERROR (${index}):\n`,
          `  journeyId: ${journeyId}\n`,
          `  tags: ${tags.map(({ name }) => name).join(', ')}\n`,
          `  message: ${err.message as string}\n`
        )
      }
    })
  )
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
