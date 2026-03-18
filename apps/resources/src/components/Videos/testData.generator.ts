import { exec } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { promisify } from 'util'

import { gql } from '@apollo/client'

import {
  GetVideosForTestData,
  GetVideosForTestData_videos as Videos
} from '../../../__generated__/GetVideosForTestData'
import { createApolloClient } from '../../libs/apolloClient'
import { VIDEO_CONTENT_FIELDS } from '../../libs/videoContentFields'

const ids = [
  '1_jf-0-0',
  '2_GOJ-0-0',
  '1_jf6119-0-0',
  '1_wl604423-0-0',
  'MAG1',
  '1_wl7-0-0',
  '3_0-8DWJ-WIJ_06-0-0',
  '2_Acts-0-0',
  '2_GOJ4904-0-0',
  'LUMOCollection',
  '2_Acts7331-0-0',
  '3_0-8DWJ-WIJ',
  '2_ChosenWitness',
  'GOLukeCollection',
  '1_cl1309-0-0',
  '1_jf6102-0-0',
  '2_0-FallingPlates',
  '2_Acts7345-0-0',
  '1_mld-0-0',
  '1_jf6101-0-0'
]

async function testDataGenerator(): Promise<void> {
  const template = readFileSync(
    './apps/watch/src/components/Videos/__generated__/testData.ts',
    {
      encoding: 'utf8'
    }
  )
  console.log(
    `pulling data from ${process.env.NEXT_PUBLIC_GATEWAY_URL as string}...`
  )
  const { data } = await createApolloClient().query<GetVideosForTestData>({
    query: gql`
      ${VIDEO_CONTENT_FIELDS}
      query GetVideosForTestData($ids: [ID!]!, $languageId: ID) {
        videos(where: { ids: $ids }) {
          ...VideoContentFields
        }
      }
    `,
    variables: {
      ids,
      languageId: '529'
    }
  })
  const videos: Videos[] = []

  data.videos.forEach((video) => {
    videos[ids.indexOf(video.id)] = video
  })

  console.log('replacing enums...')
  const stringifiedData = JSON.stringify(videos)
    .replace(/"label":"(\w*)",/g, 'label: VideoLabel.$1,')
    .replace(/"quality":"(\w*)",/g, 'quality: VideoVariantDownloadQuality.$1,')
  console.log('printing to file...')
  writeFileSync(
    './apps/watch/src/components/Videos/__generated__/testData.ts',
    template.replace(/\[\] = \[[\s\S]*\n\]/, `[] = ${stringifiedData}`)
  )
  console.log('running prettier...')
  await promisify(exec)(
    './node_modules/.bin/prettier -w ./apps/watch/src/components/Videos/__generated__/testData.ts'
  )
  console.log('done')
}

void testDataGenerator()
