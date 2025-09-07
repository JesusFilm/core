import { GraphQLError } from 'graphql'
import { ZodError } from 'zod'

import { Prisma, prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { IdType, IdTypeShape } from '../enums/idType'
import { NotFoundError } from '../error/NotFoundError'
import { UserRef } from '../user'

import { PlaylistCreateInput } from './inputs/playlistCreate'
import { PlaylistUpdateInput } from './inputs/playlistUpdate'

async function generateUniqueSlug(): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const maxAttempts = 10

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const existing = await prisma.playlist.findUnique({
      where: { slug: result }
    })

    if (!existing) {
      return result
    }
  }

  throw new GraphQLError('Unable to generate unique slug after 10 attempts')
}

export const Playlist = builder.prismaObject('Playlist', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.expose('name', { type: 'String', nullable: false }),
    note: t.expose('note', { type: 'String', nullable: true }),
    noteUpdatedAt: t.expose('noteUpdatedAt', {
      type: 'DateTime',
      nullable: true
    }),
    noteSharedAt: t.expose('noteSharedAt', {
      type: 'DateTime',
      nullable: true
    }),
    sharedAt: t.expose('sharedAt', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    slug: t.expose('slug', { type: 'String', nullable: false }),
    owner: t.field({
      type: UserRef,
      resolve: async (parent) => ({ id: parent.ownerId })
    }),
    items: t.relation('items', {
      query: {
        orderBy: { order: 'asc' }
      }
    })
  })
})

// Query: Get all playlists owned by the user
builder.queryField('playlists', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['Playlist'],
    resolve: async (query, _parent, _args, context) => {
      return prisma.playlist.findMany({
        ...query,
        where: {
          ownerId: context.user.id
        },
        orderBy: { updatedAt: 'desc' }
      })
    }
  })
)

// Query: Get a single playlist by ID or slug
builder.queryField('playlist', (t) =>
  t.prismaField({
    type: 'Playlist',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        defaultValue: IdTypeShape.databaseId,
        required: true
      })
    },
    resolve: async (query, _parent, { id, idType }, context) => {
      const userId =
        context.type === 'authenticated' ? context.user.id : undefined

      const playlist = await prisma.playlist.findUnique({
        ...query,
        where: {
          ...(idType === IdTypeShape.slug ? { slug: id } : { id }),
          ...(userId
            ? { OR: [{ sharedAt: { not: null } }, { ownerId: userId }] }
            : { sharedAt: { not: null } })
        }
      })

      if (!playlist)
        throw new NotFoundError('Playlist not found', [
          {
            path: ['id'],
            value: id
          }
        ])

      return playlist
    }
  })
)

// Mutation: Create a new playlist
builder.mutationField('playlistCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Playlist',
    errors: {
      types: [ZodError]
    },
    args: {
      input: t.arg({ type: PlaylistCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }, context) => {
      const slug = input.slug || (await generateUniqueSlug())

      return prisma.playlist.create({
        ...query,
        data: {
          ...(input.id && { id: input.id }),
          name: input.name,
          note: input.note,
          noteSharedAt: input.noteSharedAt,
          sharedAt: input.sharedAt,
          slug,
          ownerId: context.user.id
        }
      })
    }
  })
)

// Mutation: Update a playlist
builder.mutationField('playlistUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Playlist',
    errors: {
      types: [ZodError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: PlaylistUpdateInput, required: true })
    },
    resolve: async (query, _parent, { id, input }, context) => {
      const existingPlaylist = await prisma.playlist.findUnique({
        where: { id, ownerId: context.user.id }
      })

      if (!existingPlaylist)
        throw new NotFoundError('Playlist not found', [
          {
            path: ['id'],
            value: id
          }
        ])

      const updateData: Prisma.PlaylistUpdateInput = {}

      if (input.name !== undefined) updateData.name = input.name ?? undefined
      if (input.note !== undefined) {
        updateData.note = input.note
        updateData.noteUpdatedAt = new Date()
      }
      if (input.noteSharedAt !== undefined)
        updateData.noteSharedAt = input.noteSharedAt
      if (input.sharedAt !== undefined) updateData.sharedAt = input.sharedAt

      return prisma.playlist.update({
        ...query,
        where: { id },
        data: updateData
      })
    }
  })
)

// Mutation: Delete a playlist
builder.mutationField('playlistDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Playlist',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, context) => {
      const existingPlaylist = await prisma.playlist.findUnique({
        where: { id, ownerId: context.user.id }
      })

      if (!existingPlaylist)
        throw new NotFoundError('Playlist not found', [
          {
            path: ['id'],
            value: id
          }
        ])

      return prisma.playlist.delete({
        ...query,
        where: { id }
      })
    }
  })
)
