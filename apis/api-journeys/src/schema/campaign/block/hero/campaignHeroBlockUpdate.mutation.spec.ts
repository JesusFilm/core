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

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignHeroBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignHeroBlockUpdate(
      $id: ID!
      $input: CampaignHeroBlockUpdateInput!
    ) {
      campaignHeroBlockUpdate(id: $id, input: $input) {
        id
        eyebrow
        title
        lede
        align
        backgroundKind
        backgroundColor
        coverBlockId
        backgroundOverlay
        headingColor
        textColor
        buttonColor
        buttonTextColor
        accentColor
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const hero = campaignBlockWithAcl(fixture, 'heroId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(hero)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...hero, ...data })) as never)
  })

  async function update(
    input: Record<string, unknown>,
    id = 'heroId'
  ): Promise<any> {
    return await authClient({ document: UPDATE, variables: { id, input } })
  }

  it('writes the given trimmed text fields and leaves the rest alone', async () => {
    const result = await update({ title: ' Christmas, shared ', lede: '' })

    expect(result.data.campaignHeroBlockUpdate).toMatchObject({
      eyebrow: 'Christmas 2026',
      title: 'Christmas, shared',
      lede: ''
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroId' },
      data: { title: 'Christmas, shared', lede: '' },
      include: { action: true }
    })
  })

  it.each([
    ['eyebrow', 80],
    ['title', 150],
    ['lede', 500]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await update({ [field]: 'x'.repeat(max) })
      expect(ok.errors).toBeUndefined()

      const result = await update({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  it('takes the campaign align enum', async () => {
    const result = await update({ align: 'left' })

    expect(result.data.campaignHeroBlockUpdate.align).toBe('left')
  })

  it.each([
    'backgroundColor',
    'headingColor',
    'textColor',
    'buttonColor',
    'buttonTextColor',
    'accentColor'
  ])(
    'normalises %s to #RRGGBB uppercase through the shared helper, takes null and rejects "" (BAD_USER_INPUT, the column)',
    async (column) => {
      const normalised = await update({ [column]: ' #abc ' })
      expect(normalised.data.campaignHeroBlockUpdate[column]).toBe('#AABBCC')
      expect(prismaMock.campaignBlock.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { [column]: '#AABBCC' } })
      )

      const cleared = await update({ [column]: null })
      expect(cleared.data.campaignHeroBlockUpdate[column]).toBeNull()

      for (const bad of ['', 'red']) {
        const result = await update({ [column]: bad })
        expect(result.errors[0].extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: column
        })
      }
    }
  )

  it('writes an explicit backgroundKind and overlay, leaving the colour and cover alone', async () => {
    const result = await update({
      backgroundKind: 'surface',
      backgroundOverlay: 'heavy'
    })

    expect(result.data.campaignHeroBlockUpdate).toMatchObject({
      backgroundKind: 'surface',
      backgroundOverlay: 'heavy'
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { backgroundKind: 'surface', backgroundOverlay: 'heavy' }
      })
    )
  })

  it.each([
    ['backgroundKind', 'gradient'],
    ['backgroundOverlay', 'dark']
  ])(
    'rejects an unknown %s at the schema (the enum) before the resolver',
    async (field, value) => {
      const result = await update({ [field]: value })

      expect(result.errors[0]).toBeDefined()
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    }
  )

  it('throws NOT_FOUND when the id is not a live hero block', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'carouselId')
    )

    const result = await update({ title: 'x' }, 'carouselId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroId'
      )
    )

    const result = await update({ title: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
  })
})
