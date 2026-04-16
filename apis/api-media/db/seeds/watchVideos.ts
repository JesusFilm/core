import { readFileSync } from 'fs'
import { join } from 'path'

import { prisma } from '../../../../libs/prisma/media/src/client'

interface FixtureData {
  videos: VideoRecord[]
  relations: ParentChildLink[]
  origins: OriginRecord[]
  bibleBooks: BibleBookRecord[]
}

interface VideoRecord {
  id: string
  label: string
  primaryLanguageId: string
  published: boolean
  slug: string | null
  noIndex: boolean | null
  childIds: string[]
  locked: boolean
  availableLanguages: string[]
  originId: string | null
  restrictDownloadPlatforms: string[]
  restrictViewPlatforms: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  title: TitleRecord[]
  snippet: SnippetRecord[]
  description: DescriptionRecord[]
  studyQuestions: StudyQuestionRecord[]
  imageAlt: ImageAltRecord[]
  variants: VariantRecord[]
  videoEditions: EditionRecord[]
  subtitles: SubtitleRecord[]
  images: ImageRecord[]
  bibleCitation: BibleCitationRecord[]
}

interface TitleRecord {
  id: string
  value: string
  languageId: string
  primary: boolean
  crowdInId: string | null
  videoId: string
}

interface SnippetRecord {
  id: string
  value: string
  languageId: string
  primary: boolean
  videoId: string
}

interface DescriptionRecord {
  id: string
  value: string
  languageId: string
  primary: boolean
  videoId: string
  crowdInId: string | null
}

interface StudyQuestionRecord {
  id: string
  value: string
  languageId: string
  order: number
  primary: boolean
  crowdInId: string | null
  videoId: string
}

interface ImageAltRecord {
  id: string
  value: string
  languageId: string
  primary: boolean
  videoId: string
}

interface VariantRecord {
  id: string
  hls: string | null
  dash: string | null
  share: string | null
  downloadable: boolean
  duration: number | null
  lengthInMilliseconds: number | null
  languageId: string
  masterUrl: string | null
  masterWidth: number | null
  masterHeight: number | null
  published: boolean
  version: number
  edition: string
  slug: string
  videoId: string
  assetId: string | null
  muxVideoId: string | null
  brightcoveId: string | null
  downloads: DownloadRecord[]
}

interface DownloadRecord {
  id: string
  quality: string
  size: number | null
  height: number | null
  width: number | null
  bitrate: number | null
  version: number
  url: string
  assetId: string | null
  videoVariantId: string | null
}

interface EditionRecord {
  id: string
  name: string
  videoId: string
}

interface SubtitleRecord {
  id: string
  videoId: string
  edition: string
  vttAssetId: string | null
  vttSrc: string | null
  vttVersion: number
  srtAssetId: string | null
  srtSrc: string | null
  srtVersion: number
  primary: boolean
  languageId: string
}

interface ImageRecord {
  id: string
  uploadUrl: string | null
  userId: string
  uploaded: boolean
  aspectRatio: string | null
  videoId: string | null
  blurhash: string | null
}

interface BibleCitationRecord {
  id: string
  bibleBookId: string
  osisId: string
  chapterStart: number
  chapterEnd: number
  verseStart: number
  verseEnd: number
  videoId: string
  order: number
}

interface OriginRecord {
  id: string
  name: string
  description: string | null
}

interface BibleBookRecord {
  id: string
  osisId: string
  alternateName: string | null
  paratextAbbreviation: string
  isNewTestament: boolean
  order: number
  name: BibleBookNameRecord[]
}

interface BibleBookNameRecord {
  id: string
  value: string
  languageId: string
  primary: boolean
  bibleBookId: string
}

interface ParentChildLink {
  parentId: string
  childId: string
}

function loadFixture(): FixtureData {
  const raw = readFileSync(
    join(__dirname, 'watchVideos.data.json'),
    'utf8'
  )
  return JSON.parse(raw) as FixtureData
}

export async function seedWatchVideos(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    console.log('Skipping watch video seed (not development environment)')
    return
  }

  console.log('Seeding watch videos for development...')
  const fixture = loadFixture()

  await seedOrigins(fixture.origins)
  await seedBibleBooks(fixture.bibleBooks)
  await seedVideos(fixture.videos)
  await seedParentChildRelations(fixture.relations)

  console.log(`Seeded ${fixture.videos.length} watch videos with nested data`)
}

async function seedOrigins(origins: OriginRecord[]): Promise<void> {
  console.log(`  Seeding ${origins.length} video origins...`)
  for (const origin of origins) {
    await prisma.videoOrigin.upsert({
      where: { id: origin.id },
      update: {},
      create: {
        id: origin.id,
        name: origin.name,
        description: origin.description
      }
    })
  }
}

async function seedBibleBooks(books: BibleBookRecord[]): Promise<void> {
  console.log(`  Seeding ${books.length} bible books...`)
  for (const book of books) {
    await prisma.bibleBook.upsert({
      where: { id: book.id },
      update: {},
      create: {
        id: book.id,
        osisId: book.osisId,
        alternateName: book.alternateName,
        paratextAbbreviation: book.paratextAbbreviation,
        isNewTestament: book.isNewTestament,
        order: book.order,
        name: {
          create: book.name.map((n) => ({
            id: n.id,
            value: n.value,
            languageId: n.languageId,
            primary: n.primary
          }))
        }
      }
    })
  }
}

async function seedVideos(videos: VideoRecord[]): Promise<void> {
  console.log(`  Seeding ${videos.length} videos...`)
  for (const video of videos) {
    const existing = await prisma.video.findUnique({
      where: { id: video.id }
    })
    if (existing != null) continue

    await prisma.video.create({
      data: {
        id: video.id,
        label: video.label as never,
        primaryLanguageId: video.primaryLanguageId,
        published: video.published,
        slug: video.slug,
        noIndex: video.noIndex,
        childIds: video.childIds,
        locked: video.locked,
        availableLanguages: video.availableLanguages,
        originId: video.originId,
        restrictDownloadPlatforms: video.restrictDownloadPlatforms as never,
        restrictViewPlatforms: video.restrictViewPlatforms as never,
        publishedAt: video.publishedAt,
        title: {
          create: video.title.map((t) => ({
            id: t.id,
            value: t.value,
            languageId: t.languageId,
            primary: t.primary,
            crowdInId: t.crowdInId
          }))
        },
        snippet: {
          create: video.snippet.map((s) => ({
            id: s.id,
            value: s.value,
            languageId: s.languageId,
            primary: s.primary
          }))
        },
        description: {
          create: video.description.map((d) => ({
            id: d.id,
            value: d.value,
            languageId: d.languageId,
            primary: d.primary,
            crowdInId: d.crowdInId
          }))
        },
        studyQuestions: {
          create: video.studyQuestions.map((q) => ({
            id: q.id,
            value: q.value,
            languageId: q.languageId,
            order: q.order,
            primary: q.primary,
            crowdInId: q.crowdInId
          }))
        },
        imageAlt: {
          create: video.imageAlt.map((a) => ({
            id: a.id,
            value: a.value,
            languageId: a.languageId,
            primary: a.primary
          }))
        },
        images: {
          create: video.images.map((img) => ({
            id: img.id,
            uploadUrl: img.uploadUrl,
            userId: img.userId,
            uploaded: img.uploaded,
            aspectRatio: img.aspectRatio as never,
            blurhash: img.blurhash
          }))
        },
        videoEditions: {
          create: video.videoEditions.map((e) => ({
            id: e.id,
            name: e.name
          }))
        }
      }
    })

    for (const variant of video.variants) {
      await prisma.videoVariant.create({
        data: {
          id: variant.id,
          hls: variant.hls,
          dash: variant.dash,
          share: variant.share,
          downloadable: variant.downloadable,
          duration: variant.duration,
          lengthInMilliseconds: variant.lengthInMilliseconds,
          languageId: variant.languageId,
          masterUrl: variant.masterUrl,
          masterWidth: variant.masterWidth,
          masterHeight: variant.masterHeight,
          published: variant.published,
          version: variant.version,
          edition: variant.edition,
          slug: variant.slug,
          videoId: variant.videoId,
          assetId: variant.assetId,
          brightcoveId: variant.brightcoveId,
          downloads: {
            create: variant.downloads.map((dl) => ({
              id: dl.id,
              quality: dl.quality as never,
              size: dl.size,
              height: dl.height,
              width: dl.width,
              bitrate: dl.bitrate,
              version: dl.version,
              url: dl.url
            }))
          }
        }
      })
    }

    for (const sub of video.subtitles) {
      await prisma.videoSubtitle.create({
        data: {
          id: sub.id,
          videoId: sub.videoId,
          edition: sub.edition,
          vttSrc: sub.vttSrc,
          vttVersion: sub.vttVersion,
          srtSrc: sub.srtSrc,
          srtVersion: sub.srtVersion,
          primary: sub.primary,
          languageId: sub.languageId
        }
      })
    }

    for (const cite of video.bibleCitation) {
      await prisma.bibleCitation.create({
        data: {
          id: cite.id,
          bibleBookId: cite.bibleBookId,
          osisId: cite.osisId,
          chapterStart: cite.chapterStart,
          chapterEnd: cite.chapterEnd,
          verseStart: cite.verseStart,
          verseEnd: cite.verseEnd,
          videoId: cite.videoId,
          order: cite.order
        }
      })
    }
  }
}

async function seedParentChildRelations(
  relations: ParentChildLink[]
): Promise<void> {
  console.log(`  Linking ${relations.length} parent-child relationships...`)
  for (const rel of relations) {
    await prisma.video
      .update({
        where: { id: rel.parentId },
        data: {
          children: {
            connect: { id: rel.childId }
          }
        }
      })
      .catch(() => {
        // child or parent may not exist if it's outside our seed scope
      })
  }
}
