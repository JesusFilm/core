import { prismaMock } from '../../../test/prismaMock'

import { validateCreatorImageBlock } from './validateCreatorImageBlock'

describe('validateCreatorImageBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns without throwing when block belongs to a journey in the same team', async () => {
    prismaMock.block.findUnique.mockResolvedValue({
      journey: { teamId: 'team-1' }
    } as any)
    await expect(
      validateCreatorImageBlock(prismaMock as any, 'team-1', 'block-1')
    ).resolves.toBeUndefined()
  })

  it('throws BAD_USER_INPUT when the block does not exist', async () => {
    prismaMock.block.findUnique.mockResolvedValue(null)
    await expect(
      validateCreatorImageBlock(prismaMock as any, 'team-1', 'missing')
    ).rejects.toMatchObject({
      message: 'creator image block not found',
      extensions: { code: 'BAD_USER_INPUT', field: 'creatorImageBlockId' }
    })
  })

  it('throws FORBIDDEN when the block belongs to a journey in another team', async () => {
    prismaMock.block.findUnique.mockResolvedValue({
      journey: { teamId: 'team-OTHER' }
    } as any)
    await expect(
      validateCreatorImageBlock(prismaMock as any, 'team-1', 'block-1')
    ).rejects.toMatchObject({
      message: 'creator image block does not belong to your team',
      extensions: { code: 'FORBIDDEN', field: 'creatorImageBlockId' }
    })
  })

  it('throws FORBIDDEN when the block has no journey relation', async () => {
    prismaMock.block.findUnique.mockResolvedValue({ journey: null } as any)
    await expect(
      validateCreatorImageBlock(prismaMock as any, 'team-1', 'orphan-block')
    ).rejects.toMatchObject({
      extensions: { code: 'FORBIDDEN' }
    })
  })
})
