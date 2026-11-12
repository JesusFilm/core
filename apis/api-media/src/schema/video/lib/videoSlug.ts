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
