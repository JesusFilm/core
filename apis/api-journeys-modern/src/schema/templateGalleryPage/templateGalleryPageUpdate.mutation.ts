import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { assertHttpsUrl } from './assertHttpsUrl'
import { filterToTeamTemplates } from './filterToTeamTemplates'
import { validateUserSuppliedSlug } from './generateUniqueSlug'
import { TemplateGalleryPageUpdateInput } from './inputs'
import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Update editable fields of a TemplateGalleryPage. All input fields are optional: a field omitted leaves the existing value alone, a field set to `null` clears it (where the field is nullable). When `input.journeyIds` is provided, the page's template list is replaced — existing assignments are deleted and recreated in the given order. Allowed on both `draft` and `published` pages (publishers can correct typos and curate the template list while live).\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the page's team.\n- BAD_USER_INPUT (field: `slug`): user-supplied slug fails shape, length, reserved-word, or uniqueness checks.\n- BAD_USER_INPUT (field: `mediaUrl` / `creatorImageSrc`): URL is not https.",
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
        if (input.journeyIds !== undefined && input.journeyIds !== null) {
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

        return await tx.templateGalleryPage.update({
          ...query,
          where: { id },
          data
        })
      })
    }
  })
)
