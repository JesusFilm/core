import cliProgress from 'cli-progress'
import { v4 as uuid } from 'uuid'

import { VideoSubtitle, VideoVariant } from '.prisma/api-media-client'

import { prisma } from '../../../../lib/prisma'

async function* get1000Variants(): AsyncGenerator<VideoVariant[]> {
  let page = 0
  const take = 10000
  let skip = 0
  let res = []

  console.log(`getting variants page: ${page}`)
  res = await prisma.videoVariant.findMany({
    skip,
    take
  })
  page++
  skip += take
  yield res

  while (res.length > 0) {
    console.log(`getting variants page: ${page}`)
    res = await prisma.videoVariant.findMany({
      skip,
      take
    })
    page++
    skip += take
    yield res
  }
}

async function* get1000Subtitles(): AsyncGenerator<VideoSubtitle[]> {
  let page = 0
  const take = 10000
  let skip = 0
  let res = []

  console.log(`getting subtitles page: ${page}`)
  res = await prisma.videoSubtitle.findMany({
    skip,
    take
  })
  page++
  skip += take
  yield res

  while (res.length > 0) {
    console.log(`getting subtitles page: ${page}`)
    res = await prisma.videoSubtitle.findMany({
      skip,
      take
    })
    page++
    skip += take
    yield res
  }
}

async function handleVariantsMigration(): Promise<void> {
  const bar1 = new cliProgress.SingleBar(
    { format: ' {bar} | videoVariants | {value}/{total}' },
    cliProgress.Presets.shades_classic
  )
  const count = await prisma.videoVariant.count()
  bar1.start(count, 0)

  const variantsGenerator = get1000Variants()
  let variants = await variantsGenerator.next()
  while (!variants.done) {
    for (const variant of variants.value) {
      const res = await prisma.videoEdition.findMany({
        where: { videoId: variant.videoId, name: variant.edition }
      })
      if (res.length === 0) {
        await prisma.videoEdition.create({
          data: {
            id: uuid(),
            videoId: variant.videoId,
            name: variant.edition
          }
        })
      }
      bar1.increment()
    }
    variants = await variantsGenerator.next()
  }
  bar1.increment()
}

async function handleSubtitlesMigration(): Promise<void> {
  const bar2 = new cliProgress.SingleBar(
    { format: ' {bar} | videoSubtitles | {value}/{total}' },
    cliProgress.Presets.shades_classic
  )
  const count = await prisma.videoSubtitle.count()
  bar2.start(count, 0)

  const subtitlesGenerator = get1000Subtitles()
  let subtitles = await subtitlesGenerator.next()
  while (!subtitles.done) {
    for (const subtitle of subtitles.value) {
      const res = await prisma.videoEdition.findMany({
        where: { videoId: subtitle.videoId, name: subtitle.edition }
      })
      if (res.length === 0) {
        await prisma.videoEdition.create({
          data: {
            id: uuid(),
            videoId: subtitle.videoId,
            name: subtitle.edition
          }
        })
      }
      bar2.increment()
    }
    subtitles = await subtitlesGenerator.next()
  }
  bar2.increment()
}

async function populateNullableEditionsFields(): Promise<void> {
  console.log('Starting the population of nullable fields...')
  await handleVariantsMigration()
  await handleSubtitlesMigration()
  console.log('COMPLETE!!!')
}

async function main(): Promise<void> {
  await populateNullableEditionsFields()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
