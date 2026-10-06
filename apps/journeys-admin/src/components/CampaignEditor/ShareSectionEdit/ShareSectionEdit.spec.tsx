import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import {
  CampaignPageKind,
  IdType,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { GET_CAMPAIGN_JOURNEY_BY_LINK } from '../../../libs/useCampaignJourneyByLinkLazyQuery'
import { CAMPAIGN_REGION_LANGUAGE_CREATE } from '../../../libs/useCampaignRegionLanguageCreateMutation'
import { CAMPAIGN_REGION_LANGUAGE_DELETE } from '../../../libs/useCampaignRegionLanguageDeleteMutation'
import { CAMPAIGN_REGION_LANGUAGE_UPDATE } from '../../../libs/useCampaignRegionLanguageUpdateMutation'
import { campaignWithRegions, eurEnglish, eurFrench } from '../data'
import { QueriedEditor } from '../testing'

import { ShareSectionEdit, addLanguageOptions } from './ShareSectionEdit'

const languagesMock = {
  request: { query: GET_LANGUAGES, variables: { languageId: '529' } },
  result: {
    data: {
      languages: [
        {
          __typename: 'Language',
          id: '529',
          slug: 'english',
          name: [
            { __typename: 'LanguageName', value: 'English', primary: true }
          ]
        },
        {
          __typename: 'Language',
          id: '21028',
          slug: 'spanish',
          name: [
            { __typename: 'LanguageName', value: 'Español', primary: true }
          ]
        },
        {
          __typename: 'Language',
          id: '1106',
          slug: 'german',
          name: [
            { __typename: 'LanguageName', value: 'Deutsch', primary: true }
          ]
        },
        {
          __typename: 'Language',
          id: '496',
          slug: 'french',
          name: [
            { __typename: 'LanguageName', value: 'Français', primary: true }
          ]
        }
      ]
    }
  }
}

const spanishRow = {
  ...eurFrench,
  id: 'eurRegionId-21028',
  languageId: '21028',
  order: 2,
  language: {
    __typename: 'Language',
    id: '21028',
    bcp47: 'es',
    name: [{ __typename: 'LanguageName', value: 'Español', primary: true }]
  }
}

const createMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_CREATE,
    variables: { regionId: 'eurRegionId', languageId: '21028' }
  },
  result: vi.fn(() => ({ data: { campaignRegionLanguageCreate: spanishRow } }))
}

const deleteMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_DELETE,
    variables: { id: 'eurRegionId-496' }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageDelete: {
        __typename: 'CampaignRegionLanguage',
        id: 'eurRegionId-496',
        regionId: 'eurRegionId'
      }
    }
  }))
}

const journey = {
  __typename: 'Journey',
  id: 'frJourneyId',
  title: 'Noël en Europe',
  description: null,
  slug: 'noel-europe',
  status: JourneyStatus.published
}

const resolveMock = {
  request: {
    query: GET_CAMPAIGN_JOURNEY_BY_LINK,
    variables: { id: 'frJourneyId', idType: IdType.databaseId }
  },
  result: vi.fn(() => ({ data: { journey } }))
}

const linkMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: {
      id: 'eurRegionId-496',
      input: { url: 'https://admin.nextstep.is/journeys/frJourneyId' }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageUpdate: {
        ...eurFrench,
        journeyId: 'frJourneyId',
        title: 'Noël en Europe',
        description: null,
        qrCodeId: 'frQrCodeId',
        journey,
        qrCode: {
          __typename: 'QrCode',
          id: 'frQrCodeId',
          shortLink: {
            __typename: 'ShortLink',
            id: 'frShortLinkId',
            pathname: 'eur-fr',
            domain: {
              __typename: 'ShortLinkDomain',
              hostname: 'short.nextstep.is'
            }
          }
        }
      }
    }
  }))
}

const linkFailureMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: {
      id: 'eurRegionId-496',
      input: { url: 'https://your.nextstep.is/noel-europe' }
    }
  },
  result: vi.fn(() => ({
    errors: [
      new GraphQLError('Journey not found or not published', {
        extensions: { code: 'BAD_USER_INPUT', field: 'url' }
      })
    ]
  }))
}

const resolveBySlugMock = {
  request: {
    query: GET_CAMPAIGN_JOURNEY_BY_LINK,
    variables: { id: 'noel-europe', idType: IdType.slug }
  },
  result: vi.fn(() => ({ data: { journey } }))
}

const unlinkMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: { id: 'eurRegionId-529', input: { journeyId: null } }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageUpdate: {
        ...eurEnglish,
        journeyId: null,
        title: null,
        description: null,
        qrCodeId: null,
        journey: null,
        qrCode: null
      }
    }
  }))
}

function renderShare(): ReturnType<typeof render> {
  return render(
    <SnackbarProvider>
      <QueriedEditor
        campaignProp={campaignWithRegions}
        initialState={{
          pageKind: CampaignPageKind.regionTemplate,
          regionId: 'eurRegionId'
        }}
        mocks={[
          languagesMock,
          createMock,
          deleteMock,
          resolveMock,
          resolveBySlugMock,
          linkMock,
          linkFailureMock,
          unlinkMock
        ]}
      >
        <ShareSectionEdit block={{ id: 'regionShareId' }} />
      </QueriedEditor>
    </SnackbarProvider>
  )
}

describe('addLanguageOptions', () => {
  it('offers the page languages first, then the full catalogue, minus the languages already on the region', () => {
    const options = addLanguageOptions(
      campaignWithRegions,
      languagesMock.result.data.languages,
      new Set(['496'])
    )

    expect(options.map((language) => language.id)).toEqual([
      '529',
      '21028',
      '1106'
    ])
  })
})

describe('ShareSectionEdit', () => {
  beforeEach(() => vi.clearAllMocks())

  it("lists the region's Share Languages in order, every one shown, linked or not", async () => {
    renderShare()

    const english = await screen.findByTestId('ShareLanguageRow-529')
    expect(within(english).getByTestId('ShareLanguageLabel')).toHaveTextContent(
      'English'
    )
    expect(
      within(english).getByTestId('ShareLanguageJourney')
    ).toHaveTextContent('Christmas in Europe')
    expect(
      within(english).queryByTestId('ShareLanguageHidden')
    ).not.toBeInTheDocument()

    const french = screen.getByTestId('ShareLanguageRow-496')
    expect(within(french).getByTestId('ShareLanguageLabel')).toHaveTextContent(
      'Français (French)'
    )
    expect(within(french).getByTestId('ShareLanguageHidden')).toHaveTextContent(
      'Hidden until a journey is linked'
    )
    expect(
      within(french).getByRole('textbox', { name: 'Pick a journey' })
    ).toBeInTheDocument()

    const rows = screen.getAllByTestId(/^ShareLanguageRow-/)
    expect(rows.map((row) => row.dataset.testid)).toEqual([
      'ShareLanguageRow-529',
      'ShareLanguageRow-496'
    ])
  })

  it('offers the page languages first, then the full catalogue, and adds the chosen one', async () => {
    renderShare()

    const picker = within(
      await screen.findByTestId('ShareSectionAddLanguage')
    ).getByRole('combobox')
    await waitFor(() => expect(picker).not.toBeDisabled())
    fireEvent.focus(picker)
    fireEvent.keyDown(picker, { key: 'ArrowDown' })

    const options = await screen.findAllByRole('option')
    // English (page language, already a share language) and Français
    // (already a share language) are left out; the catalogue follows.
    expect(options.map((option) => option.textContent)).toEqual([
      'Español',
      'Deutsch'
    ])

    fireEvent.click(screen.getByRole('option', { name: 'Español' }))

    await waitFor(() => expect(createMock.result).toHaveBeenCalled())
    expect(
      await screen.findByTestId('ShareLanguageRow-21028')
    ).toBeInTheDocument()
  })

  it('removes a Share Language', async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    fireEvent.click(
      within(french).getByRole('button', { name: 'Remove language' })
    )

    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        screen.queryByTestId('ShareLanguageRow-496')
      ).not.toBeInTheDocument()
    )
  })

  it('links a pasted journey, showing the resolved journey first, then the snapshot', async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    const field = within(french).getByRole('textbox', {
      name: 'Pick a journey'
    })
    await userEvent.type(
      field,
      'https://admin.nextstep.is/journeys/frJourneyId{enter}'
    )

    expect(
      await within(french).findByTestId('JourneyPasteResolved')
    ).toHaveTextContent('Noël en Europe')
    expect(linkMock.result).not.toHaveBeenCalled()

    fireEvent.click(
      within(french).getByRole('button', { name: 'Use this journey' })
    )

    await waitFor(() => expect(linkMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        within(screen.getByTestId('ShareLanguageRow-496')).getByTestId(
          'ShareLanguageJourney'
        )
      ).toHaveTextContent('Noël en Europe')
    )
    expect(
      within(screen.getByTestId('ShareLanguageRow-496')).queryByTestId(
        'ShareLanguageHidden'
      )
    ).not.toBeInTheDocument()
  })

  it("shows the server's message verbatim when the link is refused", async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    const field = within(french).getByRole('textbox', {
      name: 'Pick a journey'
    })
    await userEvent.type(field, 'https://your.nextstep.is/noel-europe{enter}')
    fireEvent.click(
      await within(french).findByRole('button', { name: 'Use this journey' })
    )

    expect(
      await within(french).findByText('Journey not found or not published')
    ).toBeInTheDocument()
    expect(
      within(french).getByTestId('ShareLanguageHidden')
    ).toBeInTheDocument()
  })

  it('unlinks a journey', async () => {
    renderShare()

    const english = await screen.findByTestId('ShareLanguageRow-529')
    fireEvent.click(within(english).getByRole('button', { name: 'Unlink' }))

    await waitFor(() => expect(unlinkMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        within(screen.getByTestId('ShareLanguageRow-529')).getByTestId(
          'ShareLanguageHidden'
        )
      ).toBeInTheDocument()
    )
  })

  it('warns when a linked journey is no longer published', async () => {
    render(
      <SnackbarProvider>
        <QueriedEditor
          campaignProp={{
            ...campaignWithRegions,
            regions: campaignWithRegions.regions.map((region) =>
              region.id !== 'eurRegionId'
                ? region
                : {
                    ...region,
                    languages: [
                      {
                        ...eurEnglish,
                        journey: {
                          ...eurEnglish.journey!,
                          status: JourneyStatus.draft
                        }
                      }
                    ]
                  }
            )
          }}
          initialState={{
            pageKind: CampaignPageKind.regionTemplate,
            regionId: 'eurRegionId'
          }}
          mocks={[languagesMock]}
        >
          <ShareSectionEdit block={{ id: 'regionShareId' }} />
        </QueriedEditor>
      </SnackbarProvider>
    )

    expect(
      await screen.findByTestId('ShareLanguageUnpublished')
    ).toHaveTextContent('Journey unpublished')
  })

  it('renders nothing on the landing page', () => {
    render(
      <SnackbarProvider>
        <QueriedEditor
          campaignProp={campaignWithRegions}
          initialState={{ pageKind: CampaignPageKind.landing }}
          mocks={[languagesMock]}
        >
          <ShareSectionEdit block={{ id: 'regionShareId' }} />
        </QueriedEditor>
      </SnackbarProvider>
    )

    expect(screen.queryByTestId('ShareSectionEdit')).not.toBeInTheDocument()
  })
})
