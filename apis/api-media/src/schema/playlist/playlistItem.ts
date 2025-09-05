import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { NotFoundError } from '../error/NotFoundError'

export const PlaylistItem = builder.prismaObject('PlaylistItem', {
  fields: (t) => ({
    id: t.exposeID('id'),
    order: t.expose('order', { type: 'Int', nullable: false }),
    createdAt: t.expose('createdAt', { type: 'Date', nullable: false }),
    videoVariant: t.relation('videoVariant'),
    playlist: t.relation('playlist')
  })
})

// Mutation: Add a video to a playlist
builder.mutationField('playlistItemAdd', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'PlaylistItem',
    errors: {
      types: [NotFoundError]
    },
    args: {
      playlistId: t.arg.id({ required: true }),
      videoVariantId: t.arg.id({ required: true })
    },
    resolve: async (
      query,
      _parent,
      { playlistId, videoVariantId },
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

      // Check if video variant exists
      const existingVideoVariant = await prisma.videoVariant.findUnique({
        where: { id: videoVariantId }
      })

      if (!existingVideoVariant) {
        throw new NotFoundError('Video variant not found', [
          { path: ['videoVariantId'], value: videoVariantId }
        ])
      }

      return await prisma.$transaction(async (transaction) => {
        // Get the next order number
        const lastItem = await transaction.playlistItem.findFirst({
          where: { playlistId },
          orderBy: { order: 'desc' },
          select: { order: true }
        })

        const nextOrder = lastItem?.order ? lastItem.order + 1 : 0

        return transaction.playlistItem.create({
          ...query,
          data: {
            playlistId,
            videoVariantId,
            order: nextOrder
          }
        })
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
              data: { order: index + 1 }
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
      await prisma.$transaction(async (transaction) =>
        Promise.all(
          itemIds.map((itemId, index) =>
            transaction.playlistItem.update({
              where: { id: itemId },
              data: { order: index + 1 }
            })
          )
        )
      )

      // Return the updated items
      return prisma.playlistItem.findMany({
        ...query,
        orderBy: { order: 'asc' }
      })
    }
  })
)
