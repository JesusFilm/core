import { mockDeep } from 'vitest-mock-extended'

import { Prisma } from '@core/prisma/journeys/client'

import { planStructure } from './mcpStructure'
import { emptyBlock } from './mcpStructureState'

describe('media edits', () => {
  it('keeps trusted image dimensions, blurhash and neighboring fields during a sparse focal edit', async () => {
    const tx = mockDeep<Prisma.TransactionClient>()
    const blocks = [
      { ...emptyBlock('j', 'StepBlock', 'step'), parentOrder: 0 },
      {
        ...emptyBlock('j', 'CardBlock', 'card'),
        parentBlockId: 'step',
        parentOrder: 0
      },
      {
        ...emptyBlock('j', 'ImageBlock', 'image'),
        parentBlockId: 'card',
        parentOrder: 0,
        src: 'https://imagedelivery.net/account/asset/public',
        width: 1200,
        height: 800,
        blurhash: 'trusted-blurhash',
        alt: 'Human description',
        scale: 140
      }
    ]
    tx.block.findMany.mockResolvedValue(
      blocks.map((block) => ({
        ...block,
        action: null
      })) as unknown as Prisma.BlockGetPayload<{ include: { action: true } }>[]
    )
    const plan = await planStructure(
      tx,
      {
        id: 'j',
        website: false,
        menuStepBlockId: null,
        socialNodeX: null,
        socialNodeY: null
      },
      [{ type: 'image_set', block: { id: 'image' }, focalLeft: 25 }]
    )
    expect(plan.blockWrites).toEqual([
      { id: 'image', patch: { focalLeft: 25 } }
    ])
    expect(plan.changes[0].blocks[0].after).toMatchObject({
      width: 1200,
      height: 800,
      blurhash: 'trusted-blurhash',
      alt: 'Human description',
      scale: 140
    })
    expect(plan.changes[0].blocks[0].fields).toEqual(['focalLeft'])
  })
})
