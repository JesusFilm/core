import Mux from '@mux/mux-node'
import { request } from 'undici'

import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()

function getMuxClient(): Mux {
  if (process.env.MUX_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_ACCESS_TOKEN_ID')

  if (process.env.MUX_SECRET_KEY == null)
    throw new Error('Missing MUX_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY
  })
}

interface TestVideoSetup {
  videoUrl: string
  languageId: string
  userId: string
  videoTitle?: string
  edition?: string
}

interface TestResults {
  muxVideoId: string
  videoId: string
  videoVariantId: string
  assetId: string
  subtitleTrackId?: string
  workflowRunId?: string
  subtitlesGenerated: boolean
}

/**
 * Sets up test data for Mux AI subtitles testing
 * 1. Uploads a test video to Mux
 * 2. Creates necessary database records
 * 3. Returns the setup data needed for requestMuxAiSubtitles testing
 */
async function setupMuxTestData({
  videoUrl,
  languageId = '3934',
  userId = 'system',
  videoTitle = 'Test Video for AI Subtitles',
  edition = 'base'
}: TestVideoSetup): Promise<TestResults> {
  console.log('🚀 Starting Mux test data setup...')
  console.log(`📹 Video URL: ${videoUrl}`)
  console.log(`👤 User ID: ${userId}`)
  console.log(`🌍 Language ID: ${languageId}`)
  console.log(`📝 Edition: ${edition}`)

  const mux = getMuxClient()

  // Step 1: Upload video to Mux
  console.log('📤 Uploading video to Mux (low quality for faster testing)...')
  const muxAsset = await mux.video.assets.create({
    inputs: [{ url: videoUrl }],
    video_quality: 'basic',
    playback_policy: ['public'],
    static_renditions: [
      { resolution: '270p' },
      { resolution: '360p' }
    ]
  })

  console.log(`✅ Created Mux asset: ${muxAsset.id}`)

  // Step 2: Wait for asset to be ready
  console.log('⏳ Waiting for asset to be ready...')
  let asset = await mux.video.assets.retrieve(muxAsset.id)
  let attempts = 0
  const maxAttempts = 60 // 5 minutes max

  while (asset.status !== 'ready' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
    asset = await mux.video.assets.retrieve(muxAsset.id)
    attempts++
    console.log(`   Attempt ${attempts}: Status is ${asset.status}`)
  }

  if (asset.status !== 'ready') {
    throw new Error(`Asset ${muxAsset.id} failed to become ready after ${maxAttempts} attempts`)
  }

  console.log('✅ Asset is ready!')

  // Step 3: Create MuxVideo record
  console.log('💾 Creating MuxVideo record...')
  const muxVideo = await prisma.muxVideo.create({
    data: {
      assetId: muxAsset.id,
      userId,
      name: videoTitle,
      duration: asset.duration ? Math.round(asset.duration) : 0,
      downloadable: true,
      readyToStream: true,
      playbackId: asset.playback_ids?.[0]?.id
    }
  })

  console.log(`✅ Created MuxVideo: ${muxVideo.id}`)

  // Step 4: Create Video record (if it doesn't exist)
  console.log('🎬 Creating/updating Video record...')
  const videoSlug = `test-mux-video-${Date.now()}`
  const video = await prisma.video.upsert({
    where: { slug: videoSlug },
    update: {},
    create: {
      label: 'collection',
      primaryLanguageId: languageId,
      slug: videoSlug,
      published: false,
      noIndex: true,
      availableLanguages: [languageId]
    }
  })

  console.log(`✅ Created/updated Video: ${video.id}`)

  // Step 4.5: Create VideoEdition record
  console.log('📚 Creating VideoEdition record...')
  const videoEdition = await prisma.videoEdition.upsert({
    where: {
      name_videoId: {
        name: edition,
        videoId: video.id
      }
    },
    update: {},
    create: {
      name: edition,
      videoId: video.id
    }
  })

  console.log(`✅ Created/updated VideoEdition: ${videoEdition.id}`)

  // Step 5: Create VideoVariant record
  console.log('🎭 Creating VideoVariant record...')
  const videoVariantId = `${video.id}_${languageId}_${edition}_${Date.now()}`
  const videoVariant = await prisma.videoVariant.create({
    data: {
      id: videoVariantId,
      videoId: video.id,
      languageId,
      edition,
      slug: `${videoSlug}-${languageId}-${edition}`,
      hls: asset.playback_ids?.[0]?.id ? `https://stream.mux.com/${asset.playback_ids[0].id}.m3u8` : null,
      downloadable: true,
      published: false,
      muxVideoId: muxVideo.id
    }
  })

  console.log(`✅ Created VideoVariant: ${videoVariant.id}`)
  console.log('🎉 Setup complete!')
  console.log('')
  console.log('📋 Test Data Summary:')
  console.log(`   Mux Asset ID: ${muxAsset.id}`)
  console.log(`   Mux Video ID: ${muxVideo.id}`)
  console.log(`   Video ID: ${video.id}`)
  console.log(`   Video Variant ID: ${videoVariant.id}`)
  console.log('')
  console.log('🧪 To test requestMuxAiSubtitles, use these parameters:')
  console.log(`   muxVideoId: "${muxVideo.id}"`)
  console.log(`   bcp47: "ru"`)
  console.log(`   languageId: "${languageId}"`)
  console.log(`   edition: "${edition}"`)
  console.log(`   videoVariantId: "${videoVariant.id}"`)

  return {
    muxVideoId: muxVideo.id,
    videoId: video.id,
    videoVariantId: videoVariant.id,
    assetId: muxAsset.id,
    subtitlesGenerated: false
  }
}

async function testRequestMuxAiSubtitles(testResults: TestResults): Promise<TestResults> {
  console.log('\n🎭 Testing requestMuxAiSubtitles workflow...')

  try {
    // Make GraphQL request to requestMuxAiSubtitles (directly to api-media)
    const graphqlEndpoint = 'http://localhost:4005'
    const authToken = process.env.AI_SUBTITLE_ADMIN_TOKEN || 'private-ai-subtitle-generation'

    const query = `
      mutation RequestSubtitles($muxVideoId: ID!, $bcp47: String!, $languageId: ID!, $edition: String, $videoVariantId: ID) {
        requestMuxAiSubtitles(
          muxVideoId: $muxVideoId
          bcp47: $bcp47
          languageId: $languageId
          edition: $edition
          videoVariantId: $videoVariantId
        ) {
          ... on MutationRequestMuxAiSubtitlesSuccess {
            data {
              id
              status
              trackId
              workflowRunId
            }
          }
          ... on Error {
            message
          }
        }
      }
    `

    const variables = {
      muxVideoId: testResults.muxVideoId,
      bcp47: 'ru',
      languageId: '3934',
      edition: 'base',
      videoVariantId: testResults.videoVariantId
    }

    console.log('📡 Calling requestMuxAiSubtitles GraphQL mutation...')
    const response = await request(`${graphqlEndpoint}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ query, variables })
    })

    const responseData = await response.body.json() as {
      data?: { requestMuxAiSubtitles?: any }
      errors?: any[]
    }
    console.log('✅ GraphQL response received')

    if (responseData.errors) {
      console.error('❌ GraphQL errors:', responseData.errors)
      throw new Error(`GraphQL errors: ${JSON.stringify(responseData.errors)}`)
    }

    const result = responseData.data?.requestMuxAiSubtitles
    if (!result) {
      throw new Error('No result returned from requestMuxAiSubtitles')
    }

    // Handle union type - check if it's an error or success
    if ('message' in result) {
      throw new Error(`API Error: ${result.message}`)
    }

    const subtitleTrack = result.data
    if (!subtitleTrack) {
      throw new Error('No subtitle track data returned from requestMuxAiSubtitles')
    }

    console.log(`🎯 Created subtitle track: ${subtitleTrack.id}`)
    console.log(`📊 Initial status: ${subtitleTrack.status}`)
    console.log(`🔄 Workflow run ID: ${subtitleTrack.workflowRunId || 'None'}`)

    // Wait for workflow to complete (poll the database)
    console.log('⏳ Waiting for subtitle generation to complete...')
    const startTime = Date.now()
    let attempts = 0
    const maxAttempts = 30 // 10 minutes max (30 attempts × 20 seconds)
    let currentStatus = subtitleTrack.status

    while (currentStatus !== 'ready' && currentStatus !== 'errored' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 20000)) // Wait 20 seconds
      attempts++

      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000)
      const updatedTrack = await prisma.muxSubtitleTrack.findUnique({
        where: { id: subtitleTrack.id }
      })

      if (updatedTrack) {
        currentStatus = updatedTrack.status
        const progressPercent = Math.round((attempts / maxAttempts) * 100)
        console.log(`   Attempt ${attempts}/${maxAttempts} (${progressPercent}%): Status "${currentStatus}" | Elapsed: ${elapsedSeconds}s | Track: ${updatedTrack.trackId || 'pending'}`)

        if (currentStatus === 'errored') {
          console.log(`❌ Error message: ${updatedTrack.errorMessage || 'No error message'}`)
          break
        }

        if (currentStatus === 'ready' && updatedTrack.vttUrl) {
          console.log(`✅ VTT URL ready: ${updatedTrack.vttUrl}`)
        }
      }
    }

    const finalTrack = await prisma.muxSubtitleTrack.findUnique({
      where: { id: subtitleTrack.id }
    })

    const success = finalTrack?.status === 'ready' && finalTrack?.vttUrl != null

    if (success) {
      console.log('✅ Subtitle generation completed successfully!')
      console.log(`📁 VTT URL: ${finalTrack?.vttUrl}`)
      console.log(`🎵 Track ID: ${finalTrack?.trackId}`)
    } else {
      console.log('❌ Subtitle generation failed or timed out')
      console.log(`📊 Final status: ${finalTrack?.status}`)
      if (finalTrack?.errorMessage) {
        console.log(`🚨 Error: ${finalTrack.errorMessage}`)
      }
    }

    return {
      ...testResults,
      subtitleTrackId: subtitleTrack.id,
      workflowRunId: subtitleTrack.workflowRunId,
      subtitlesGenerated: success
    }

  } catch (error) {
    console.error('❌ Failed to test requestMuxAiSubtitles:', error)
    return {
      ...testResults,
      subtitlesGenerated: false
    }
  }
}

async function main(): Promise<void> {
  try {
    // Parse arguments, filtering out node/ts-node flags
    const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'))

    // You can pass a video URL as an argument, or use a default test video
    const videoUrl = args[0] || 'https://cdn-std.droplr.net/files/acc_760170/mLINlU'

    const languageId = args[1] || '3934' // Russian
    const userId = args[2] || 'system'
    const shouldTestSubtitles = !process.argv.includes('--no-test') // Default to true, pass --no-test to skip

    console.log('🎬 Setting up Mux test data...')
    const testResults = await setupMuxTestData({
      videoUrl,
      languageId,
      userId
    })

    if (shouldTestSubtitles) {
      console.log('\n🔗 Testing complete workflow with requestMuxAiSubtitles...')
      const finalResults = await testRequestMuxAiSubtitles(testResults)

      console.log('\n📋 Complete Test Results:')
      console.log(`   Video uploaded: ✅`)
      console.log(`   Database records created: ✅`)
      console.log(`   Subtitles requested: ✅`)
      console.log(`   Subtitles generated: ${finalResults.subtitlesGenerated ? '✅' : '❌'}`)

      if (finalResults.subtitlesGenerated) {
        console.log('\n🎉 SUCCESS: Complete AI subtitle workflow tested successfully!')
        console.log('   - Video uploaded to Mux')
        console.log('   - Database records created')
        console.log('   - AI subtitles generated on demand')
      } else {
        console.log('\n⚠️ PARTIAL SUCCESS: Setup completed but subtitle generation failed')
        console.log('   Check the logs above for details')
        process.exit(1)
      }
    } else {
      console.log('\n🎯 Setup complete! Use --test-subtitles to also test the workflow')
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}

export { setupMuxTestData }