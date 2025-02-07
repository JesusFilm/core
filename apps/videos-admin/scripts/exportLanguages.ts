import { writeFile } from 'fs/promises'
import path from 'path'

import { GET_LANGUAGES } from '../../../libs/journeys/ui/src/libs/useLanguagesQuery/useLanguagesQuery'

import { makeClient } from '../src/libs/apollo/makeClient'

async function main() {
  try {
    // Initialize client using existing setup
    const client = makeClient()

    // Execute the query
    const { data } = await client.query({
      query: GET_LANGUAGES,
      variables: { languageId: '529' }
    })

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../data')
    await writeFile(
      path.join(outputDir, 'languages.json'),
      JSON.stringify(data, null, 2)
    )

    console.log('Languages data successfully written to data/languages.json')
  } catch (error) {
    console.error('Error fetching or writing languages data:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
