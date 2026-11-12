// Shared slug-ownership helpers for the Video/VideoSlug alias scheme.
// Used by video.ts (Video.slug) and videoVariant.ts (VideoVariant.slug's
// `<videoSlug>/<languageSlug>` prefix) so a rename can't be hijacked by a
// create/update on either model claiming a slug reserved as another
// video's alias.

import { Prisma, prisma } from '@core/prisma/media/client'

import { NotUniqueError } from '../../error/NotUniqueError'

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient

export async function assertSlugNotAliasOfOtherVideo(
  slug: string | null | undefined,
  videoId: string,
  client: PrismaClientOrTx = prisma
): Promise<void> {
  if (slug == null) return
  const alias = await client.videoSlug.findUnique({
    where: { value: slug },
    select: { videoId: true }
  })
  if (alias == null || alias.videoId === videoId) return
  throw new NotUniqueError('Video slug already exists', [
    { path: ['input', 'slug'], value: slug }
  ])
}

// assertSlugNotAliasOfOtherVideo only sees committed rows at the instant it
// runs - without this, a concurrent create/rename targeting the same slug
// value can commit between the check and the write, leaving the slug live
// on one video while VideoSlug still aliases it to another (TOCTOU; see
// PR #9978 review thread). Taking this lock first, inside the same
// transaction as the check and the write, serializes any two calls that
// touch the same slug value so the second one's check always sees the
// first one's committed effect.
export async function lockVideoSlug(
  tx: Prisma.TransactionClient,
  slug: string
): Promise<void> {
  // $executeRaw, not $queryRaw: pg_advisory_xact_lock returns void, which Prisma cannot deserialize.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'video-slug:' + slug}))`
}

// Serializes concurrent renames of the *same* video, taken before any read
// in the rename transaction. lockVideoSlug alone isn't enough to protect a
// video against itself: its lock keys are derived from a read of the
// video's current slug, and that read has to happen before the lock can be
// taken (the slug value *is* the key). Two renames racing on the same
// video race that pre-lock read too, so the second one can still act on a
// `previousSlug` the first has already committed by the time it is woken
// up (see PR #9978 review thread). Taking this lock first - keyed on the
// video id, not a slug value - makes every read taken after it, inside the
// same transaction, authoritative for this video, with no change to how
// lockVideoSlug's own cross-video ordering works (each call locks only its
// own video id, so there is nothing to order between distinct videos).
export async function lockVideo(
  tx: Prisma.TransactionClient,
  videoId: string
): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'video-rename:' + videoId}))`
}
