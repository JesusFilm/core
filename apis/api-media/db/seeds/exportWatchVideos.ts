import { writeFileSync } from 'fs'
import { join } from 'path'

import { prisma } from '../../../../libs/prisma/media/src/client'

const LANGUAGE_ID = '529'

const WATCH_VIDEO_IDS = [
  '1_jf-0-0',
  '2_GOJ-0-0',
  'JFP-Featured',
  '8_NBC',
  'GOJohnCollection',
  'GOLukeCollection',
  'GOMarkCollection',
  'GOMattCollection',
  'LUMOCollection',
  '7_Origins',
  'Nua',
  '7_0-ncs',
  '7_Origins2Worth',
  'CS1',
  '11_Sermon',
  '11_Shema',
  '11_ReadBible',
  '11_Advent',
  'MAG1',
  '2_ElCamWaySJEN',
  '9_CreationtoChrist',
  '2_FileZero-0-0',
  '10_DarkroomFaith'
]

async function main(): Promise<void> {
  console.log('Collecting child video IDs...')
  const parents = await prisma.video.findMany({
    where: { id: { in: WATCH_VIDEO_IDS } },
    select: { id: true, children: { select: { id: true } } }
  })

  const childIdSet = new Set<string>()
  for (const p of parents) {
    for (const c of p.children) {
      if (!WATCH_VIDEO_IDS.includes(c.id)) childIdSet.add(c.id)
    }
  }
  const allIds = [...WATCH_VIDEO_IDS, ...Array.from(childIdSet)]
  console.log(
    `Found ${WATCH_VIDEO_IDS.length} parent + ${childIdSet.size} child = ${allIds.length} total videos`
  )

  console.log('Fetching video data (English only)...')
  const videos = await prisma.video.findMany({
    where: { id: { in: allIds } },
    include: {
      title: { where: { languageId: LANGUAGE_ID } },
      snippet: { where: { languageId: LANGUAGE_ID } },
      description: { where: { languageId: LANGUAGE_ID } },
      studyQuestions: { where: { languageId: LANGUAGE_ID } },
      imageAlt: { where: { languageId: LANGUAGE_ID } },
      variants: {
        where: { languageId: LANGUAGE_ID },
        include: { downloads: true }
      },
      videoEditions: true,
      subtitles: { where: { languageId: LANGUAGE_ID } },
      images: true,
      bibleCitation: true
    }
  })

  console.log('Fetching parent-child relationships...')
  const allParentChild = await prisma.video.findMany({
    where: { id: { in: allIds } },
    select: {
      id: true,
      children: {
        select: { id: true },
        where: { id: { in: allIds } }
      }
    }
  })
  const relations = allParentChild.flatMap((p) =>
    p.children.map((c) => ({ parentId: p.id, childId: c.id }))
  )

  const originIds = Array.from(
    new Set(
      videos.map((v) => v.originId).filter((id): id is string => id != null)
    )
  )
  console.log(`Fetching ${originIds.length} video origins...`)
  const origins = await prisma.videoOrigin.findMany({
    where: { id: { in: originIds } }
  })

  const bibleBookIds = Array.from(
    new Set(videos.flatMap((v) => v.bibleCitation.map((c) => c.bibleBookId)))
  )
  console.log(`Fetching ${bibleBookIds.length} bible books...`)
  const bibleBooks = await prisma.bibleBook.findMany({
    where: { id: { in: bibleBookIds } },
    include: { name: { where: { languageId: LANGUAGE_ID } } }
  })

  const fixture = { videos, relations, origins, bibleBooks }
  const json = JSON.stringify(
    fixture,
    (_key, value) => (typeof value === 'bigint' ? value.toString() : value)
  )

  const outPath = join(__dirname, 'watchVideos.data.json')
  writeFileSync(outPath, json)
  console.log(
    `Wrote fixture: ${videos.length} videos, ${relations.length} relations (${(Buffer.byteLength(json) / 1024).toFixed(0)} KB)`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
