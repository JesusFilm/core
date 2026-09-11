import { Video } from '@core/prisma/media/client'

import { prismaMock } from '../../../../../test/prismaMock'

import { seedVideoLanguages } from './videoLanguage'

describe('seedVideoLanguages', () => {
  it('routes every video through the shared recompute, so a container keeps its child-derived languages', async () => {
    // A container video (e.g. a series) has no variants of its own - if
    // this job derived availableLanguages from a video's own variants only,
    // it would zero this out even though the child legitimately provides
    // the language.
    prismaMock.video.findMany.mockResolvedValueOnce([
      { id: 'container' } as unknown as Video,
      { id: 'child' } as unknown as Video
    ])
    ;(prismaMock.video.findUnique as any).mockImplementation(
      async ({ where }: { where: { id?: string } }) => {
        if (where.id === 'container') {
          return {
            variants: [],
            children: [{ availableLanguages: ['529'] }]
          }
        }
        if (where.id === 'child') {
          return {
            variants: [{ languageId: '529' }],
            children: []
          }
        }
        return null
      }
    )
    ;(prismaMock.$transaction as any).mockImplementation(
      async (updates: Array<Promise<unknown>>) => Promise.all(updates)
    )

    await seedVideoLanguages()

    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'container' },
      data: { availableLanguages: ['529'] }
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'child' },
      data: { availableLanguages: ['529'] }
    })
  })

  it('still derives a leaf video (no children) from its own published variants', async () => {
    prismaMock.video.findMany.mockResolvedValueOnce([
      { id: 'leaf' } as unknown as Video
    ])
    ;(prismaMock.video.findUnique as any).mockImplementation(
      async ({ where }: { where: { id?: string } }) => {
        if (where.id === 'leaf') {
          return {
            variants: [{ languageId: '496' }, { languageId: '529' }],
            children: []
          }
        }
        return null
      }
    )
    ;(prismaMock.$transaction as any).mockImplementation(
      async (updates: Array<Promise<unknown>>) => Promise.all(updates)
    )

    await seedVideoLanguages()

    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'leaf' },
      data: { availableLanguages: ['496', '529'] }
    })
  })
})
