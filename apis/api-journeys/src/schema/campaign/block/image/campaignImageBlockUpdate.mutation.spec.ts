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
import { transformInput } from '../../../block/image/transformInput'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../../block/image/transformInput', () => ({
  transformInput: vi.fn()
}))

const SRC = 'https://imagedelivery.net/accountHash/imageId/public'
const NEXT_SRC = 'https://imagedelivery.net/accountHash/otherId/public'

describe('campaignImageBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignImageBlockUpdate(
      $id: ID!
      $input: CampaignImageBlockUpdateInput!
    ) {
      campaignImageBlockUpdate(id: $id, input: $input) {
        id
        src
        alt
        altTranslations {
          languageId
          value
        }
        width
        height
        backgroundKind
        textColor
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    vi.mocked(transformInput).mockImplementation(
      async (input) =>
        ({ ...input, width: 640, height: 480, blurhash: 'LKO2?U%2Tw' }) as never
    )
    const image = campaignBlockWithAcl(fixture, 'heroId', {
      typename: 'CampaignImageBlock',
      src: SRC,
      alt: 'Before',
      altTranslations: { '496': { value: 'Avant', source: 'human' } },
      width: 1600,
      height: 900
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(image)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...image, ...data })) as never)
  })

  async function update(
    input: Record<string, unknown>,
    blockId = 'heroId'
  ): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id: blockId, input }
    })
  }

  it('updates the default-language alt, trimmed and capped at 500, leaving translations untouched', async () => {
    const result = await update({ alt: ` ${'x'.repeat(500)} ` })

    expect(result.data.campaignImageBlockUpdate).toMatchObject({
      alt: 'x'.repeat(500),
      altTranslations: [{ languageId: '496', value: 'Avant' }]
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroId' },
      data: { alt: 'x'.repeat(500) },
      include: { action: true }
    })
    expect(transformInput).not.toHaveBeenCalled()
  })

  it('rejects alt over 500 characters (BAD_USER_INPUT, alt)', async () => {
    const result = await update({ alt: 'x'.repeat(501) })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'alt'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('re-measures a new src on the server and discards the blurhash', async () => {
    const result = await update({ src: NEXT_SRC })

    expect(result.data.campaignImageBlockUpdate).toMatchObject({
      src: NEXT_SRC,
      width: 640,
      height: 480
    })
    expect(transformInput).toHaveBeenCalledWith(
      expect.objectContaining({ src: NEXT_SRC })
    )
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroId' },
      data: { src: NEXT_SRC, width: 640, height: 480 },
      include: { action: true }
    })
  })

  it('clears the image and its size with src null', async () => {
    const result = await update({ src: null })

    expect(result.data.campaignImageBlockUpdate).toMatchObject({
      src: null,
      width: null,
      height: null
    })
    expect(transformInput).not.toHaveBeenCalled()
  })

  it('rejects a src that is not an https imagedelivery.net address (BAD_USER_INPUT, src)', async () => {
    const result = await update({ src: 'https://example.com/picture.jpg' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'src'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('accepts the shared section fields through the shared helper', async () => {
    const result = await update({
      backgroundKind: 'contrast',
      textColor: ' #abc '
    })

    expect(result.data.campaignImageBlockUpdate).toMatchObject({
      backgroundKind: 'contrast',
      textColor: '#AABBCC'
    })
  })

  it('throws NOT_FOUND when the live block is another typename', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await update({ alt: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('requires campaign Update: FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroId',
        { typename: 'CampaignImageBlock' }
      )
    )

    const result = await update({ alt: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
