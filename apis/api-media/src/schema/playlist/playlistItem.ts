import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { NotFoundError } from '../error/NotFoundError'

import { PlaylistItemVideoInput } from './inputs/playlistItemVideo'

export const PlaylistItem = builder.prismaObject('PlaylistItem', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    order: t.expose('order', { type: 'Int', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    videoVariant: t.relation('videoVariant', { nullable: false }),
    playlist: t.relation('playlist', { nullable: false })
  })
})

// Mutation: Add videos to a playlist using video variant id
builder.mutationField('playlistItemAdd', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['PlaylistItem'],
    errors: { types: [NotFoundError] },
    args: {
      playlistId: t.arg.id({ required: true }),
      videoVariantIds: t.arg.idList({ required: true })
    },
    resolve: async (
      query,
      _parent,
      { playlistId, videoVariantIds },
      context
    ) => {
      // Check if playlist exists and user owns it
      const existingPlaylist = await prisma.playlist.findUnique({
        where: { id: playlistId, ownerId: context.user.id }
      })

      if (!existingPlaylist) {
        throw new NotFoundError('Playlist not found', [
          { path: ['playlistId'], value: playlistId }
        ])
      }

      // Find all video variants using videoVariantIds
      const videoVariants = await prisma.videoVariant.findMany({
        where: { id: { in: videoVariantIds } },
        select: { id: true }
      })

      // Check if all video variants exist
      const missingVariants = videoVariantIds.filter(
        (id) => !videoVariants.some(({ id: variantId }) => variantId === id)
      )
      if (missingVariants.length > 0) {
        throw new NotFoundError('Some video variants not found', [
          { path: ['videoVariantIds'], value: missingVariants.join(', ') }
        ])
      }

      const playlistItems = await prisma.$transaction(async (transaction) => {
        // Get the next order number
        const lastItem = await transaction.playlistItem.findFirst({
          where: { playlistId },
          orderBy: { order: 'desc' },
          select: { order: true }
        })

        const startOrder = lastItem?.order != null ? lastItem.order + 1 : 0

        return await transaction.playlistItem.createManyAndReturn({
          select: { id: true },
          data: videoVariantIds.map((videoVariantId, index) => ({
            playlistId,
            videoVariantId,
            order: startOrder + index
          }))
        })
      })

      return prisma.playlistItem.findMany({
        ...query,
        where: { id: { in: playlistItems.map((item) => item.id) } },
        orderBy: { order: 'asc' }
      })
    }
  })
)

// Mutation: Add videos to a playlist using video id and language id
builder.mutationField('playlistItemAddWithVideoAndLanguageIds', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['PlaylistItem'],
    errors: {
      types: [NotFoundError]
    },
    args: {
      playlistId: t.arg.id({ required: true }),
      videos: t.arg({ type: [PlaylistItemVideoInput], required: true })
    },
    resolve: async (query, _parent, { playlistId, videos }, context) => {
      // Check if playlist exists and user owns it
      const existingPlaylist = await prisma.playlist.findUnique({
        where: { id: playlistId, ownerId: context.user.id }
      })

      if (!existingPlaylist) {
        throw new NotFoundError('Playlist not found', [
          { path: ['playlistId'], value: playlistId }
        ])
      }

      // Find all video variants using videoId/languageId pairs
      const videoVariants = new Map(
        (
          await prisma.videoVariant.findMany({
            where: {
              OR: videos.map(({ videoId, languageId }) => ({
                videoId,
                languageId
              }))
            },
            select: { id: true, videoId: true, languageId: true }
          })
        ).map(({ id, videoId, languageId }) => [`${videoId}:${languageId}`, id])
      )

      // Check if all video variants exist
      const missingVariants = videos.filter(
        ({ languageId, videoId }) =>
          !videoVariants.has(`${videoId}:${languageId}`)
      )
      if (missingVariants.length > 0) {
        const missingPairs = missingVariants.map(
          ({ videoId, languageId }) => `${languageId}/${videoId}`
        )
        throw new NotFoundError('Some video variants not found', [
          { path: ['videos'], value: missingPairs.join(', ') }
        ])
      }

      const playlistItems = await prisma.$transaction(async (transaction) => {
        // Get the next order number
        const lastItem = await transaction.playlistItem.findFirst({
          where: { playlistId },
          orderBy: { order: 'desc' },
          select: { order: true }
        })

        const startOrder = lastItem?.order != null ? lastItem.order + 1 : 0

        return await transaction.playlistItem.createManyAndReturn({
          select: { id: true },
          data: videos.map(({ videoId, languageId }, index) => ({
            playlistId,
            videoVariantId: videoVariants.get(`${videoId}:${languageId}`)!,
            order: startOrder + index
          }))
        })
      })

      return prisma.playlistItem.findMany({
        ...query,
        where: { id: { in: playlistItems.map((item) => item.id) } },
        orderBy: { order: 'asc' }
      })
    }
  })
)

// Mutation: Remove a video from a playlist
builder.mutationField('playlistItemRemove', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['PlaylistItem'],
    errors: {
      types: [NotFoundError]
    },
    args: {
      playlistId: t.arg.id({ required: true }),
      itemId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { playlistId, itemId }, context) => {
      // Check if playlist exists and user owns it
      const existingPlaylist = await prisma.playlist.findUnique({
        where: { id: playlistId, ownerId: context.user.id }
      })

      if (!existingPlaylist) {
        throw new NotFoundError('Playlist not found', [
          { path: ['playlistId'], value: playlistId }
        ])
      }

      // Check if item exists and belongs to the playlist
      const item = await prisma.playlistItem.findUnique({
        where: { id: itemId }
      })

      if (!item || item.playlistId !== playlistId) {
        throw new NotFoundError('Playlist item not found', [
          { path: ['itemId'], value: itemId }
        ])
      }

      await prisma.$transaction(async (transaction) => {
        // Delete the item
        await transaction.playlistItem.delete({
          where: { id: itemId }
        })

        // Reorder remaining items using transaction
        const remainingItems = await transaction.playlistItem.findMany({
          where: { playlistId },
          orderBy: { order: 'asc' },
          select: { id: true }
        })

        await Promise.all(
          remainingItems.map((item, index) =>
            transaction.playlistItem.update({
              where: { id: item.id },
              data: { order: index }
            })
          )
        )
      })

      return prisma.playlistItem.findMany({
        ...query,
        where: { playlistId },
        orderBy: { order: 'asc' }
      })
    }
  })
)

// Mutation: Reorder playlist items
builder.mutationField('playlistItemsReorder', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['PlaylistItem'],
    errors: {
      types: [NotFoundError]
    },
    args: {
      playlistId: t.arg.id({ required: true }),
      itemIds: t.arg.idList({ required: true })
    },
    resolve: async (query, _parent, { playlistId, itemIds }, context) => {
      // Check if playlist exists and user owns it
      const existingPlaylist = await prisma.playlist.findUnique({
        where: { id: playlistId, ownerId: context.user.id }
      })

      if (!existingPlaylist) {
        throw new NotFoundError('Playlist not found', [
          { path: ['playlistId'], value: playlistId }
        ])
      }

      // Verify all items belong to this playlist
      const items = await prisma.playlistItem.findMany({
        where: {
          id: { in: itemIds },
          playlistId
        }
      })

      if (items.length !== itemIds.length) {
        throw new NotFoundError('Some items not found in playlist', [
          {
            path: ['itemIds'],
            value: itemIds
              .filter((id) => !items.some((item) => item.id === id))
              .join(', ')
          }
        ])
      }

      // Update order for each item using transaction
      await prisma.$transaction(async (transaction) => {
        await transaction.playlistItem.updateMany({
          where: { playlistId, id: { in: itemIds } },
          data: { order: null }
        })

        await Promise.all(
          itemIds.map((itemId, index) =>
            transaction.playlistItem.update({
              where: { id: itemId },
              data: { order: index }
            })
          )
        )
      })

      // Return the updated items
      return prisma.playlistItem.findMany({
        ...query,
        where: { playlistId },
        orderBy: { order: 'asc' }
      })
    }
  })
)
