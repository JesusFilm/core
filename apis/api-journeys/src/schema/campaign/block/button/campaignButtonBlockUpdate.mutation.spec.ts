import { campaignBlockWithAcl } from '../../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'

import { validateButtonInput } from './validateButtonInput'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignButtonBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignButtonBlockUpdate(
      $id: ID!
      $input: CampaignButtonBlockUpdateInput!
    ) {
      campaignButtonBlockUpdate(id: $id, input: $input) {
        id
        label
        variant
        size
        align
        color
        labelColor
        placement
        action {
          __typename
          parentBlockId
        }
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const button = campaignBlockWithAcl(fixture, 'heroButtonId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(button)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...button, ...data })) as never)
  })

  async function update(
    input: Record<string, unknown>,
    id = 'heroButtonId'
  ): Promise<any> {
    return await authClient({ document: UPDATE, variables: { id, input } })
  }

  it('writes the trimmed label and keeps the action', async () => {
    const result = await update({ label: ' Pick a region ' })

    expect(result.data.campaignButtonBlockUpdate).toMatchObject({
      label: 'Pick a region',
      action: {
        __typename: 'CampaignScrollToBlockAction',
        parentBlockId: 'heroButtonId'
      }
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroButtonId' },
      data: { label: 'Pick a region' },
      include: { action: true }
    })
  })

  it('caps the label at 60 characters (BAD_USER_INPUT, label)', async () => {
    const result = await update({ label: 'x'.repeat(61) })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'label'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('takes variant text, contained, outlined or null for contained', async () => {
    for (const variant of ['text', 'contained', 'outlined']) {
      expect(validateButtonInput({ variant })).toEqual({
        buttonVariant: variant
      })
    }
    expect(() => validateButtonInput({ variant: 'ghost' })).toThrow(
      expect.objectContaining({
        extensions: { code: 'BAD_USER_INPUT', field: 'variant' }
      })
    )

    const result = await update({ variant: null })

    expect(result.data.campaignButtonBlockUpdate.variant).toBeNull()
  })

  it('takes size small, medium, large or null for medium', async () => {
    for (const size of ['small', 'medium', 'large']) {
      expect(validateButtonInput({ size })).toEqual({ buttonSize: size })
    }
    expect(() => validateButtonInput({ size: 'huge' })).toThrow(
      expect.objectContaining({
        extensions: { code: 'BAD_USER_INPUT', field: 'size' }
      })
    )

    const result = await update({ size: 'small' })

    expect(result.data.campaignButtonBlockUpdate.size).toBe('small')
  })

  it('takes align left, center, right or null to follow the section', async () => {
    const result = await update({ align: 'center' })

    expect(result.data.campaignButtonBlockUpdate.align).toBe('center')
    expect(() => validateButtonInput({ align: 'middle' })).toThrow(
      expect.objectContaining({
        extensions: { code: 'BAD_USER_INPUT', field: 'align' }
      })
    )
  })

  it.each(['color', 'labelColor'])(
    'normalises %s through assertHex and accepts null',
    async (field) => {
      const result = await update({ [field]: '#0f0' })

      expect(result.data.campaignButtonBlockUpdate[field]).toBe('#00FF00')

      const cleared = await update({ [field]: null })
      expect(cleared.data.campaignButtonBlockUpdate[field]).toBeNull()

      const bad = await update({ [field]: 'green' })
      expect(bad.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  it('throws NOT_FOUND when the id is not a live button block', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'footerCopyrightId')
    )

    const result = await update({ label: 'x' }, 'footerCopyrightId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroButtonId'
      )
    )

    const result = await update({ label: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
  })
})
