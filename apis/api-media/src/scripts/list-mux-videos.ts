import Mux from '@mux/mux-node'

function getMuxClient(useUGC: boolean = false): Mux {
  if (useUGC) {
    if (process.env.MUX_UGC_ACCESS_TOKEN_ID == null)
      throw new Error('Missing MUX_UGC_ACCESS_TOKEN_ID')

    if (process.env.MUX_UGC_SECRET_KEY == null)
      throw new Error('Missing MUX_UGC_SECRET_KEY')

    return new Mux({
      tokenId: process.env.MUX_UGC_ACCESS_TOKEN_ID,
      tokenSecret: process.env.MUX_UGC_SECRET_KEY
    })
  }

  if (process.env.MUX_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_ACCESS_TOKEN_ID')

  if (process.env.MUX_SECRET_KEY == null)
    throw new Error('Missing MUX_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY
  })
}

async function listLatestMuxVideos(limit: number = 10, useUGC: boolean = false): Promise<void> {
  const envType = useUGC ? 'UGC' : 'Standard'
  console.log(`Fetching latest ${limit} videos from Mux (${envType} environment)...`)

  try {
    const mux = getMuxClient(useUGC)

    // Try the assets.list method with correct parameters
    const assetsPage = await mux.video.assets.list()

    // Get the data array from the page
    const assets = assetsPage.data || []

    console.log(`\nFound ${assets.length} videos (showing first ${Math.min(limit, assets.length)}):\n`)

    // Sort by created_at descending and take the first 'limit' items
    const sortedAssets = assets
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    sortedAssets.forEach((asset, index) => {
      console.log(`${index + 1}. Asset ID: ${asset.id}`)
      console.log(`   Created: ${asset.created_at}`)
      console.log(`   Status: ${asset.status}`)
      console.log(`   Duration: ${asset.duration ? `${Math.round(asset.duration)}s` : 'N/A'}`)
      console.log(`   Resolution: ${asset.max_stored_resolution || 'N/A'}`)
      console.log(`   Playback ID: ${asset.playback_ids?.[0]?.id || 'None'}`)
      if (asset.passthrough) {
        console.log(`   Passthrough: ${asset.passthrough}`)
      }
      console.log('   ---')
    })

  } catch (error) {
    console.error('Error fetching videos from Mux:', error)
    process.exit(1)
  }
}

async function main(): Promise<void> {
  const limit = parseInt(process.argv[2] || '10', 10)
  const useUGC = process.argv[3] === 'ugc'
  await listLatestMuxVideos(limit, useUGC)
}

if (require.main === module) {
  void main()
}