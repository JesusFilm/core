import uniqWith from 'lodash/uniqWith'
import { v4 as uuid } from 'uuid'

import { VideoSubtitle, VideoVariant } from '.prisma/api-media-client'

import { prisma } from '../../../../lib/prisma'

async function* get1000Variants(): AsyncGenerator<VideoVariant[]> {
  let page = 0
  const take = 10000
  let skip = 0
  let res: VideoVariant[] = []

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
  let res: VideoSubtitle[] = []

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
  let fetched: number = 0
  const count = await prisma.videoVariant.count()

  const variantsGenerator = get1000Variants()
  let variants = await variantsGenerator.next()
  const createManyData: { id: string; videoId: string; name: string }[] = []
  while (!variants.done) {
    for (const variant of variants.value) {
      if (variant.videoId != null && variant.edition != null)
        createManyData.push({
          id: uuid(),
          videoId: variant.videoId,
          name: variant.edition
        })
    }

    fetched += variants.value.length
    console.log(`processed ${fetched} variants out of ${count}`)
    variants = await variantsGenerator.next()
  }
  const filteredCreateMany = uniqWith(
    createManyData,
    (dataA, dataB) =>
      dataA.name === dataB.name && dataA.videoId === dataB.videoId
  )
  console.log(`running create many for variants`)
  await prisma.videoEdition.createMany({
    data: filteredCreateMany,
    skipDuplicates: true
  })
  console.log(
    `running create successful for variants, subtitles will do a look against the new entries`
  )
}

async function handleSubtitlesMigration(): Promise<void> {
  let fetched: number = 0

  const count = await prisma.videoSubtitle.count()

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
    }
    fetched += subtitles.value.length
    console.log(`processed ${fetched} subtitles out of ${count}`)
    subtitles = await subtitlesGenerator.next()
  }
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
