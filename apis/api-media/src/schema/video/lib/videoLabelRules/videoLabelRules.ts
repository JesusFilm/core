import { GraphQLError } from 'graphql'

import { Prisma, VideoLabel, prisma } from '@core/prisma/media/client'

// Mirrors the child-label choices in videos-admin VideoCreateForm. Parent
// labels not listed here (shortFilm, trailer, ...) leave children unrestricted.
const ALLOWED_CHILD_LABELS: Partial<Record<VideoLabel, readonly VideoLabel[]>> =
  {
    collection: ['episode', 'featureFilm', 'shortFilm', 'series'],
    featureFilm: ['segment', 'trailer', 'behindTheScenes'],
    series: ['episode', 'trailer', 'behindTheScenes'],
    episode: ['segment', 'trailer', 'behindTheScenes']
  }

const CONTAINER_LABELS: readonly VideoLabel[] = ['collection', 'series']

// A variant a viewer can actually stream. The empty English variant the
// create form adds to series and collections has none of these.
const PLAYABLE_VARIANT_WHERE: Prisma.VideoVariantWhereInput = {
  OR: [
    { hls: { not: null } },
    { dash: { not: null } },
    { muxVideoId: { not: null } }
  ]
}

function invalidLabelError(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT' }
  })
}

function assertChildLabelsAllowed(
  parentLabel: VideoLabel,
  children: Array<{ id: string; label: VideoLabel }>
): void {
  const allowed = ALLOWED_CHILD_LABELS[parentLabel]
  if (allowed == null) return

  const invalidChild = children.find((child) => !allowed.includes(child.label))
  if (invalidChild == null) return

  throw invalidLabelError(
    `A ${invalidChild.label} video "${invalidChild.id}" cannot be a child of a ${parentLabel}. ` +
      `Children of a ${parentLabel} must be one of: ${allowed.join(', ')}.`
  )
}

/** Throws unless every existing video in `childIds` may sit under `parentLabel`. */
export async function assertChildIdsAllowedUnderLabel(
  parentLabel: VideoLabel,
  childIds: string[]
): Promise<void> {
  if (ALLOWED_CHILD_LABELS[parentLabel] == null || childIds.length === 0) return

  const children = await prisma.video.findMany({
    where: { id: { in: childIds } },
    select: { id: true, label: true }
  })
  assertChildLabelsAllowed(parentLabel, children)
}

/**
 * Validates a videoUpdate against the label rules. Only what the update
 * changes is checked (a new label, or children added or removed), so saving
 * an unrelated field on an already mislabelled video still works.
 */
export async function assertVideoUpdateLabelsValid({
  videoId,
  label,
  childIds
}: {
  videoId: string
  label?: VideoLabel | null
  childIds?: { next: string[]; added: string[]; changed: boolean }
}): Promise<void> {
  if (label == null && childIds?.changed !== true) return

  const current = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      label: true,
      childIds: true,
      variants: {
        where: PLAYABLE_VARIANT_WHERE,
        select: { id: true },
        take: 1
      }
    }
  })
  if (current == null) return

  const labelChanged = label != null && label !== current.label
  const childrenChanged = childIds?.changed === true
  if (!labelChanged && !childrenChanged) return

  const nextLabel = label ?? current.label
  const nextChildIds = childIds?.next ?? current.childIds

  if (
    CONTAINER_LABELS.includes(nextLabel) &&
    nextChildIds.length === 0 &&
    current.variants.length > 0
  ) {
    throw invalidLabelError(
      `Video "${videoId}" cannot be labelled ${nextLabel}: a ${nextLabel} with no children cannot have playable variants. ` +
        `Add children, or use a label such as episode or featureFilm.`
    )
  }

  if (childrenChanged) {
    await assertChildIdsAllowedUnderLabel(nextLabel, childIds.added)
  }

  if (labelChanged) {
    const parents = await prisma.video.findMany({
      where: { childIds: { has: videoId } },
      select: { id: true, label: true }
    })
    for (const parent of parents) {
      assertChildLabelsAllowed(parent.label, [{ id: videoId, label }])
    }
  }
}
