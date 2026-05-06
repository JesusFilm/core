import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { assertHttpsUrl } from './assertHttpsUrl'
import { filterToTeamTemplates } from './filterToTeamTemplates'
import { generateUniqueSlug } from './generateUniqueSlug'
import { TemplateGalleryPageCreateInput } from './inputs'
import { TemplateGalleryPageRef } from './templateGalleryPage'

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
      description:
        'Create a new TemplateGalleryPage in `draft` status. The server generates a unique slug from `input.title`. Initial `journeyIds` are attached as templates in the order given (cross-team and non-template ids are silently filtered out).\n\nAuth: caller must be authenticated and a member of `input.teamId`.\n\nErrors:\n- BAD_USER_INPUT (field: `mediaUrl` / `creatorImageSrc`): URL is not https.\n- BAD_USER_INPUT (field: `slug`): the title normalizes to empty or to a reserved word.',
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
          creatorImageSrc,
          creatorImageAlt,
          mediaUrl,
          journeyIds
        } = args.input
        assertHttpsUrl(mediaUrl, 'mediaUrl')
        assertHttpsUrl(creatorImageSrc, 'creatorImageSrc')

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
              return await tx.templateGalleryPage.create({
                ...query,
                data: {
                  team: { connect: { id: teamId } },
                  title,
                  description: description ?? undefined,
                  slug,
                  status: 'draft',
                  creatorName,
                  creatorImageSrc: creatorImageSrc ?? undefined,
                  creatorImageAlt: creatorImageAlt ?? undefined,
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
