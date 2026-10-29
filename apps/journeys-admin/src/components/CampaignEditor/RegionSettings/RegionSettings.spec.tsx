import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'

import { CampaignTextSource } from '../../../../__generated__/globalTypes'
import { GET_CAMPAIGN_COUNTRIES } from '../../../libs/useCampaignCountriesQuery'
import { CAMPAIGN_REGION_COUNTRY_ADD } from '../../../libs/useCampaignRegionCountryAddMutation'
import { CAMPAIGN_REGION_COUNTRY_REMOVE } from '../../../libs/useCampaignRegionCountryRemoveMutation'
import { CAMPAIGN_REGION_UPDATE } from '../../../libs/useCampaignRegionUpdateMutation'
import { CAMPAIGN_TRANSLATION_SET } from '../../../libs/useCampaignTranslationSetMutation'
import { eurRegion } from '../data'
import { PreviewLanguageSwitch, StaticEditor } from '../testing'

import { RegionSettings } from './RegionSettings'

const countriesMock = {
  request: { query: GET_CAMPAIGN_COUNTRIES },
  result: {
    data: {
      countries: [
        {
          __typename: 'Country',
          id: 'FR',
          flagPngSrc: 'https://flags.example.org/fr.png',
          name: [{ __typename: 'CountryName', value: 'France' }]
        },
        {
          __typename: 'Country',
          id: 'DE',
          flagPngSrc: 'https://flags.example.org/de.png',
          name: [{ __typename: 'CountryName', value: 'Germany' }]
        }
      ]
    }
  }
}

function updateMock(
  input: Record<string, string>,
  result: Record<string, unknown>
) {
  return {
    request: {
      query: CAMPAIGN_REGION_UPDATE,
      variables: { id: 'eurRegionId', input }
    },
    result: vi.fn(() => result)
  }
}

const renameMock = updateMock(
  { name: 'Western Europe' },
  {
    data: {
      campaignRegionUpdate: {
        __typename: 'CampaignRegion',
        id: 'eurRegionId',
        name: 'Western Europe',
        slug: 'eur',
        listed: true
      }
    }
  }
)

const slugMock = updateMock(
  { slug: 'europe' },
  {
    data: {
      campaignRegionUpdate: {
        __typename: 'CampaignRegion',
        id: 'eurRegionId',
        name: 'Europe',
        slug: 'europe',
        listed: true
      }
    }
  }
)

const reservedSlugMock = updateMock(
  { slug: 'embed' },
  {
    errors: [
      new GraphQLError('slug "embed" is reserved', {
        extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
      })
    ]
  }
)

const longNameMock = updateMock(
  { name: 'Europe!' },
  {
    errors: [
      new GraphQLError('name must be at most 60 characters', {
        extensions: { code: 'BAD_USER_INPUT', field: 'name' }
      })
    ]
  }
)

const addCountryMock = {
  request: {
    query: CAMPAIGN_REGION_COUNTRY_ADD,
    variables: { regionId: 'eurRegionId', countryId: 'DE' }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionCountryAdd: {
        __typename: 'CampaignRegionCountry',
        id: 'eurCountry-DE',
        regionId: 'eurRegionId',
        countryId: 'DE',
        order: 1,
        country: {
          __typename: 'Country',
          id: 'DE',
          flagPngSrc: 'https://flags.example.org/de.png',
          name: [{ __typename: 'CountryName', value: 'Germany' }]
        }
      }
    }
  }))
}

const removeCountryMock = {
  request: {
    query: CAMPAIGN_REGION_COUNTRY_REMOVE,
    variables: { id: 'eurCountry-FR' }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionCountryRemove: {
        __typename: 'CampaignRegionCountry',
        id: 'eurCountry-FR',
        regionId: 'eurRegionId'
      }
    }
  }))
}

const translateNameMock = {
  request: {
    query: CAMPAIGN_TRANSLATION_SET,
    variables: {
      input: {
        target: { regionId: 'eurRegionId' },
        field: 'name',
        languageId: '496',
        value: 'Europe de l’Ouest'
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignTranslationSet: [
        {
          __typename: 'TranslatedValue',
          languageId: '496',
          value: 'Europe de l’Ouest',
          source: 'human'
        }
      ]
    }
  }))
}

const clearNameTranslationMock = {
  request: {
    query: CAMPAIGN_TRANSLATION_SET,
    variables: {
      input: {
        target: { regionId: 'eurRegionId' },
        field: 'name',
        languageId: '496',
        value: ''
      }
    }
  },
  result: vi.fn(() => ({ data: { campaignTranslationSet: [] } }))
}

function renderSettings(region = eurRegion, previewLanguageId = '529'): void {
  render(
    <StaticEditor
      initialState={{ previewLanguageId }}
      mocks={
        [
          countriesMock,
          renameMock,
          slugMock,
          reservedSlugMock,
          longNameMock,
          addCountryMock,
          removeCountryMock,
          translateNameMock,
          clearNameTranslationMock
        ] as never
      }
    >
      <PreviewLanguageSwitch languageIds={['529', '496']} />
      <RegionSettings region={region} />
    </StaticEditor>
  )
}

describe('RegionSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the name, the slug with its hint and the country chips', () => {
    renderSettings()

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Europe')
    expect(screen.getByRole('textbox', { name: 'Slug' })).toHaveValue('eur')
    expect(
      screen.getByText(
        'Changing this breaks links to this page you have already shared.'
      )
    ).toBeInTheDocument()
    const chips = screen.getByTestId('RegionSettingsCountries')
    expect(within(chips).getByText('France')).toBeInTheDocument()
    expect(chips.querySelector('img')).toHaveAttribute(
      'src',
      'https://flags.example.org/fr.png'
    )
  })

  it('counts the name and the slug against their caps', () => {
    renderSettings()

    expect(screen.getByText('6 / 60')).toBeInTheDocument()
    expect(screen.getByText('3 / 200')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
      target: { value: 'Europe!' }
    })

    expect(screen.getByText('7 / 60')).toBeInTheDocument()
  })

  describe('previewing a non-default language', () => {
    const translated = {
      ...eurRegion,
      nameTranslations: [
        {
          __typename: 'TranslatedValue' as const,
          languageId: '496',
          value: 'Europe',
          source: CampaignTextSource.human
        }
      ]
    }

    it('shows the name translation', () => {
      renderSettings(translated, '496')

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
        'Europe'
      )
    })

    it('shows the default name as the placeholder while untranslated', () => {
      renderSettings(eurRegion, '496')

      const name = screen.getByRole('textbox', { name: 'Name' })
      expect(name).toHaveValue('')
      expect(name).toHaveAttribute('placeholder', 'Europe')
    })

    it('writes the name as a translation, not the default column', async () => {
      renderSettings(eurRegion, '496')

      const name = screen.getByRole('textbox', { name: 'Name' })
      fireEvent.change(name, { target: { value: '  Europe de l’Ouest ' } })
      fireEvent.blur(name)

      await waitFor(() => expect(translateNameMock.result).toHaveBeenCalled())
      expect(renameMock.result).not.toHaveBeenCalled()
    })

    it('drops an uncommitted name when the Preview Language changes', () => {
      renderSettings(translated, '496')

      const name = screen.getByRole('textbox', { name: 'Name' })
      fireEvent.change(name, { target: { value: 'Europe de l’Ouest' } })
      fireEvent.click(screen.getByRole('button', { name: 'Preview 529' }))

      expect(name).toHaveValue('Europe')
      expect(name).not.toHaveAttribute('placeholder')
      expect(translateNameMock.result).not.toHaveBeenCalled()
      expect(renameMock.result).not.toHaveBeenCalled()
    })

    it('clears the translation when the name is emptied, instead of asking for a name', async () => {
      renderSettings(
        {
          ...eurRegion,
          nameTranslations: [
            {
              __typename: 'TranslatedValue',
              languageId: '496',
              value: 'Europe de l’Ouest',
              source: CampaignTextSource.human
            }
          ]
        },
        '496'
      )

      const name = screen.getByRole('textbox', { name: 'Name' })
      fireEvent.change(name, { target: { value: '' } })
      fireEvent.blur(name)

      await waitFor(() =>
        expect(clearNameTranslationMock.result).toHaveBeenCalled()
      )
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    })
  })

  it('saves the name on commit through campaignRegionUpdate', async () => {
    renderSettings()

    const name = screen.getByRole('textbox', { name: 'Name' })
    fireEvent.change(name, { target: { value: '  Western Europe ' } })
    fireEvent.blur(name)

    await waitFor(() => expect(renameMock.result).toHaveBeenCalled())
    expect(translateNameMock.result).not.toHaveBeenCalled()
  })

  it('requires a name and caps it at 60 characters before saving', async () => {
    renderSettings()

    const name = screen.getByRole('textbox', { name: 'Name' })
    fireEvent.change(name, { target: { value: '   ' } })
    fireEvent.blur(name)
    expect(await screen.findByText('Name is required')).toBeInTheDocument()

    fireEvent.change(name, { target: { value: 'x'.repeat(61) } })
    fireEvent.blur(name)
    expect(await screen.findByText('Max 60 characters')).toBeInTheDocument()
    expect(renameMock.result).not.toHaveBeenCalled()
  })

  it('shapes the slug as typed and saves it on commit', async () => {
    renderSettings()

    const slug = screen.getByRole('textbox', { name: 'Slug' })
    fireEvent.change(slug, { target: { value: 'Europe!' } })
    expect(slug).toHaveValue('europe-')
    fireEvent.blur(slug)

    await waitFor(() => expect(slugMock.result).toHaveBeenCalled())
    expect(slug).toHaveValue('europe')
  })

  it("shows the API's slug and name messages verbatim under the field, on the refused value", async () => {
    renderSettings()

    const slug = screen.getByRole('textbox', { name: 'Slug' })
    fireEvent.change(slug, { target: { value: 'embed' } })
    fireEvent.blur(slug)
    expect(
      await screen.findByText('slug "embed" is reserved')
    ).toBeInTheDocument()

    const name = screen.getByRole('textbox', { name: 'Name' })
    fireEvent.change(name, { target: { value: 'Europe!' } })
    fireEvent.blur(name)
    expect(
      await screen.findByText('name must be at most 60 characters')
    ).toBeInTheDocument()
    expect(name).toHaveValue('Europe!')
  })

  it("adds a country chip picked from the languages API's countries", async () => {
    renderSettings()

    const picker = screen.getByRole('combobox', { name: 'Add country' })
    await userEvent.click(picker)
    await userEvent.type(picker, 'Germ')
    fireEvent.click(await screen.findByRole('option', { name: 'Germany' }))

    await waitFor(() => expect(addCountryMock.result).toHaveBeenCalled())
  })

  it('removes a country chip', async () => {
    renderSettings()

    const chip = screen.getByTestId('RegionCountryChip-FR')
    fireEvent.click(within(chip).getByTestId('CancelIcon'))

    await waitFor(() => expect(removeCountryMock.result).toHaveBeenCalled())
  })
})
