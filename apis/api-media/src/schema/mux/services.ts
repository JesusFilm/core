import Mux from '@mux/mux-node'

export function getClient(userGenerated: boolean): Mux {
  if (userGenerated) {
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

export async function getVideo(
  videoId: string,
  userGenerated: boolean
): Promise<Mux.Video.Asset> {
  return await getClient(userGenerated).video.assets.retrieve(videoId)
}
