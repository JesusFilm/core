import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { lockPage } from './applyContiguousOrder'
import { assertHttpsUrl } from './assertHttpsUrl'
import { filterToTeamTemplates } from './filterToTeamTemplates'
import {
  SlugTakenError,
  validateUserSuppliedSlug
} from './generateUniqueSlug'
import { TemplateGalleryPageUpdateInput } from './inputs'
import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Update editable fields of a TemplateGalleryPage. All input fields are optional: a field omitted leaves the existing value alone, a field set to `null` clears it (where the field is nullable). When `input.journeyIds` is provided, the page's template list is replaced — existing assignments are deleted and recreated in the given order. Single-membership is enforced: if any supplied journey id is currently a member of another TemplateGalleryPage, the call fails before any write. Allowed on both `draft` and `published` pages (publishers can correct typos and curate the template list while live).\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the page's team.\n- BAD_USER_INPUT (field: `slug`): user-supplied slug fails shape, length, reserved-word, or uniqueness checks — including the concurrent-Update race where two callers pass the same slug and the second one trips the DB unique constraint at commit time.\n- BAD_USER_INPUT (field: `mediaUrl` / `creatorImageSrc`): URL is not https.\n- CONFLICT (field: `journeyIds`; extension `journeyId` carries the offending id): one of the supplied journeys is already a member of another TemplateGalleryPage.",
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

      const slug =
        input.slug != null
          ? await validateUserSuppliedSlug(input.slug, id)
          : undefined

      return await prisma.$transaction(async (tx) => {
        // Page-level lock must run before any write to the templates join
        // table so concurrent reorder/assign mutations on the same page
        // serialize against this Update. Without it, an interleaved
        // assign can trip the (templateGalleryPageId, order) UNIQUE
        // constraint mid-`createMany`.
        await lockPage(tx, id)

        if (input.journeyIds !== undefined && input.journeyIds !== null) {
          // Single-membership cross-page guard. Without this, a concurrent
          // assign of journey J to page Q can interleave with this Update's
          // delete+create on page P=id and leave J on BOTH pages — a direct
          // violation of the invariant that templateGalleryPageAssignJourney
          // and the rest of the surface uphold. We exclude rows already on
          // this page (`NOT: { templateGalleryPageId: id }`) so re-assigning
          // a journey already on this page is allowed (the row will be
          // re-created as part of the deleteMany+createMany pass).
          if (input.journeyIds.length > 0) {
            const conflicting = await tx.templateGalleryPageTemplate.findFirst({
              where: {
                journeyId: { in: input.journeyIds },
                NOT: { templateGalleryPageId: id }
              },
              select: { journeyId: true, templateGalleryPageId: true }
            })
            if (conflicting != null) {
              throw new GraphQLError(
                'journey already belongs to another collection',
                {
                  extensions: {
                    code: 'CONFLICT',
                    field: 'journeyIds',
                    journeyId: conflicting.journeyId
                  }
                }
              )
            }
          }
          await tx.templateGalleryPageTemplate.deleteMany({
            where: { templateGalleryPageId: id }
          })
          if (input.journeyIds.length > 0) {
            const { validIds } = await filterToTeamTemplates(
              tx,
              page.teamId,
              input.journeyIds
            )
            if (validIds.length > 0) {
              await tx.templateGalleryPageTemplate.createMany({
                data: validIds.map((journeyId, order) => ({
                  templateGalleryPageId: id,
                  journeyId,
                  order
                }))
              })
            }
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
