import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { assertHttpsUrl } from './assertHttpsUrl'
import { filterToTeamTemplates } from './filterToTeamTemplates'
import { generateUniqueSlug } from './generateUniqueSlug'
import { TemplateGalleryPageCreateInput } from './inputs'
import { TemplateGalleryPageRef } from './templateGalleryPage'
import { validateCreatorImageBlock } from './validateCreatorImageBlock'

type CreateInput = typeof TemplateGalleryPageCreateInput.$inferInput

builder.mutationField('templateGalleryPageCreate', (t) =>
  t
    .withAuth((_parent, args) => ({
      $all: {
        isAuthenticated: true,
        isInTeam: (args.input as CreateInput).teamId
      }
    }))
    .prismaField({
      type: TemplateGalleryPageRef,
      nullable: false,
      args: {
        input: t.arg({ type: TemplateGalleryPageCreateInput, required: true })
      },
      resolve: async (query, _parent, args) => {
        const {
          teamId,
          title,
          description,
          creatorName,
          creatorImageBlockId,
          mediaUrl,
          journeyIds
        } = args.input
        assertHttpsUrl(mediaUrl, 'mediaUrl')

        let attempt = 0
        while (true) {
          const slug = await generateUniqueSlug(title)
          try {
            return await prisma.$transaction(async (tx) => {
              const { validIds } = await filterToTeamTemplates(
                tx,
                teamId,
                journeyIds ?? []
              )
              if (creatorImageBlockId != null) {
                await validateCreatorImageBlock(tx, teamId, creatorImageBlockId)
              }
              return await tx.templateGalleryPage.create({
                ...query,
                data: {
                  team: { connect: { id: teamId } },
                  title,
                  description: description ?? undefined,
                  slug,
                  status: 'draft',
                  creatorName,
                  creatorImageBlock:
                    creatorImageBlockId != null
                      ? { connect: { id: creatorImageBlockId } }
                      : undefined,
                  mediaUrl: mediaUrl ?? undefined,
                  templates: {
                    createMany: {
                      data: validIds.map((journeyId, order) => ({
                        journeyId,
                        order
                      }))
                    }
                  }
                }
              })
            })
          } catch (error) {
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === 'P2002' &&
              attempt === 0
            ) {
              attempt += 1
              continue
            }
            throw error
          }
        }
      }
    })
)
