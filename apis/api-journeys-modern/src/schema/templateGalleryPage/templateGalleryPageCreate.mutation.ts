import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { assertHttpsUrl } from './assertHttpsUrl'
import { filterToTeamTemplates } from './filterToTeamTemplates'
import { generateUniqueSlug } from './generateUniqueSlug'
import { TemplateGalleryPageCreateInput } from './inputs'
import { resolveMediaInput } from './media/resolveMediaInput'
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
          journeyIds,
          media
        } = args.input
        assertHttpsUrl(mediaUrl, 'mediaUrl')
        assertHttpsUrl(creatorImageSrc, 'creatorImageSrc')

        // Validate + normalize media BEFORE the transaction — the external IO
        // (oEmbed fetches, cross-DB Mux read) must not run inside the tx.
        const mediaCreate = await resolveMediaInput(media)

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
              const page = await tx.templateGalleryPage.create({
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
              if (mediaCreate != null) {
                // page.id is a fresh uuid so a media-row P2002 is unreachable
                // here, but wrap it as CONFLICT anyway to match the Update
                // path — a raw P2002 must never leak as a 500. A GraphQLError
                // is not a PrismaClientKnownRequestError, so it passes straight
                // through the slug-retry catch below.
                try {
                  await tx.templateGalleryPageMedia.create({
                    data: { templateGalleryPageId: page.id, ...mediaCreate }
                  })
                } catch (error) {
                  if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002'
                  ) {
                    throw new GraphQLError(
                      'media was modified concurrently; retry',
                      { extensions: { code: 'CONFLICT', field: 'media' } }
                    )
                  }
                  throw error
                }
              }
              // Re-read with the Pothos `query` spread so the response includes
              // the just-created `media` relation and any nested selections
              // (NES-1480: `query` must spread into the final read).
              return await tx.templateGalleryPage.findUniqueOrThrow({
                ...query,
                where: { id: page.id }
              })
            })
          } catch (error) {
            // Only retry the slug-uniqueness race: a fresh slug is generated on
            // the next pass. Other P2002s (e.g. on the media row) must NOT
            // trigger a slug-regenerating retry — propagate them.
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === 'P2002' &&
              Array.isArray(error.meta?.target) &&
              (error.meta.target as string[]).includes('slug') &&
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
