import { Playlist, PlaylistItem, VideoVariant } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('playlistItem', () => {
  const client = getClient()

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      user: { id: 'testUserId' }
    }
  })

  const mockPlaylist: Playlist & { items: PlaylistItem[] } = {
    id: 'playlistId',
    name: 'Test Playlist',
    note: 'Test note',
    noteUpdatedAt: new Date('2023-01-01'),
    noteSharedAt: new Date('2023-01-02'),
    sharedAt: new Date('2023-01-03'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    slug: 'test-playlist',
    ownerId: 'testUserId',
    items: []
  }

  const mockPlaylistItem: PlaylistItem & {
    playlist: Playlist
    videoVariant: VideoVariant
  } = {
    id: 'playlistItemId',
    order: 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    playlistId: 'playlistId',
    videoVariantId: 'videoVariantId',
    playlist: mockPlaylist,
    videoVariant: {
      id: 'videoVariantId'
    } as any
  }

  describe('mutations', () => {
    describe('playlistItemAdd', () => {
      const ADD_ITEM_MUTATION = graphql(`
        mutation AddPlaylistItem(
          $id: ID
          $playlistId: ID!
          $videoVariantId: ID!
        ) {
          playlistItemAdd(
            id: $id
            playlistId: $playlistId
            videoVariantId: $videoVariantId
          ) {
            ... on MutationPlaylistItemAddSuccess {
              data {
                id
                order
                playlist {
                  id
                }
                videoVariant {
                  id
                }
                createdAt
                updatedAt
              }
            }
            ... on NotFoundError {
              message
              location {
                path
                value
              }
            }
          }
        }
      `)

      it('should add item to playlist', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
          id: 'videoVariantId'
        } as any)
        prismaMock.$transaction.mockImplementation(async (callback: any) =>
          callback(prismaMock)
        )
        prismaMock.playlistItem.create.mockResolvedValueOnce(mockPlaylistItem)

        const data = await authClient({
          document: ADD_ITEM_MUTATION,
          variables: {
            id: 'playlistItemId',
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId'
          }
        })

        expect(prismaMock.playlist.findUnique).toHaveBeenCalledWith({
          where: { id: 'playlistId', ownerId: 'testUserId' }
        })
        expect(prismaMock.videoVariant.findUnique).toHaveBeenCalledWith({
          where: { id: 'videoVariantId' }
        })
        expect(prismaMock.playlistItem.findFirst).toHaveBeenCalledWith({
          where: { playlistId: 'playlistId' },
          orderBy: { order: 'desc' },
          select: { order: true }
        })
        expect(prismaMock.playlistItem.create).toHaveBeenCalledWith({
          data: {
            id: 'playlistItemId',
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId',
            order: 0
          },
          include: {
            playlist: true,
            videoVariant: true
          }
        })
        expect(data).toHaveProperty('data.playlistItemAdd', {
          data: {
            id: 'playlistItemId',
            order: 1,
            playlist: { id: 'playlistId' },
            videoVariant: { id: 'videoVariantId' },
            createdAt: new Date('2023-01-01').toISOString(),
            updatedAt: new Date('2023-01-01').toISOString()
          }
        })
      })

      it('should add item with correct order when items exist', async () => {
        const existingItem = { ...mockPlaylistItem, order: 0 }
        const newItem = { ...mockPlaylistItem, order: 1 }

        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
          id: 'videoVariantId'
        } as any)
        prismaMock.$transaction.mockImplementation(async (callback: any) =>
          callback(prismaMock)
        )
        prismaMock.playlistItem.findFirst.mockResolvedValueOnce(existingItem)
        prismaMock.playlistItem.create.mockResolvedValueOnce(newItem)

        const data = await authClient({
          document: ADD_ITEM_MUTATION,
          variables: {
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId'
          }
        })

        expect(prismaMock.playlistItem.create).toHaveBeenCalledWith({
          data: {
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId',
            order: 1
          },
          include: {
            playlist: true,
            videoVariant: true
          }
        })
        expect(data).toHaveProperty('data.playlistItemAdd', {
          data: {
            id: 'playlistItemId',
            order: 1,
            playlist: { id: 'playlistId' },
            videoVariant: { id: 'videoVariantId' },
            createdAt: new Date('2023-01-01').toISOString(),
            updatedAt: new Date('2023-01-01').toISOString()
          }
        })
      })

      it('should fail if playlist not found', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(null)

        const data = await authClient({
          document: ADD_ITEM_MUTATION,
          variables: {
            playlistId: 'nonExistentId',
            videoVariantId: 'videoVariantId'
          }
        })

        expect(data).toHaveProperty('data.playlistItemAdd', {
          message: 'Playlist not found',
          location: [{ path: ['playlistId'], value: 'nonExistentId' }]
        })
        expect(prismaMock.playlistItem.create).not.toHaveBeenCalled()
      })

      it('should fail if video variant not found', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.videoVariant.findUnique.mockResolvedValueOnce(null)

        const data = await authClient({
          document: ADD_ITEM_MUTATION,
          variables: {
            playlistId: 'playlistId',
            videoVariantId: 'nonExistentId'
          }
        })

        expect(data).toHaveProperty('data.playlistItemAdd', {
          message: 'Video variant not found',
          location: [{ path: ['videoVariantId'], value: 'nonExistentId' }]
        })
        expect(prismaMock.playlistItem.create).not.toHaveBeenCalled()
      })

      it('should fail if not authenticated', async () => {
        const data = await client({
          document: ADD_ITEM_MUTATION,
          variables: {
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId'
          }
        })

        expect(data).toHaveProperty('data.playlistItemAdd', null)
        expect(prismaMock.playlistItem.create).not.toHaveBeenCalled()
      })
    })

    describe('playlistItemRemove', () => {
      const REMOVE_ITEM_MUTATION = graphql(`
        mutation RemovePlaylistItem($playlistId: ID!, $itemId: ID!) {
          playlistItemRemove(playlistId: $playlistId, itemId: $itemId) {
            ... on MutationPlaylistItemRemoveSuccess {
              data {
                id
                order
              }
            }
            ... on NotFoundError {
              message
              location {
                path
                value
              }
            }
          }
        }
      `)

      it('should remove item and reorder remaining items', async () => {
        const remainingItems = [
          {
            id: 'item1',
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId1'
          },
          {
            id: 'item2',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId2'
          },
          {
            id: 'item3',
            order: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId3'
          }
        ]

        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.playlistItem.findUnique.mockResolvedValueOnce(
          mockPlaylistItem
        )
        prismaMock.$transaction.mockImplementation(async (callback: any) =>
          callback(prismaMock)
        )
        prismaMock.playlistItem.delete.mockResolvedValueOnce(mockPlaylistItem)
        prismaMock.playlistItem.findMany.mockResolvedValueOnce(remainingItems)
        prismaMock.playlistItem.update.mockResolvedValue({} as any)

        // Mock the final findMany call that returns the reordered items
        prismaMock.playlistItem.findMany.mockResolvedValueOnce(remainingItems)

        const data = await authClient({
          document: REMOVE_ITEM_MUTATION,
          variables: {
            playlistId: 'playlistId',
            itemId: 'playlistItemId'
          }
        })

        expect(prismaMock.playlist.findUnique).toHaveBeenCalledWith({
          where: { id: 'playlistId', ownerId: 'testUserId' }
        })
        expect(prismaMock.playlistItem.findUnique).toHaveBeenCalledWith({
          where: { id: 'playlistItemId' }
        })
        expect(prismaMock.playlistItem.delete).toHaveBeenCalledWith({
          where: { id: 'playlistItemId' }
        })
        expect(prismaMock.playlistItem.findMany).toHaveBeenCalledWith({
          where: { playlistId: 'playlistId' },
          orderBy: { order: 'asc' },
          select: { id: true }
        })
        expect(prismaMock.playlistItem.update).toHaveBeenCalledWith({
          where: { id: 'item1' },
          data: { order: 0 }
        })
        expect(prismaMock.playlistItem.update).toHaveBeenCalledWith({
          where: { id: 'item2' },
          data: { order: 1 }
        })
        expect(prismaMock.playlistItem.update).toHaveBeenCalledWith({
          where: { id: 'item3' },
          data: { order: 2 }
        })
        expect(data).toHaveProperty('data.playlistItemRemove', {
          data: [
            expect.objectContaining({ id: 'item1', order: 0 }),
            expect.objectContaining({ id: 'item2', order: 1 }),
            expect.objectContaining({ id: 'item3', order: 2 })
          ]
        })
      })

      it('should fail if playlist not found', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(null)

        const data = await authClient({
          document: REMOVE_ITEM_MUTATION,
          variables: {
            playlistId: 'nonExistentId',
            itemId: 'playlistItemId'
          }
        })

        expect(data).toHaveProperty('data.playlistItemRemove', {
          message: 'Playlist not found',
          location: [{ path: ['playlistId'], value: 'nonExistentId' }]
        })
        expect(prismaMock.playlistItem.delete).not.toHaveBeenCalled()
      })

      it('should fail if item not found', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.playlistItem.findUnique.mockResolvedValueOnce(null)

        const data = await authClient({
          document: REMOVE_ITEM_MUTATION,
          variables: {
            playlistId: 'playlistId',
            itemId: 'nonExistentId'
          }
        })

        expect(data).toHaveProperty('data.playlistItemRemove', {
          message: 'Playlist item not found',
          location: [{ path: ['itemId'], value: 'nonExistentId' }]
        })
        expect(prismaMock.playlistItem.delete).not.toHaveBeenCalled()
      })

      it('should fail if item does not belong to playlist', async () => {
        const wrongItem = { ...mockPlaylistItem, playlistId: 'otherPlaylistId' }
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.playlistItem.findUnique.mockResolvedValueOnce(wrongItem)

        const data = await authClient({
          document: REMOVE_ITEM_MUTATION,
          variables: {
            playlistId: 'playlistId',
            itemId: 'playlistItemId'
          }
        })

        expect(data).toHaveProperty('data.playlistItemRemove', {
          message: 'Playlist item not found',
          location: [{ path: ['itemId'], value: 'playlistItemId' }]
        })
        expect(prismaMock.playlistItem.delete).not.toHaveBeenCalled()
      })

      it('should fail if not authenticated', async () => {
        const data = await client({
          document: REMOVE_ITEM_MUTATION,
          variables: {
            playlistId: 'playlistId',
            itemId: 'playlistItemId'
          }
        })

        expect(data).toHaveProperty('data.playlistItemRemove', null)
        expect(prismaMock.playlistItem.delete).not.toHaveBeenCalled()
      })
    })

    describe('playlistItemsReorder', () => {
      const REORDER_ITEMS_MUTATION = graphql(`
        mutation ReorderPlaylistItems($playlistId: ID!, $itemIds: [ID!]!) {
          playlistItemsReorder(playlistId: $playlistId, itemIds: $itemIds) {
            ... on MutationPlaylistItemsReorderSuccess {
              data {
                id
                order
              }
            }
            ... on NotFoundError {
              message
              location {
                path
                value
              }
            }
          }
        }
      `)

      it('should reorder playlist items', async () => {
        const reorderedItems = [
          {
            id: 'item1',
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId1'
          },
          {
            id: 'item2',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId2'
          },
          {
            id: 'item3',
            order: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
            playlistId: 'playlistId',
            videoVariantId: 'videoVariantId3'
          }
        ]

        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.playlistItem.findMany.mockResolvedValueOnce(reorderedItems)
        prismaMock.$transaction.mockImplementation(async (callback: any) =>
          callback(prismaMock)
        )
        prismaMock.playlistItem.update.mockResolvedValue({} as any)

        // Mock the final findMany call that returns the reordered items
        prismaMock.playlistItem.findMany.mockResolvedValueOnce(reorderedItems)

        const data = await authClient({
          document: REORDER_ITEMS_MUTATION,
          variables: {
            playlistId: 'playlistId',
            itemIds: ['item1', 'item2', 'item3']
          }
        })

        expect(prismaMock.playlist.findUnique).toHaveBeenCalledWith({
          where: { id: 'playlistId', ownerId: 'testUserId' }
        })
        expect(prismaMock.playlistItem.findMany).toHaveBeenCalledWith({
          where: {
            id: { in: ['item1', 'item2', 'item3'] },
            playlistId: 'playlistId'
          }
        })
        expect(prismaMock.playlistItem.updateMany).toHaveBeenCalledWith({
          where: {
            playlistId: 'playlistId',
            id: { in: ['item1', 'item2', 'item3'] }
          },
          data: { order: null }
        })
        expect(prismaMock.playlistItem.update).toHaveBeenCalledWith({
          where: { id: 'item1' },
          data: { order: 0 }
        })
        expect(prismaMock.playlistItem.update).toHaveBeenCalledWith({
          where: { id: 'item2' },
          data: { order: 1 }
        })
        expect(prismaMock.playlistItem.update).toHaveBeenCalledWith({
          where: { id: 'item3' },
          data: { order: 2 }
        })
        expect(data).toHaveProperty('data.playlistItemsReorder', {
          data: [
            expect.objectContaining({ id: 'item1', order: 0 }),
            expect.objectContaining({ id: 'item2', order: 1 }),
            expect.objectContaining({ id: 'item3', order: 2 })
          ]
        })
      })

      it('should fail if playlist not found', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(null)

        const data = await authClient({
          document: REORDER_ITEMS_MUTATION,
          variables: {
            playlistId: 'nonExistentId',
            itemIds: ['item1', 'item2']
          }
        })

        expect(data).toHaveProperty('data.playlistItemsReorder', {
          message: 'Playlist not found',
          location: [{ path: ['playlistId'], value: 'nonExistentId' }]
        })
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })

      it('should fail if some items not found in playlist', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.playlistItem.findMany.mockResolvedValueOnce([
          {
            id: 'item1',
            playlistId: 'playlistId',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            videoVariantId: 'videoVariantId1'
          }
        ]) // Only one item found, but two requested

        const data = await authClient({
          document: REORDER_ITEMS_MUTATION,
          variables: {
            playlistId: 'playlistId',
            itemIds: ['item1', 'item2']
          }
        })

        expect(data).toHaveProperty('data.playlistItemsReorder', {
          message: 'Some items not found in playlist',
          location: [{ path: ['itemIds'], value: 'item2' }]
        })
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })

      it('should fail if not authenticated', async () => {
        const data = await client({
          document: REORDER_ITEMS_MUTATION,
          variables: {
            playlistId: 'playlistId',
            itemIds: ['item1', 'item2']
          }
        })

        expect(data).toHaveProperty('data.playlistItemsReorder', null)
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })
    })
  })
})
