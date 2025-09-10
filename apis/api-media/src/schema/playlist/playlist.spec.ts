import { Playlist, PlaylistItem } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('playlist', () => {
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

  describe('queries', () => {
    describe('playlists', () => {
      const PLAYLISTS_QUERY = graphql(`
        query Playlists {
          playlists {
            id
            name
            note
            noteUpdatedAt
            noteSharedAt
            sharedAt
            createdAt
            updatedAt
            slug
            owner {
              id
            }
            items {
              id
              order
            }
          }
        }
      `)

      it('should query playlists for authenticated user', async () => {
        prismaMock.playlist.findMany.mockResolvedValueOnce([mockPlaylist])

        const data = await authClient({
          document: PLAYLISTS_QUERY
        })

        expect(prismaMock.playlist.findMany).toHaveBeenCalledWith({
          where: {
            ownerId: 'testUserId'
          },
          orderBy: { updatedAt: 'desc' },
          include: {
            items: {
              orderBy: { order: 'asc' }
            }
          }
        })
        expect(data).toHaveProperty('data.playlists', [
          {
            id: 'playlistId',
            name: 'Test Playlist',
            note: 'Test note',
            noteUpdatedAt: new Date('2023-01-01').toISOString(),
            noteSharedAt: new Date('2023-01-02').toISOString(),
            sharedAt: new Date('2023-01-03').toISOString(),
            createdAt: new Date('2023-01-01').toISOString(),
            updatedAt: new Date('2023-01-01').toISOString(),
            slug: 'test-playlist',
            owner: { id: 'testUserId' },
            items: []
          }
        ])
      })

      it('should fail for unauthenticated user', async () => {
        const data = await client({
          document: PLAYLISTS_QUERY
        })

        expect(data).toHaveProperty('data.playlists', null)
        expect(prismaMock.playlist.findMany).not.toHaveBeenCalled()
      })
    })

    describe('playlist', () => {
      const PLAYLIST_QUERY = graphql(`
        query Playlist($id: ID!, $idType: IdType) {
          playlist(id: $id, idType: $idType) {
            ... on QueryPlaylistSuccess {
              data {
                id
                name
                slug
                owner {
                  id
                }
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

      it('should query playlist by ID for authenticated user', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)

        const data = await authClient({
          document: PLAYLIST_QUERY,
          variables: {
            id: 'playlistId',
            idType: 'databaseId'
          }
        })
        expect(prismaMock.playlist.findUnique).toHaveBeenCalledWith({
          where: {
            id: 'playlistId',
            OR: [{ sharedAt: { not: null } }, { ownerId: 'testUserId' }]
          }
        })
        expect(data).toHaveProperty('data.playlist', {
          data: {
            id: 'playlistId',
            name: 'Test Playlist',
            slug: 'test-playlist',
            owner: { id: 'testUserId' }
          }
        })
      })

      it('should query playlist by slug for authenticated user', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)

        const data = await authClient({
          document: PLAYLIST_QUERY,
          variables: {
            id: 'test-playlist',
            idType: 'slug'
          }
        })

        expect(prismaMock.playlist.findUnique).toHaveBeenCalledWith({
          where: {
            slug: 'test-playlist',
            OR: [{ sharedAt: { not: null } }, { ownerId: 'testUserId' }]
          }
        })
        expect(data).toHaveProperty('data.playlist', {
          data: {
            id: 'playlistId',
            name: 'Test Playlist',
            slug: 'test-playlist',
            owner: { id: 'testUserId' }
          }
        })
      })

      it('should query shared playlist for unauthenticated user', async () => {
        const sharedPlaylist = { ...mockPlaylist, sharedAt: new Date() }
        prismaMock.playlist.findUnique.mockResolvedValueOnce(sharedPlaylist)

        const data = await client({
          document: PLAYLIST_QUERY,
          variables: {
            id: 'playlistId',
            idType: 'databaseId'
          }
        })

        expect(prismaMock.playlist.findUnique).toHaveBeenCalledWith({
          where: {
            id: 'playlistId',
            sharedAt: { not: null }
          }
        })
        expect(data).toHaveProperty('data.playlist', {
          data: {
            id: 'playlistId',
            name: 'Test Playlist',
            slug: 'test-playlist',
            owner: { id: 'testUserId' }
          }
        })
      })

      it('should return null for non-existent playlist', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(null)

        const data = await authClient({
          document: PLAYLIST_QUERY,
          variables: {
            id: 'nonExistentId',
            idType: 'databaseId'
          }
        })

        expect(data).toHaveProperty('data.playlist', {
          message: 'Playlist not found',
          location: [{ path: ['id'], value: 'nonExistentId' }]
        })
      })
    })
  })

  describe('mutations', () => {
    describe('playlistCreate', () => {
      const CREATE_PLAYLIST_MUTATION = graphql(`
        mutation CreatePlaylist($input: PlaylistCreateInput!) {
          playlistCreate(input: $input) {
            ... on MutationPlaylistCreateSuccess {
              data {
                id
                name
                note
                slug
                owner {
                  id
                }
              }
            }
            ... on ZodError {
              message
              fieldErrors {
                message
                path
              }
            }
          }
        }
      `)

      it('should create playlist with provided slug', async () => {
        prismaMock.playlist.create.mockResolvedValueOnce(mockPlaylist)

        const data = await authClient({
          document: CREATE_PLAYLIST_MUTATION,
          variables: {
            input: {
              name: 'Test Playlist',
              note: 'Test note',
              slug: 'test-playlist'
            }
          }
        })

        expect(prismaMock.playlist.create).toHaveBeenCalledWith({
          data: {
            name: 'Test Playlist',
            note: 'Test note',
            slug: 'test-playlist',
            ownerId: 'testUserId'
          }
        })
        expect(data).toHaveProperty('data.playlistCreate', {
          data: {
            id: 'playlistId',
            name: 'Test Playlist',
            note: 'Test note',
            slug: 'test-playlist',
            owner: { id: 'testUserId' }
          }
        })
      })

      it('should create playlist with custom ID', async () => {
        const customId = '550e8400-e29b-41d4-a716-446655440000'
        const playlistWithCustomId = { ...mockPlaylist, id: customId }
        prismaMock.playlist.create.mockResolvedValueOnce(playlistWithCustomId)

        const data = await authClient({
          document: CREATE_PLAYLIST_MUTATION,
          variables: {
            input: {
              id: customId,
              name: 'Test Playlist'
            }
          }
        })

        expect(prismaMock.playlist.create).toHaveBeenCalledWith({
          data: {
            id: customId,
            name: 'Test Playlist',
            ownerId: 'testUserId',
            note: undefined,
            noteUpdatedAt: undefined,
            noteSharedAt: undefined,
            sharedAt: undefined,
            slug: expect.stringMatching(/^[a-z0-9]{6}$/)
          }
        })
        expect(data).toHaveProperty('data.playlistCreate', {
          data: {
            id: customId,
            name: 'Test Playlist',
            note: 'Test note',
            slug: 'test-playlist',
            owner: { id: 'testUserId' }
          }
        })
      })

      it('should generate unique slug when not provided', async () => {
        // Mock the generateUniqueSlug function by mocking the database calls
        prismaMock.playlist.findUnique
          .mockResolvedValueOnce(null) // First check for uniqueness
          .mockResolvedValueOnce(mockPlaylist) // Return the created playlist
        prismaMock.playlist.create.mockResolvedValueOnce(mockPlaylist)

        const data = await authClient({
          document: CREATE_PLAYLIST_MUTATION,
          variables: {
            input: {
              name: 'Test Playlist'
            }
          }
        })

        expect(prismaMock.playlist.findUnique).toHaveBeenCalledWith({
          where: { slug: expect.stringMatching(/^[a-z0-9]{6}$/) }
        })
        expect(prismaMock.playlist.create).toHaveBeenCalledWith({
          data: {
            name: 'Test Playlist',
            slug: expect.stringMatching(/^[a-z0-9]{6}$/),
            ownerId: 'testUserId'
          }
        })
        expect(data).toHaveProperty('data.playlistCreate', {
          data: {
            id: 'playlistId',
            name: 'Test Playlist',
            note: 'Test note',
            slug: 'test-playlist',
            owner: { id: 'testUserId' }
          }
        })
      })

      it('should fail if not authenticated', async () => {
        const data = await client({
          document: CREATE_PLAYLIST_MUTATION,
          variables: {
            input: {
              name: 'Test Playlist'
            }
          }
        })

        expect(data).toHaveProperty('data.playlistCreate', null)
        expect(prismaMock.playlist.create).not.toHaveBeenCalled()
      })

      it('should validate slug format', async () => {
        const data = await authClient({
          document: CREATE_PLAYLIST_MUTATION,
          variables: {
            input: {
              name: 'Test Playlist',
              slug: 'Invalid Slug!' // Invalid slug format
            }
          }
        })

        expect(data).toHaveProperty('data.playlistCreate', {
          fieldErrors: [
            {
              message:
                'Slug must contain only lowercase letters, numbers, and dashes. Dashes cannot be at the start or end.',
              path: ['input', 'slug']
            }
          ],
          message: expect.any(String)
        })
        expect(prismaMock.playlist.create).not.toHaveBeenCalled()
      })

      it('should validate slug length', async () => {
        const data = await authClient({
          document: CREATE_PLAYLIST_MUTATION,
          variables: {
            input: {
              name: 'Test Playlist',
              slug: 'abc' // Too short
            }
          }
        })

        expect(data).toHaveProperty('data.playlistCreate', {
          fieldErrors: [
            {
              message: 'Slug must be at least 5 characters long',
              path: ['input', 'slug']
            }
          ],
          message: expect.any(String)
        })
        expect(prismaMock.playlist.create).not.toHaveBeenCalled()
      })

      it('should validate note length', async () => {
        const longNote = 'a'.repeat(1001) // Too long
        const data = await authClient({
          document: CREATE_PLAYLIST_MUTATION,
          variables: {
            input: {
              name: 'Test Playlist',
              note: longNote
            }
          }
        })

        expect(data).toHaveProperty('data.playlistCreate', {
          fieldErrors: [
            {
              message: 'Note must be less than 1000 characters',
              path: ['input', 'note']
            }
          ],
          message: expect.any(String)
        })
        expect(prismaMock.playlist.create).not.toHaveBeenCalled()
      })

      it('should validate UUID format for custom ID', async () => {
        const data = await authClient({
          document: CREATE_PLAYLIST_MUTATION,
          variables: {
            input: {
              id: 'invalid-uuid',
              name: 'Test Playlist'
            }
          }
        })

        expect(data).toHaveProperty('data.playlistCreate', {
          fieldErrors: [
            {
              message: 'ID must be a valid UUID',
              path: ['input', 'id']
            }
          ],
          message: expect.any(String)
        })
        expect(prismaMock.playlist.create).not.toHaveBeenCalled()
      })
    })

    describe('playlistUpdate', () => {
      const UPDATE_PLAYLIST_MUTATION = graphql(`
        mutation UpdatePlaylist($id: ID!, $input: PlaylistUpdateInput!) {
          playlistUpdate(id: $id, input: $input) {
            ... on MutationPlaylistUpdateSuccess {
              data {
                id
                name
                note
                noteUpdatedAt
                sharedAt
              }
            }
            ... on ZodError {
              message
              fieldErrors {
                message
                path
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

      it('should update playlist', async () => {
        const updatedPlaylist = {
          ...mockPlaylist,
          name: 'Updated Playlist',
          note: 'Updated note',
          noteUpdatedAt: new Date('2023-01-02')
        }
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.playlist.update.mockResolvedValueOnce(updatedPlaylist)

        const data = await authClient({
          document: UPDATE_PLAYLIST_MUTATION,
          variables: {
            id: 'playlistId',
            input: {
              name: 'Updated Playlist',
              note: 'Updated note'
            }
          }
        })

        expect(prismaMock.playlist.findUnique).toHaveBeenCalledWith({
          where: { id: 'playlistId', ownerId: 'testUserId' }
        })
        expect(prismaMock.playlist.update).toHaveBeenCalledWith({
          where: { id: 'playlistId' },
          data: {
            name: 'Updated Playlist',
            note: 'Updated note',
            noteUpdatedAt: expect.any(Date)
          }
        })
        expect(data).toHaveProperty('data.playlistUpdate', {
          data: {
            id: 'playlistId',
            name: 'Updated Playlist',
            note: 'Updated note',
            noteUpdatedAt: new Date('2023-01-02').toISOString(),
            sharedAt: new Date('2023-01-03').toISOString()
          }
        })
      })

      it('should update sharedAt timestamp', async () => {
        const sharedDate = new Date('2023-01-04')
        const updatedPlaylist = { ...mockPlaylist, sharedAt: sharedDate }
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.playlist.update.mockResolvedValueOnce(updatedPlaylist)

        const data = await authClient({
          document: UPDATE_PLAYLIST_MUTATION,
          variables: {
            id: 'playlistId',
            input: {
              sharedAt: sharedDate
            }
          }
        })

        expect(prismaMock.playlist.update).toHaveBeenCalledWith({
          where: { id: 'playlistId' },
          data: {
            sharedAt: sharedDate
          }
        })
        expect(data).toHaveProperty(
          'data.playlistUpdate.data.sharedAt',
          sharedDate.toISOString()
        )
      })

      it('should fail if playlist not found', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(null)

        const data = await authClient({
          document: UPDATE_PLAYLIST_MUTATION,
          variables: {
            id: 'nonExistentId',
            input: {
              name: 'Updated Playlist'
            }
          }
        })

        expect(data).toHaveProperty('data.playlistUpdate', {
          message: 'Playlist not found',
          location: [{ path: ['id'], value: 'nonExistentId' }]
        })
        expect(prismaMock.playlist.update).not.toHaveBeenCalled()
      })

      it('should fail if not authenticated', async () => {
        const data = await client({
          document: UPDATE_PLAYLIST_MUTATION,
          variables: {
            id: 'playlistId',
            input: {
              name: 'Updated Playlist'
            }
          }
        })

        expect(data).toHaveProperty('data.playlistUpdate', null)
        expect(prismaMock.playlist.update).not.toHaveBeenCalled()
      })
    })

    describe('playlistDelete', () => {
      const DELETE_PLAYLIST_MUTATION = graphql(`
        mutation DeletePlaylist($id: ID!) {
          playlistDelete(id: $id) {
            ... on MutationPlaylistDeleteSuccess {
              data {
                id
                name
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

      it('should delete playlist', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(mockPlaylist)
        prismaMock.playlist.delete.mockResolvedValueOnce(mockPlaylist)

        const data = await authClient({
          document: DELETE_PLAYLIST_MUTATION,
          variables: {
            id: 'playlistId'
          }
        })

        expect(prismaMock.playlist.findUnique).toHaveBeenCalledWith({
          where: { id: 'playlistId', ownerId: 'testUserId' }
        })
        expect(prismaMock.playlist.delete).toHaveBeenCalledWith({
          where: { id: 'playlistId' }
        })
        expect(data).toHaveProperty('data.playlistDelete', {
          data: {
            id: 'playlistId',
            name: 'Test Playlist'
          }
        })
      })

      it('should fail if playlist not found', async () => {
        prismaMock.playlist.findUnique.mockResolvedValueOnce(null)

        const data = await authClient({
          document: DELETE_PLAYLIST_MUTATION,
          variables: {
            id: 'nonExistentId'
          }
        })

        expect(data).toHaveProperty('data.playlistDelete', {
          message: 'Playlist not found',
          location: [{ path: ['id'], value: 'nonExistentId' }]
        })
        expect(prismaMock.playlist.delete).not.toHaveBeenCalled()
      })

      it('should fail if not authenticated', async () => {
        const data = await client({
          document: DELETE_PLAYLIST_MUTATION,
          variables: {
            id: 'playlistId'
          }
        })

        expect(data).toHaveProperty('data.playlistDelete', null)
        expect(prismaMock.playlist.delete).not.toHaveBeenCalled()
      })
    })
  })
})
