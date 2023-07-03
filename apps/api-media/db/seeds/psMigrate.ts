import { aql } from 'arangojs'
import { PrismaClient } from '.prisma/api-media-client'
import { ArangoDB } from '../db'

const prisma = new PrismaClient()
const db = ArangoDB()

// TODO: REMOVE once converted to postgresql
export async function psMigrate(): Promise<void> {
  let offset = 0
  let end = true

  do {
    const cloudflareImages = await (
      await db.query(aql`
        FOR cloudflareImage IN cloudflareImages        
        LIMIT ${offset}, 50
        RETURN cloudflareImage
      `)
    ).all()
    for (const cloudflareImage of cloudflareImages) {
      console.log(
        `Importing cloudflareImage ${cloudflareImage._key as string}...`
      )
      await prisma.cloudflareImage.upsert({
        where: { id: cloudflareImage._key },
        update: {},
        create: {
          id: cloudflareImage._key,
          uploadUrl: cloudflareImage.uploadUrl,
          userId: cloudflareImage.userId,
          createdAt: new Date(cloudflareImage.createdAt),
          uploaded: cloudflareImage.uploaded
        }
      })
    }
    offset += 50
    end = cloudflareImages.length > 49
  } while (end)

  offset = 0
  end = true

  do {
    const cloudflareVideos = await (
      await db.query(aql`
        FOR cloudflareVideo IN cloudflareVideos        
        LIMIT ${offset}, 50
        RETURN cloudflareVideo
      `)
    ).all()
    for (const cloudflareVideo of cloudflareVideos) {
      console.log(
        `Importing cloudflareVideo ${cloudflareVideo._key as string}...`
      )
      await prisma.cloudflareVideo.upsert({
        where: { id: cloudflareVideo._key },
        update: {},
        create: {
          id: cloudflareVideo._key,
          uploadUrl: cloudflareVideo.uploadUrl,
          userId: cloudflareVideo.userId,
          name: cloudflareVideo.name,
          createdAt: new Date(cloudflareVideo.createdAt),
          readyToStream: cloudflareVideo.readyToStream
        }
      })
    }
    offset += 50
    end = cloudflareVideos.length > 49
  } while (end)
}
