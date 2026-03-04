/**
 * Create an additional playback ID for a Mux asset.
 *
 * Usage:
 *   npx nx run api-media:mux-create-playback-id -- SuesUyEIxwlj1GU02JqdU27wO00ZNby8S7RkLm4mTJNNM
 *   pnpm exec ts-node -r dotenv/config apis/api-media/src/scripts/mux-create-playback-id.ts <assetId>
 *
 * Requires: MUX_ACCESS_TOKEN_ID, MUX_SECRET_KEY
 */

import Mux from '@mux/mux-node'

const ASSET_ID = process.argv[2]
if (!ASSET_ID) {
  console.error('Usage: mux-create-playback-id.ts <assetId>')
  process.exitCode = 1
  process.exit(1)
}

async function main(): Promise<void> {
  if (!process.env.MUX_ACCESS_TOKEN_ID || !process.env.MUX_SECRET_KEY) {
    console.error('Missing MUX_ACCESS_TOKEN_ID or MUX_SECRET_KEY')
    process.exitCode = 1
    return
  }

  const mux = new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY
  })

  console.log(`Creating playback ID for asset ${ASSET_ID}...`)
  const playbackId = await mux.video.assets.createPlaybackId(ASSET_ID, {
    policy: 'public'
  })
  console.log('Created playback ID:', playbackId.id)
  console.log('HLS URL:', `https://stream.mux.com/${playbackId.id}.m3u8`)
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
