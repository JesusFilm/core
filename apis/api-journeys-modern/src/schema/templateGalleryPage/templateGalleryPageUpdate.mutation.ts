import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { assertHttpsUrl } from './assertHttpsUrl'
import { filterToTeamTemplates } from './filterToTeamTemplates'
import { validateUserSuppliedSlug } from './generateUniqueSlug'
import { TemplateGalleryPageUpdateInput } from './inputs'
import { TemplateGalleryPageRef } from './templateGalleryPage'
import { validateCreatorImageBlock } from './validateCreatorImageBlock'

builder.mutationField('templateGalleryPageUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
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

      const slug =
        input.slug != null
          ? await validateUserSuppliedSlug(input.slug, id)
          : undefined

      return await prisma.$transaction(async (tx) => {
        // Block ownership validation runs INSIDE the transaction (parity with
        // the Create path). If we validated against the live prisma client
        // outside the tx, a publisher could pass an owned Block id and then
        // transfer the parent journey to another team in the window before
        // the update lands — leaving a foreign-team Block id on a future-public page.
        if (input.creatorImageBlockId != null) {
          await validateCreatorImageBlock(
            tx,
            page.teamId,
            input.creatorImageBlockId
          )
        }

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
        // creatorImageBlockId: undefined leaves alone, null clears it.
        if (input.creatorImageBlockId !== undefined) {
          data.creatorImageBlock =
            input.creatorImageBlockId === null
              ? { disconnect: true }
              : { connect: { id: input.creatorImageBlockId } }
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
