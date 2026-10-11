import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { authClient, mockUser } from '../../../test/campaignBlockSpec'
import { CampaignFixture, campaignFactory } from '../../../test/campaignFactory'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { DARK_PRESET } from './seed/presets'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignThemeUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignThemeUpdate($id: ID!, $input: CampaignThemeUpdateInput!) {
      campaignThemeUpdate(id: $id, input: $input) {
        id
        campaignId
        themeMode
        headerFont
        bodyFont
        labelFont
        primaryColor
        accentColor
        backgroundColor
        surfaceColor
        textColor
        mutedColor
        contrastBackgroundColor
        contrastTextColor
        radius
        buttonRadius
      }
    }
  `)

  let fixture: CampaignFixture

  function mockTheme(role: 'member' | 'manager' | 'none' = 'member'): void {
    fixture =
      role === 'none'
        ? campaignFactory({ userId: 'someoneElse' }).build()
        : campaignFactory({ role }).build()
    prismaMock.campaignTheme.findUnique.mockResolvedValue({
      ...fixture.theme,
      campaign: fixture
    } as never)
    prismaMock.campaignTheme.update.mockImplementation((async ({
      data
    }: any) => ({ ...fixture.theme, ...data })) as never)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getUserFromPayload).mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    mockTheme()
  })

  async function update(
    input: Record<string, unknown>,
    id = 'campaignThemeId'
  ): Promise<any> {
    return await authClient({ document: UPDATE, variables: { id, input } })
  }

  it('updates only the given columns for a member', async () => {
    const result = await update({ radius: 'square' })

    expect(result).toEqual({
      data: {
        campaignThemeUpdate: {
          id: 'campaignThemeId',
          campaignId: 'campaignId',
          themeMode: 'light',
          headerFont: null,
          bodyFont: null,
          labelFont: null,
          primaryColor: '#C52D3A',
          accentColor: '#F2B544',
          backgroundColor: '#FBF7F1',
          surfaceColor: '#FFFFFF',
          textColor: '#26262E',
          mutedColor: '#6D6F81',
          contrastBackgroundColor: '#26262E',
          contrastTextColor: '#FFFFFF',
          radius: 'square',
          buttonRadius: 'pill'
        }
      }
    })
    expect(prismaMock.campaignTheme.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignThemeId' } })
    )
    expect(prismaMock.campaignTheme.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaignThemeId' },
        data: { radius: 'square' }
      })
    )
  })

  it('applies a preset as the mode and the eight colours in one call, leaving fonts and radii alone', async () => {
    const result = await update({ ...DARK_PRESET })

    expect(result.data.campaignThemeUpdate).toMatchObject({
      ...DARK_PRESET,
      headerFont: null,
      radius: 'rounded',
      buttonRadius: 'pill'
    })
    expect(prismaMock.campaignTheme.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: DARK_PRESET })
    )
  })

  it.each([
    'primaryColor',
    'accentColor',
    'backgroundColor',
    'surfaceColor',
    'textColor',
    'mutedColor',
    'contrastBackgroundColor',
    'contrastTextColor'
  ])(
    'normalises %s through assertHex and rejects null, "" and non-hex (BAD_USER_INPUT, the column)',
    async (column) => {
      const normalised = await update({ [column]: ' #abc ' })
      expect(normalised.data.campaignThemeUpdate[column]).toBe('#AABBCC')
      expect(prismaMock.campaignTheme.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { [column]: '#AABBCC' } })
      )

      for (const bad of [null, '', 'red', '#12345678']) {
        const result = await update({ [column]: bad })
        expect(result.errors[0].extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: column
        })
      }
      expect(prismaMock.campaignTheme.update).toHaveBeenCalledTimes(1)
    }
  )

  it.each(['headerFont', 'bodyFont', 'labelFont'])(
    'takes %s from the shared FontFamily list or null, else BAD_USER_INPUT on the column',
    async (column) => {
      const chosen = await update({ [column]: 'Playfair Display' })
      expect(chosen.data.campaignThemeUpdate[column]).toBe('Playfair Display')
      expect(prismaMock.campaignTheme.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { [column]: 'Playfair Display' } })
      )

      const cleared = await update({ [column]: null })
      expect(cleared.data.campaignThemeUpdate[column]).toBeNull()
      expect(prismaMock.campaignTheme.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { [column]: null } })
      )

      for (const bad of ['', 'Comic Sans', 'montserrat']) {
        const result = await update({ [column]: bad })
        expect(result.errors[0].extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: column
        })
      }
      expect(prismaMock.campaignTheme.update).toHaveBeenCalledTimes(2)
    }
  )

  it.each([
    ['themeMode', 'dark', 'midnight'],
    ['radius', 'veryRounded', 'circle'],
    ['buttonRadius', 'rounded', 'square']
  ])('takes %s from its enum only', async (column, valid, invalid) => {
    const accepted = await update({ [column]: valid })
    expect(accepted.data.campaignThemeUpdate[column]).toBe(valid)

    const rejected = await update({ [column]: invalid })
    expect(rejected.errors).toBeDefined()
    expect(rejected.data).toBeUndefined()

    const nulled = await update({ [column]: null })
    expect(nulled.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: column
    })
    expect(prismaMock.campaignTheme.update).toHaveBeenCalledTimes(1)
  })

  it('throws NOT_FOUND when the id does not resolve', async () => {
    prismaMock.campaignTheme.findUnique.mockResolvedValue(null)

    const result = await update({ radius: 'square' }, 'missing')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignTheme.update).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    mockTheme('none')

    const result = await update({ radius: 'square' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignTheme.update).not.toHaveBeenCalled()
  })
})
