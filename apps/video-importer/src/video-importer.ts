import fs from 'fs/promises'
import path from 'path'
import 'dotenv/config'

import axios from 'axios'
import { Command } from 'commander'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { graphql } from 'gql.tada'
import { GraphQLClient } from 'graphql-request'

import { firebaseClient } from './firebaseClient'

/*
- [x] **CLI & Authentication**
  - [x] Parse CLI arguments (folder, --dry-run)
  - [x] Authenticate and get JWT token for API calls

- [ ] **File Discovery & Filtering**
  - [ ] Read all files in the folder
  - [ ] For each file:
    - [ ] Check filename pattern
    - [ ] Parse languageId and videoId

- [ ] **Dry Run or Real Processing**
  - [ ] If dry run: log intended actions
  - [ ] Else: process each file

- [ ] **Asset Creation & Upload**
  - [ ] Request R2 upload URL and public URL from backend
  - [ ] Upload file to R2

- [ ] **Mux Video Creation**
  - [ ] Create Mux video using R2 public URL
  - [ ] Poll for Mux video readiness

- [ ] **Backend Registration**
  - [ ] Register video variant in backend

- [ ] **Logging & Summary**
  - [ ] Log success/error for each file
  - [ ] Print summary at end
*/

const program = new Command()

program
  .requiredOption('-f, --folder <path>', 'Folder containing video files')
  .option('--dry-run', 'Print actions without uploading', false)
  .parse(process.argv)

const options = program.opts()

const VIDEO_FILENAME_REGEX = /^([a-zA-Z0-9_-]+)---([a-zA-Z0-9_-]+)\.mp4$/

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql' // TODO: Set this

async function getFirebaseJwtToken(): Promise<string> {
  const email = process.env.FIREBASE_EMAIL
  const password = process.env.FIREBASE_PASSWORD

  if (!email || !password) {
    throw new Error(
      'FIREBASE_EMAIL and FIREBASE_PASSWORD env variables must be set.'
    )
  }

  const auth = getAuth(firebaseClient)
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return await userCredential.user.getIdToken()
}

async function getGraphQLClient(): Promise<GraphQLClient> {
  let jwtToken = process.env.JWT_TOKEN
  if (!jwtToken) {
    jwtToken = await getFirebaseJwtToken()
  }
  return new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: {
      Authorization: `JWT ${jwtToken}`,
      'x-graphql-client-name': 'video-importer'
    }
  })
}

const CREATE_R2_ASSET = graphql(`
  mutation CreateR2Asset($input: CloudflareR2CreateInput!) {
    cloudflareR2Create(input: $input) {
      uploadUrl
      publicUrl
    }
  }
`)

async function createR2Asset({
  fileName,
  contentType,
  originalFilename,
  contentLength,
  videoId
}: {
  fileName: string
  contentType: string
  originalFilename: string
  contentLength: number
  videoId: string
}) {
  const client = await getGraphQLClient()
  const data: { cloudflareR2Create: { uploadUrl: string; publicUrl: string } } =
    await client.request(CREATE_R2_ASSET, {
      input: { fileName, contentType, originalFilename, contentLength, videoId }
    })
  return data.cloudflareR2Create
}

async function uploadToR2(
  uploadUrl: string,
  filePath: string,
  contentType: string
) {
  const fileBuffer = await fs.readFile(filePath)
  await axios.put(uploadUrl, fileBuffer, {
    headers: { 'Content-Type': contentType }
  })
}

async function main() {
  const folderPath = path.resolve(options.folder)
  let files: string[]
  try {
    files = await fs.readdir(folderPath)
  } catch (err) {
    console.error(`Failed to read folder: ${folderPath}`)
    process.exit(1)
  }

  const videoFiles = files.filter((file) => VIDEO_FILENAME_REGEX.test(file))

  if (videoFiles.length === 0) {
    console.log('No valid video files found in the folder.')
    return
  }

  for (const file of videoFiles) {
    const match = file.match(VIDEO_FILENAME_REGEX)
    if (!match) continue
    const [, languageId, videoId] = match
    if (options.dryRun) {
      console.log(
        `[DRY RUN] Would process file: ${file} (languageId: ${languageId}, videoId: ${videoId})`
      )
    } else {
      console.log(
        `Processing file: ${file} (languageId: ${languageId}, videoId: ${videoId})`
      )
      // --- R2 Asset Creation ---
      const filePath = path.join(folderPath, file)
      const contentType = 'video/mp4'
      const originalFilename = file
      const contentLength = (await fs.stat(filePath)).size
      try {
        const r2Asset = await createR2Asset({
          fileName: `${videoId}/variants/${languageId}/videos/${videoId}_${languageId}.mp4`,
          contentType,
          originalFilename,
          contentLength,
          videoId
        })
        console.log(`Obtained R2 uploadUrl and publicUrl for ${file}`)
        await uploadToR2(r2Asset.uploadUrl, filePath, contentType)
        console.log(`Uploaded ${file} to R2.`)
        // TODO: Continue with Mux video creation and backend registration
      } catch (err) {
        console.error(`Error processing ${file}:`, err)
      }
    }
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
