import { mockDeep } from 'vitest-mock-extended'

import { Prisma } from '@core/prisma/journeys/client'
import type { EditInput } from '@core/yoga/mcp/editContract'
import { mediaSourceKey } from '@core/yoga/mcp/mediaContract'

import { planStructure } from './mcpStructure'
import { emptyBlock } from './mcpStructureState'

describe('media edits', () => {
  it('rejects a source replacement targeting an existing logo when website mode is disabled', async () => {
    const tx = mockDeep<Prisma.TransactionClient>()
    tx.block.findMany.mockResolvedValue([
      {
        ...emptyBlock('j', 'ImageBlock', 'logo'),
        src: 'https://images.unsplash.com/original-logo',
        action: null
      }
    ] as unknown as Prisma.BlockGetPayload<{ include: { action: true } }>[])
    const source = { source: 'unsplash' as const, id: 'replacement-logo' }
    await expect(
      planStructure(
        tx,
        {
          id: 'j',
          website: true,
          logoImageBlockId: 'logo',
          menuStepBlockId: null,
          socialNodeX: null,
          socialNodeY: null
        },
        [{ type: 'image_set', block: { id: 'logo' }, source }],
        {
          website: true,
          websiteMode: false,
          sources: new Map([
            [
              mediaSourceKey(source),
              {
                kind: 'image',
                src: 'https://images.unsplash.com/replacement-logo',
                width: 1200,
                height: 800,
                blurhash: 'trusted-logo-blurhash'
              }
            ]
          ])
        }
      )
    ).rejects.toThrow('ACCESS_DENIED_OR_NOT_FOUND')
  })

  it.each(['block_duplicate', 'step_duplicate'] as const)(
    'preserves authorized image metadata through chained %s local references',
    async (type) => {
      const tx = mockDeep<Prisma.TransactionClient>()
      const sourceImage = {
        ...emptyBlock('j', 'ImageBlock', 'image'),
        parentBlockId: 'card',
        parentOrder: 0,
        src: 'https://imagedelivery.net/account/asset/public',
        alt: 'Human description',
        focalLeft: 25
      }
      tx.block.findMany.mockResolvedValue(
        [
          { ...emptyBlock('j', 'StepBlock', 'step'), parentOrder: 0 },
          {
            ...emptyBlock('j', 'CardBlock', 'card'),
            parentBlockId: 'step',
            parentOrder: 0
          },
          sourceImage
        ].map((block) => ({
          ...block,
          action: null
        })) as unknown as Prisma.BlockGetPayload<{
          include: { action: true }
        }>[]
      )
      const readyImage = {
        kind: 'image' as const,
        src: sourceImage.src,
        width: 1200,
        height: 800,
        blurhash: 'trusted-blurhash'
      }
      const commands: EditInput['commands'] = [
        {
          type,
          source: { id: type === 'block_duplicate' ? 'image' : 'step' },
          key: 'copy1',
          placement: { position: 'end' }
        },
        {
          type,
          source: { local: 'copy1' },
          key: 'copy2',
          placement: { position: 'end' }
        }
      ]
      const plan = await planStructure(
        tx,
        {
          id: 'j',
          website: false,
          menuStepBlockId: null,
          socialNodeX: null,
          socialNodeY: null
        },
        commands,
        {
          website: false,
          websiteMode: true,
          sources: new Map([
            [
              mediaSourceKey({ source: 'existingImage', blockId: 'image' }),
              readyImage
            ]
          ])
        }
      )
      const copies = plan.blockWrites.filter(
        (write) => write.create?.typename === 'ImageBlock'
      )
      expect(copies).toHaveLength(2)
      expect(new Set(copies.map((copy) => copy.id)).size).toBe(2)
      for (const copy of copies) {
        expect(copy.id).not.toBe('image')
        expect(copy.create).toMatchObject({
          src: readyImage.src,
          width: readyImage.width,
          height: readyImage.height,
          blurhash: readyImage.blurhash,
          alt: sourceImage.alt,
          focalLeft: sourceImage.focalLeft
        })
      }
    }
  )

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
