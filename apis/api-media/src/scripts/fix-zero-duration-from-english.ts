import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()
const ENGLISH_LANGUAGE_ID = '529'
const SAMPLE_LIMIT = 20

type TargetVariant = {
  id: string
  videoId: string
  languageId: string
  edition: string | null
  duration: number | null
  lengthInMilliseconds: number | null
}

type EnglishVariant = {
  id: string
  videoId: string
  edition: string | null
  duration: number | null
  lengthInMilliseconds: number | null
}

type PlannedUpdate = {
  target: TargetVariant
  source: EnglishVariant
  nextDuration?: number
  nextLengthInMilliseconds?: number
}

function hasApplyFlag(argv: string[]): boolean {
  return argv.includes('--apply')
}

function getPositiveNumber(value: number | null | undefined): number | null {
  if (value == null) return null
  if (!Number.isFinite(value)) return null
  if (value <= 0) return null
  return value
}

function resolveLengthInMilliseconds(source: EnglishVariant): number {
  const sourceLengthMs = getPositiveNumber(source.lengthInMilliseconds)
  if (sourceLengthMs != null) return sourceLengthMs

  const sourceDuration = getPositiveNumber(source.duration)
  if (sourceDuration != null) return Math.round(sourceDuration * 1000)

  return 0
}

function needsDurationFix(value: number | null): boolean {
  const numericValue = value ?? 0
  return numericValue <= 0
}

function needsLengthFix(value: number | null): boolean {
  const numericValue = value ?? 0
  return numericValue <= 0
}

function chooseEnglishSource(
  target: TargetVariant,
  englishByVideoId: Map<string, EnglishVariant[]>
): EnglishVariant | null {
  const candidates = englishByVideoId.get(target.videoId) ?? []
  if (candidates.length === 0) return null

  const durationRequired = needsDurationFix(target.duration)
  const lengthRequired = needsLengthFix(target.lengthInMilliseconds)

  const canFixTargetFromCandidate = (candidate: EnglishVariant): boolean => {
    if (durationRequired && getPositiveNumber(candidate.duration) == null)
      return false
    if (lengthRequired && resolveLengthInMilliseconds(candidate) <= 0)
      return false
    return true
  }

  const sameEditionCandidate = candidates.find(
    (candidate) =>
      candidate.edition === target.edition &&
      canFixTargetFromCandidate(candidate)
  )
  if (sameEditionCandidate != null) return sameEditionCandidate

  const anyCandidate = candidates.find((candidate) =>
    canFixTargetFromCandidate(candidate)
  )
  return anyCandidate ?? null
}

async function main(): Promise<void> {
  const shouldApply = hasApplyFlag(process.argv.slice(2))

  console.log('=== Fix Zero/Null Duration From English Variant ===')
  console.log(`Mode: ${shouldApply ? 'APPLY' : 'DRY-RUN'}`)

  const targetVariants = await prisma.videoVariant.findMany({
    where: {
      OR: [
        { duration: 0 },
        { duration: null },
        { lengthInMilliseconds: 0 },
        { lengthInMilliseconds: null }
      ],
      hls: {
        not: null
      },
      NOT: {
        hls: ''
      }
    },
    select: {
      id: true,
      videoId: true,
      languageId: true,
      edition: true,
      duration: true,
      lengthInMilliseconds: true
    }
  })

  if (targetVariants.length === 0) {
    console.log('No zero/null duration or length HLS variants found.')
    return
  }

  const targetVideoIds = Array.from(
    new Set(targetVariants.map((variant) => variant.videoId))
  )
  const englishVariants = await prisma.videoVariant.findMany({
    where: {
      videoId: { in: targetVideoIds },
      languageId: ENGLISH_LANGUAGE_ID
    },
    select: {
      id: true,
      videoId: true,
      edition: true,
      duration: true,
      lengthInMilliseconds: true
    }
  })

  const englishByVideoId = new Map<string, EnglishVariant[]>()
  for (const englishVariant of englishVariants) {
    const existing = englishByVideoId.get(englishVariant.videoId) ?? []
    existing.push(englishVariant)
    englishByVideoId.set(englishVariant.videoId, existing)
  }

  const plannedUpdates: PlannedUpdate[] = []
  let missingEnglishCount = 0
  let missingUsableEnglishDataCount = 0
  let durationFixCount = 0
  let lengthFixCount = 0

  for (const target of targetVariants) {
    const source = chooseEnglishSource(target, englishByVideoId)
    if (source == null) {
      const hasAnyEnglish =
        (englishByVideoId.get(target.videoId) ?? []).length > 0
      if (hasAnyEnglish) {
        missingUsableEnglishDataCount++
      } else {
        missingEnglishCount++
      }
      continue
    }

    const nextUpdate: PlannedUpdate = {
      target,
      source
    }

    if (needsDurationFix(target.duration)) {
      const positiveDuration = getPositiveNumber(source.duration)
      if (positiveDuration == null) {
        missingUsableEnglishDataCount++
        continue
      }
      nextUpdate.nextDuration = positiveDuration
      durationFixCount++
    }

    if (needsLengthFix(target.lengthInMilliseconds)) {
      const nextLengthInMilliseconds = resolveLengthInMilliseconds(source)
      if (nextLengthInMilliseconds <= 0) {
        missingUsableEnglishDataCount++
        continue
      }
      nextUpdate.nextLengthInMilliseconds = nextLengthInMilliseconds
      lengthFixCount++
    }

    if (
      nextUpdate.nextDuration == null &&
      nextUpdate.nextLengthInMilliseconds == null
    ) {
      continue
    }

    plannedUpdates.push(nextUpdate)
  }

  console.log(`Found target variants: ${targetVariants.length}`)
  console.log(`Found English candidates: ${englishVariants.length}`)
  console.log(`Planned updates: ${plannedUpdates.length}`)
  console.log(`Planned duration fixes: ${durationFixCount}`)
  console.log(`Planned lengthInMilliseconds fixes: ${lengthFixCount}`)
  console.log(`Skipped (no English variant): ${missingEnglishCount}`)
  console.log(
    `Skipped (English exists but missing usable duration/length): ${missingUsableEnglishDataCount}`
  )

  if (plannedUpdates.length > 0) {
    console.log('\nSample planned updates:')
    for (const update of plannedUpdates.slice(0, SAMPLE_LIMIT)) {
      console.log(
        [
          `target=${update.target.id}`,
          `videoId=${update.target.videoId}`,
          `languageId=${update.target.languageId}`,
          `edition=${update.target.edition ?? 'null'}`,
          `fromEnglish=${update.source.id}`,
          update.nextDuration != null
            ? `duration=${update.target.duration ?? 0}->${update.nextDuration}`
            : 'duration=unchanged',
          update.nextLengthInMilliseconds != null
            ? `lengthMs=${update.target.lengthInMilliseconds ?? 0}->${update.nextLengthInMilliseconds}`
            : 'lengthMs=unchanged'
        ].join(' | ')
      )
    }
  }

  if (!shouldApply) {
    console.log('\nDry-run complete. Re-run with --apply to persist updates.')
    return
  }

  let updatedCount = 0
  for (const update of plannedUpdates) {
    const updateData: { duration?: number; lengthInMilliseconds?: number } = {}
    if (update.nextDuration != null) {
      updateData.duration = update.nextDuration
    }
    if (update.nextLengthInMilliseconds != null) {
      updateData.lengthInMilliseconds = update.nextLengthInMilliseconds
    }

    if (Object.keys(updateData).length === 0) continue

    await prisma.videoVariant.update({
      where: { id: update.target.id },
      data: updateData
    })
    updatedCount++
  }

  console.log(`\nApplied updates: ${updatedCount}`)
}

if (require.main === module) {
  void main()
    .catch((error) => {
      console.error('Failed to fix variant durations:', error)
      process.exitCode = 1
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
