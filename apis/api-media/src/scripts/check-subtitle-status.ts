import { config } from 'dotenv'
import { join } from 'node:path'

import Mux from '@mux/mux-node'

// Load environment variables
config({ path: join(process.cwd(), 'apis/api-media/.env') })

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

interface SubtitleTrackInfo {
  id: string
  status: string
  language: string
  vttUrl?: string
}

async function checkSubtitleStatus(assetId: string): Promise<{
  assetStatus: string
  tracks: SubtitleTrackInfo[]
  playbackId?: string
}> {
  console.log(`🔍 Checking subtitle status for asset: ${assetId}`)

  try {
    const mux = getMuxClient()
    const asset = await mux.video.assets.retrieve(assetId)

    console.log(`📊 Asset Status: ${asset.status}`)
    console.log(`⏱️  Duration: ${asset.duration ? `${Math.round(asset.duration)}s` : 'N/A'}`)
    console.log(`🎬 Playback ID: ${asset.playback_ids?.[0]?.id || 'None'}`)
    console.log(`📋 Total Tracks: ${asset.tracks?.length || 0}`)

    const textTracks = asset.tracks?.filter(track => track.type === 'text') || []

    console.log(`\n🎭 Subtitle Tracks (${textTracks.length}):`)

    const subtitleInfo: SubtitleTrackInfo[] = []

    for (const track of textTracks) {
      const trackInfo: SubtitleTrackInfo = {
        id: track.id || 'unknown',
        status: track.status || 'unknown',
        language: track.language_code || 'unknown'
      }

      // Generate VTT URL if playback ID exists and track is ready
      if (asset.playback_ids?.[0]?.id && track.status === 'ready' && track.id) {
        // Construct VTT URL manually - Mux pattern: https://stream.mux.com/{playbackId}/text/{trackId}.vtt
        trackInfo.vttUrl = `https://stream.mux.com/${asset.playback_ids[0].id}/text/${track.id}.vtt`
      }

      subtitleInfo.push(trackInfo)

      console.log(`\n📝 Track ID: ${trackInfo.id}`)
      console.log(`   Status: ${trackInfo.status}`)
      console.log(`   Language: ${trackInfo.language}`)
      if (trackInfo.vttUrl) {
        console.log(`   VTT URL: ${trackInfo.vttUrl}`)
        console.log(`   🔗 Direct Link: ${trackInfo.vttUrl}`)
      } else {
        console.log(`   VTT URL: Not available (track not ready)`)
      }

      if (track.status === 'ready' && trackInfo.vttUrl) {
        console.log(`   ✅ VERIFICATION: curl "${trackInfo.vttUrl}"`)
      }
    }

    return {
      assetStatus: asset.status || 'unknown',
      tracks: subtitleInfo,
      playbackId: asset.playback_ids?.[0]?.id
    }

  } catch (error) {
    console.error('❌ Error checking subtitle status:', error)
    throw error
  }
}

async function main(): Promise<void> {
  try {
    const assetId = process.argv[2]

    if (!assetId) {
      console.log('❌ Usage: nx run api-media:check-subtitle-status <asset-id>')
      console.log('📝 Example: nx run api-media:check-subtitle-status mb4L5MM01cC4010102PsZpwd14OvQoOnC01M9QWl52n7H02sE')
      console.log('\n🔍 To find recent asset IDs, run: nx run api-media:list-mux-videos')
      process.exit(1)
    }

    await checkSubtitleStatus(assetId)

    console.log('\n🎯 Status check complete!')

  } catch (error) {
    console.error('❌ Command failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  void main()
}

export { checkSubtitleStatus }