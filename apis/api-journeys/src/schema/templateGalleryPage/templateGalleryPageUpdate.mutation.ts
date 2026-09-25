import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { applyContiguousOrder, lockPage } from './applyContiguousOrder'
import { assertHttpsUrl } from './assertHttpsUrl'
import { filterToTeamTemplates } from './filterToTeamTemplates'
import { SlugTakenError, validateUserSuppliedSlug } from './generateUniqueSlug'
import { TemplateGalleryPageUpdateInput } from './inputs'
import {
  mediaCreateData,
  mediaUpdateData,
  resolveMediaInput
} from './media/resolveMediaInput'
import { addMembership, lockJourney, removeMembership } from './membership'
import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Update editable fields of a TemplateGalleryPage. All input fields are optional: a field omitted leaves the existing value alone, a field set to `null` clears it (where the field is nullable). When `input.journeyIds` is provided, the page's template list is replaced: journeys no longer listed are removed (promoting the oldest link elsewhere when the removed row was the journey's home), newly listed journeys are added (as the journey's home when it has none, otherwise as a link), and the page is reordered to the given order. A journey may belong to many pages. Allowed on both `draft` and `published` pages (publishers can correct typos and curate the template list while live).\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the page's team.\n- BAD_USER_INPUT (field: `slug`): user-supplied slug fails shape, length, reserved-word, or uniqueness checks — including the concurrent-Update race where two callers pass the same slug and the second one trips the DB unique constraint at commit time.\n- BAD_USER_INPUT (field: `mediaUrl` / `creatorImageSrc`): URL is not https.",
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      id: t.arg({
        type: 'ID',
        required: true,
        description: 'Stable page identifier.'
      }),
      input: t.arg({ type: TemplateGalleryPageUpdateInput, required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const input = args.input

      const page = await prisma.templateGalleryPage.findUnique({
        where: { id },
        select: { id: true, teamId: true }
      })
      if (page == null) {
        throw new GraphQLError('template gallery page not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: page.teamId }))) {
        throw new GraphQLError(
          'user is not allowed to update template gallery page',
          { extensions: { code: 'FORBIDDEN' } }
        )
      }

      assertHttpsUrl(input.mediaUrl, 'mediaUrl')
      assertHttpsUrl(input.creatorImageSrc, 'creatorImageSrc')

      // Validate + normalize media BEFORE the transaction — the external IO
      // (oEmbed fetches, cross-DB Mux read) must not run inside the tx. Returns
      // null when `input.media` is null or undefined (leave existing media
      // alone); otherwise carries the active `type` + per-slot merge intents.
      const resolvedMedia = await resolveMediaInput(input.media)

      const slug =
        input.slug != null
          ? await validateUserSuppliedSlug(input.slug, id)
          : undefined

      return await prisma.$transaction(async (tx) => {
        if (input.journeyIds !== undefined && input.journeyIds !== null) {
          const { validIds } = await filterToTeamTemplates(
            tx,
            page.teamId,
            input.journeyIds
          )
          const existing = await tx.templateGalleryPageTemplate.findMany({
            where: { templateGalleryPageId: id },
            select: { journeyId: true }
          })
          const existingIds = existing.map((row) => row.journeyId)
          // Lock every journey whose membership changes (sorted, so two
          // concurrent updates touching overlapping journeys cannot
          // deadlock), then the page — the same journey-then-page order
          // every membership mutation uses.
          const desired = new Set(validIds)
          const current = new Set(existingIds)
          const touched = [
            ...existingIds.filter((journeyId) => !desired.has(journeyId)),
            ...validIds.filter((journeyId) => !current.has(journeyId))
          ].sort()
          for (const journeyId of touched) {
            await lockJourney(tx, journeyId)
          }
          await lockPage(tx, id)
          for (const journeyId of existingIds) {
            if (!desired.has(journeyId)) {
              await removeMembership(tx, id, journeyId)
            }
          }
          for (const journeyId of validIds) {
            if (!current.has(journeyId)) {
              await addMembership(tx, id, journeyId)
            }
          }
          // Reorder to the supplied order. validIds is deduplicated and
          // every id now has a row on the page.
          const rows = await tx.templateGalleryPageTemplate.findMany({
            where: { templateGalleryPageId: id },
            select: { id: true, journeyId: true }
          })
          const rowByJourneyId = new Map(
            rows.map((row) => [row.journeyId, row])
          )
          await applyContiguousOrder(
            tx,
            id,
            validIds
              .map((journeyId) => rowByJourneyId.get(journeyId))
              .filter(
                (row): row is { id: string; journeyId: string } => row != null
              )
          )
        } else {
          // Page-level lock so concurrent membership mutations on this page
          // serialize against the media / scalar writes below.
          await lockPage(tx, id)
        }

        // media: undefined/null leaves the row alone (no delete — the row, once
        // created, persists; hide everything with `type: none` and clear a slot
        // with `url: null` / `muxVideoId: null`). When an object is supplied,
        // merge it: the active `type` is always set, and each payload slot is
        // left, cleared, or replaced per its merge intent (mediaUpdateData);
        // mediaCreateData seeds a fresh row if none exists yet.
        if (resolvedMedia != null) {
          // Upsert keyed on the unique templateGalleryPageId. A concurrent
          // first-create can race two upserts into a P2002 on that unique
          // constraint; surface it as CONFLICT rather than an unwrapped 500
          // (NES-1547 pattern).
          try {
            await tx.templateGalleryPageMedia.upsert({
              where: { templateGalleryPageId: id },
              create: {
                templateGalleryPageId: id,
                ...mediaCreateData(resolvedMedia)
              },
              update: mediaUpdateData(resolvedMedia)
            })
          } catch (error) {
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === 'P2002'
            ) {
              throw new GraphQLError('media was modified concurrently; retry', {
                extensions: { code: 'CONFLICT', field: 'media' }
              })
            }
            throw error
          }
        }

        const data: Prisma.TemplateGalleryPageUpdateInput = {
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          slug,
          creatorName: input.creatorName ?? undefined
        }
        // mediaUrl: undefined leaves alone, null clears it.
        if (input.mediaUrl !== undefined) {
          data.mediaUrl = input.mediaUrl
        }
        // creatorImageSrc: undefined leaves alone, null clears it.
        if (input.creatorImageSrc !== undefined) {
          data.creatorImageSrc = input.creatorImageSrc
        }
        // creatorImageAlt: undefined leaves alone, null clears it.
        if (input.creatorImageAlt !== undefined) {
          data.creatorImageAlt = input.creatorImageAlt
        }

        // P2002 on the slug UNIQUE constraint can fire under two concurrent
        // Updates with the same slug: validateUserSuppliedSlug runs outside
        // the transaction, so both calls pass validation, one writes first,
        // the second trips the constraint at commit. Surface as
        // SlugTakenError (same shape as the up-front validation) instead of
        // leaking a Prisma P2002 as an unwrapped 500.
        try {
          return await tx.templateGalleryPage.update({
            ...query,
            where: { id },
            data
          })
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002' &&
            Array.isArray(error.meta?.target) &&
            (error.meta.target as string[]).includes('slug')
          ) {
            throw new SlugTakenError()
          }
          throw error
        }
      })
    }
  })
)
