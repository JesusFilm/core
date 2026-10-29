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
  CampaignTextSource,
  IdType,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { GET_CAMPAIGN_ACCESSIBLE_JOURNEYS } from '../../../libs/useCampaignAccessibleJourneysLazyQuery'
import { GET_CAMPAIGN_JOURNEY_BY_LINK } from '../../../libs/useCampaignJourneyByLinkLazyQuery'
import { CAMPAIGN_REGION_LANGUAGE_CREATE } from '../../../libs/useCampaignRegionLanguageCreateMutation'
import { CAMPAIGN_REGION_LANGUAGE_DELETE } from '../../../libs/useCampaignRegionLanguageDeleteMutation'
import { CAMPAIGN_REGION_LANGUAGE_SNAPSHOT_REFRESH } from '../../../libs/useCampaignRegionLanguageSnapshotRefreshMutation'
import { CAMPAIGN_REGION_LANGUAGE_UPDATE } from '../../../libs/useCampaignRegionLanguageUpdateMutation'
import { campaignWithRegions, eurEnglish, eurFrench } from '../data'
import { CommandProbe, QueriedEditor, UndoRedo } from '../testing'

import { shareLanguageState } from './shareLanguage'
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
            { __typename: 'LanguageName', value: 'Français', primary: true },
            { __typename: 'LanguageName', value: 'French', primary: false }
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
  title: 'Campagne en Europe',
  description: null,
  slug: 'noel-europe',
  status: JourneyStatus.published
}

const accessibleJourneysMock = {
  request: { query: GET_CAMPAIGN_ACCESSIBLE_JOURNEYS },
  result: vi.fn(() => ({
    data: {
      journeys: [
        {
          ...journey,
          team: { __typename: 'Team', id: 'teamId', title: 'Équipe Europe' }
        },
        {
          ...journey,
          id: 'archivedJourneyId',
          title: 'Ancien Campagne',
          status: JourneyStatus.archived,
          team: { __typename: 'Team', id: 'teamId', title: 'Équipe Europe' }
        }
      ]
    }
  }))
}

const englishDeleteMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_DELETE,
    variables: { id: 'eurRegionId-529' }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageDelete: {
        __typename: 'CampaignRegionLanguage',
        id: 'eurRegionId-529',
        regionId: 'eurRegionId'
      }
    }
  }))
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
        title: 'Campagne en Europe',
        description: null,
        snapshotEdited: false,
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

const swapMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: {
      id: 'eurRegionId-529',
      input: { url: 'https://admin.nextstep.is/journeys/frJourneyId' }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageUpdate: {
        ...eurEnglish,
        journeyId: 'frJourneyId',
        title: 'Campagne en Europe',
        description: null,
        journey
      }
    }
  }))
}

const swapRelinkMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: { id: 'eurRegionId-529', input: { journeyId: 'frJourneyId' } }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageUpdate: {
        ...eurEnglish,
        journeyId: 'frJourneyId',
        title: 'Campagne en Europe',
        description: null,
        journey
      }
    }
  }))
}

const swapBackMock = {
  delay: 50,
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: { id: 'eurRegionId-529', input: { journeyId: 'eurJourneyId' } }
  },
  result: vi.fn(() => ({
    data: { campaignRegionLanguageUpdate: eurEnglish }
  }))
}

const restoreSnapshotMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: {
      id: 'eurRegionId-529',
      input: {
        title: 'My Outreach title',
        description: 'A journey for Europe.',
        snapshotEdited: true
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageUpdate: {
        ...eurEnglish,
        title: 'My Outreach title',
        snapshotEdited: true
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

/** Undo of the first link: unlink, keeping the QR code the link minted. */
const firstUnlinkMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: { id: 'eurRegionId-496', input: { journeyId: null } }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageUpdate: {
        ...linkMock.result().data.campaignRegionLanguageUpdate,
        journeyId: null,
        title: null,
        description: null,
        journey: null
      }
    }
  }))
}

/** Redo of the first link: the same journey, by id. */
const firstRelinkMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: { id: 'eurRegionId-496', input: { journeyId: 'frJourneyId' } }
  },
  result: vi.fn(() => linkMock.result())
}

const unlinkMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: { id: 'eurRegionId-529', input: { journeyId: null } }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageUpdate: {
        // Unlink keeps the QR code and its short link.
        ...eurEnglish,
        journeyId: null,
        title: null,
        description: null,
        snapshotEdited: false,
        journey: null
      }
    }
  }))
}

/** The English snapshot reworded by the author; the journey reads differently now. */
const editedEnglish = {
  ...eurEnglish,
  title: 'My Outreach title',
  snapshotEdited: true,
  journey: {
    ...eurEnglish.journey!,
    title: 'Outreach in Europe 2026',
    description: 'A journey for Europe.'
  }
}

const refreshMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_SNAPSHOT_REFRESH,
    variables: { id: 'eurRegionId-529' }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageSnapshotRefresh: {
        ...editedEnglish,
        title: 'Outreach in Europe 2026',
        snapshotEdited: false
      }
    }
  }))
}

/** The campaign with Europe's English row replaced. */
function withEnglish(english: typeof eurEnglish): typeof campaignWithRegions {
  return {
    ...campaignWithRegions,
    regions: campaignWithRegions.regions.map((region) =>
      region.id !== 'eurRegionId'
        ? region
        : {
            ...region,
            languages: region.languages.map((language) =>
              language.id === english.id ? english : language
            )
          }
    )
  }
}

function renderShare(
  campaignProp = campaignWithRegions,
  previewLanguageId?: string
): ReturnType<typeof render> {
  return render(
    <SnackbarProvider>
      <QueriedEditor
        campaign={campaignProp}
        initialState={{
          pageKind: CampaignPageKind.regionTemplate,
          regionId: 'eurRegionId',
          selectedBlockId: 'regionShareId',
          ...(previewLanguageId != null && { previewLanguageId })
        }}
        mocks={[
          languagesMock,
          createMock,
          deleteMock,
          englishDeleteMock,
          resolveMock,
          accessibleJourneysMock,
          resolveBySlugMock,
          linkMock,
          linkFailureMock,
          firstUnlinkMock,
          firstRelinkMock,
          unlinkMock,
          swapMock,
          swapRelinkMock,
          swapBackMock,
          restoreSnapshotMock,
          refreshMock
        ]}
      >
        <UndoRedo />
        <CommandProbe />
        <ShareSectionEdit block={{ id: 'regionShareId' }} />
      </QueriedEditor>
    </SnackbarProvider>
  )
}

describe('addLanguageOptions', () => {
  it('offers the full catalogue minus the languages already on the region, leaving the order to the autocomplete', () => {
    const options = addLanguageOptions(
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

describe('shareLanguageState', () => {
  it('is live, unpublished or unlinked', () => {
    expect(shareLanguageState(eurEnglish)).toBe('live')
    expect(shareLanguageState(eurFrench)).toBe('unlinked')
    expect(
      shareLanguageState({
        ...eurEnglish,
        journey: { ...eurEnglish.journey!, status: JourneyStatus.draft }
      })
    ).toBe('unpublished')
    expect(shareLanguageState({ ...eurEnglish, journey: null })).toBe(
      'unpublished'
    )
  })
})

describe('ShareSectionEdit', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: vi.fn(),
      writable: true,
      configurable: true
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true
    })
  })

  it("lists the region's Share Languages in order, every one shown, linked or not", async () => {
    renderShare()

    const english = await screen.findByTestId('ShareLanguageRow-529')
    expect(within(english).getByTestId('ShareLanguageLabel')).toHaveTextContent(
      'English'
    )
    expect(
      within(english).getByTestId('ShareLanguageJourney')
    ).toHaveTextContent('Outreach in Europe')
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
      within(french).getByRole('button', { name: 'Pick a journey' })
    ).toBeInTheDocument()
    expect(within(french).queryByRole('textbox')).not.toBeInTheDocument()

    const rows = screen.getAllByTestId(/^ShareLanguageRow-/)
    expect(rows.map((row) => row.dataset.testid)).toEqual([
      'ShareLanguageRow-529',
      'ShareLanguageRow-496'
    ])
  })

  describe('Campaign Strings', () => {
    function withStrings(
      overrides: Record<
        string,
        Partial<(typeof campaignWithRegions.strings)[number]>
      >
    ): typeof campaignWithRegions {
      return {
        ...campaignWithRegions,
        strings: campaignWithRegions.strings.map((string) => ({
          ...string,
          ...overrides[string.key]
        }))
      }
    }

    it("labels Open, Copy link and Download QR code with the campaign's own wording, not the admin's", async () => {
      renderShare(
        withStrings({
          open: { value: 'Visit' },
          copy: { value: 'Share this link' },
          downloadQr: { value: 'Get the QR code' }
        })
      )

      const english = await screen.findByTestId('ShareLanguageRow-529')
      expect(
        within(english).getByRole('link', { name: 'Visit' })
      ).toBeInTheDocument()
      expect(
        within(english).getByTestId('ShareLanguageCopy')
      ).toHaveTextContent('Share this link')
      expect(
        within(english).getByTestId('ShareLanguageDownload')
      ).toHaveTextContent('Get the QR code')
    })

    it('shows the previewed language’s translation, falling back to the default wording where there is none', async () => {
      renderShare(
        withStrings({
          copy: {
            valueTranslations: [
              {
                __typename: 'TranslatedValue',
                languageId: '496',
                value: 'Copier le lien',
                source: CampaignTextSource.human
              }
            ]
          }
        }),
        '496'
      )

      const english = await screen.findByTestId('ShareLanguageRow-529')
      expect(
        within(english).getByTestId('ShareLanguageCopy')
      ).toHaveTextContent('Copier le lien')
      expect(
        within(english).getByTestId('ShareLanguageDownload')
      ).toHaveTextContent('Download QR code')
    })

    it('copies the link and announces it with the campaign’s own "copied" string', async () => {
      renderShare(withStrings({ copied: { value: 'Copied it' } }))

      const english = await screen.findByTestId('ShareLanguageRow-529')
      fireEvent.click(within(english).getByTestId('ShareLanguageCopy'))

      expect(await screen.findByText('Copied it')).toBeInTheDocument()
    })
  })

  it('offers every language in name order, like the other pickers, and adds the chosen one', async () => {
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
      'Deutsch',
      'Español'
    ])

    fireEvent.click(screen.getByRole('option', { name: 'Español' }))

    await waitFor(() => expect(createMock.result).toHaveBeenCalled())
    expect(
      await screen.findByTestId('ShareLanguageRow-21028')
    ).toBeInTheDocument()
  })

  it('disables the bin on a Share Language with a QR code, pointing at Unlink, and sends nothing', async () => {
    renderShare()

    const english = await screen.findByTestId('ShareLanguageRow-529')
    const bin = within(english).getByRole('button', { name: 'Remove language' })
    expect(bin).toBeDisabled()

    fireEvent.mouseOver(bin.parentElement as HTMLElement)
    expect(
      await screen.findByRole('tooltip', {
        name: 'This language has a QR code. Unlink it instead.'
      })
    ).toBeInTheDocument()

    fireEvent.click(bin)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(englishDeleteMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('ShareLanguageRow-529')).toBeInTheDocument()
  })

  it('removes a Share Language with no QR code at once, with no dialog', async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    fireEvent.click(
      within(french).getByRole('button', { name: 'Remove language' })
    )

    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        screen.queryByTestId('ShareLanguageRow-496')
      ).not.toBeInTheDocument()
    )
  })

  it('links a pasted journey from the "Pick a journey" call to action, showing the resolved journey first, then the snapshot', async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    fireEvent.click(
      within(french).getByRole('button', { name: 'Pick a journey' })
    )
    const field = within(french).getByRole('textbox', {
      name: 'or paste a link'
    })
    await userEvent.type(
      field,
      'https://admin.nextstep.is/journeys/frJourneyId{enter}'
    )

    expect(
      await within(french).findByTestId('JourneyPasteResolved')
    ).toHaveTextContent('Campagne en Europe')
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
      ).toHaveTextContent('Campagne en Europe')
    )
    const linked = screen.getByTestId('ShareLanguageRow-496')
    expect(
      within(linked).queryByTestId('ShareLanguageHidden')
    ).not.toBeInTheDocument()
    expect(
      within(linked).getByTestId('ShareLanguagePhoneIframe')
    ).toHaveAttribute(
      'src',
      'https://your.nextstep.is/embed/noel-europe?expand=false'
    )
    expect(within(linked).getByTestId('ShareLanguageCopy')).toBeEnabled()
  })

  it('links a journey picked from the search with the admin link built from its id', async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    fireEvent.click(
      within(french).getByRole('button', { name: 'Pick a journey' })
    )
    await userEvent.click(
      within(french).getByRole('combobox', { name: 'Search your journeys' })
    )
    const option = await screen.findByTestId('JourneyPickerOption-frJourneyId')
    expect(option).toHaveTextContent('Campagne en Europe')
    expect(option).toHaveTextContent('Équipe Europe')
    fireEvent.click(option)

    await waitFor(() => expect(linkMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        within(screen.getByTestId('ShareLanguageRow-496')).getByTestId(
          'ShareLanguageJourney'
        )
      ).toHaveTextContent('Campagne en Europe')
    )
  })

  it('does not offer archived journeys in the search, as a share language only links published ones', async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    fireEvent.click(
      within(french).getByRole('button', { name: 'Pick a journey' })
    )
    await userEvent.click(
      within(french).getByRole('combobox', { name: 'Search your journeys' })
    )

    expect(
      await screen.findByTestId('JourneyPickerOption-frJourneyId')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('JourneyPickerOption-archivedJourneyId')
    ).toBeNull()
  })

  it('links the first journey as one Command: undo unlinks it and redo links the same journey by id', async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    fireEvent.click(
      within(french).getByRole('button', { name: 'Pick a journey' })
    )
    await userEvent.type(
      within(french).getByRole('textbox', { name: 'or paste a link' }),
      'https://admin.nextstep.is/journeys/frJourneyId{enter}'
    )
    fireEvent.click(
      await within(french).findByRole('button', { name: 'Use this journey' })
    )
    await waitFor(() =>
      expect(
        within(screen.getByTestId('ShareLanguageRow-496')).getByTestId(
          'ShareLanguageJourney'
        )
      ).toHaveTextContent('Campagne en Europe')
    )
    expect(linkMock.result).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(firstUnlinkMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        within(screen.getByTestId('ShareLanguageRow-496')).queryByTestId(
          'ShareLanguageJourney'
        )
      ).toBeNull()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(firstRelinkMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        within(screen.getByTestId('ShareLanguageRow-496')).getByTestId(
          'ShareLanguageJourney'
        )
      ).toHaveTextContent('Campagne en Europe')
    )
  })

  it('swaps as one Command: undo links the previous journey again and puts back the snapshot the author edited', async () => {
    renderShare(withEnglish(editedEnglish))

    const english = await screen.findByTestId('ShareLanguageRow-529')
    fireEvent.click(
      within(english).getByRole('button', { name: 'Swap journey' })
    )
    await userEvent.type(
      within(english).getByRole('textbox', { name: 'or paste a link' }),
      'https://admin.nextstep.is/journeys/frJourneyId{enter}'
    )
    fireEvent.click(
      await within(english).findByRole('button', { name: 'Use this journey' })
    )
    await waitFor(() => expect(swapMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(swapBackMock.result).toHaveBeenCalled())
    await waitFor(() => expect(restoreSnapshotMock.result).toHaveBeenCalled())
  })

  it('keeps a quick undo then redo of a swap in order, so the swapped-in journey does not get the restored title', async () => {
    renderShare(withEnglish(editedEnglish))

    const english = await screen.findByTestId('ShareLanguageRow-529')
    fireEvent.click(
      within(english).getByRole('button', { name: 'Swap journey' })
    )
    await userEvent.type(
      within(english).getByRole('textbox', { name: 'or paste a link' }),
      'https://admin.nextstep.is/journeys/frJourneyId{enter}'
    )
    fireEvent.click(
      await within(english).findByRole('button', { name: 'Use this journey' })
    )
    await waitFor(() => expect(swapMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(swapRelinkMock.result).toHaveBeenCalled())
    expect(restoreSnapshotMock.result.mock.invocationCallOrder[0]).toBeLessThan(
      swapRelinkMock.result.mock.invocationCallOrder[0]
    )
  })

  it('adds nothing to the undo stack when the link is refused', async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    fireEvent.click(
      within(french).getByRole('button', { name: 'Pick a journey' })
    )
    await userEvent.type(
      within(french).getByRole('textbox', { name: 'or paste a link' }),
      'https://your.nextstep.is/noel-europe{enter}'
    )
    fireEvent.click(
      await within(french).findByRole('button', { name: 'Use this journey' })
    )

    await within(french).findByText('Journey not found or not published')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it("shows the server's message verbatim when the link is refused", async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    fireEvent.click(
      within(french).getByRole('button', { name: 'Pick a journey' })
    )
    const field = within(french).getByRole('textbox', {
      name: 'or paste a link'
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

  it('opens the linked journey’s public page in a new tab', async () => {
    renderShare()

    const english = await screen.findByTestId('ShareLanguageRow-529')
    const open = within(english).getByRole('link', { name: 'Open journey' })
    expect(open).toHaveAttribute('href', eurEnglish.journeyUrl)
    expect(open).toHaveAttribute('target', '_blank')
    expect(
      within(english).queryByRole('button', { name: 'Create QR code' })
    ).toBeNull()
  })

  it('offers Create QR code to a linked row without one, and re-links the same journey to mint it', async () => {
    renderShare(withEnglish({ ...eurEnglish, qrCodeId: null, qrCode: null }))

    const english = await screen.findByTestId('ShareLanguageRow-529')
    expect(within(english).queryByTestId('ShareLanguageShortLink')).toBeNull()
    fireEvent.click(
      within(english).getByRole('button', { name: 'Create QR code' })
    )

    // Re-linking the same journey is the swap-back request; the API mints the missing QR code.
    await waitFor(() => expect(swapBackMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        within(screen.getByTestId('ShareLanguageRow-529')).getByTestId(
          'ShareLanguageShortLink'
        )
      ).toBeInTheDocument()
    )
  })

  it('offers no Create QR code while the linked journey is unpublished', async () => {
    renderShare(
      withEnglish({
        ...eurEnglish,
        qrCodeId: null,
        qrCode: null,
        journey: { ...eurEnglish.journey!, status: JourneyStatus.draft }
      })
    )

    const english = await screen.findByTestId('ShareLanguageRow-529')
    expect(
      within(english).queryByRole('button', { name: 'Create QR code' })
    ).toBeNull()
  })

  it('unlinks a journey with no dialog, keeping the QR code so the bin stays disabled', async () => {
    renderShare()

    const english = await screen.findByTestId('ShareLanguageRow-529')
    fireEvent.click(within(english).getByRole('button', { name: 'Unlink' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(unlinkMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        within(screen.getByTestId('ShareLanguageRow-529')).getByTestId(
          'ShareLanguageHidden'
        )
      ).toBeInTheDocument()
    )
    expect(
      within(screen.getByTestId('ShareLanguageRow-529')).getByRole('button', {
        name: 'Remove language'
      })
    ).toBeDisabled()
  })

  it('shows the "journey unpublished" warning in the frame instead of the pick call to action, copy and download disabled', async () => {
    renderShare(
      withEnglish({
        ...eurEnglish,
        journey: { ...eurEnglish.journey!, status: JourneyStatus.draft }
      })
    )

    const english = await screen.findByTestId('ShareLanguageRow-529')
    expect(english).toHaveAttribute('data-state', 'unpublished')
    expect(
      within(english).getByTestId('ShareLanguageUnpublished')
    ).toHaveTextContent('Journey unpublished')
    expect(
      within(within(english).getByTestId('ShareLanguagePhone')).getByTestId(
        'ShareLanguageUnpublishedWarning'
      )
    ).toHaveTextContent(/Journey unpublished/)
    expect(
      within(english).queryByRole('button', { name: 'Pick a journey' })
    ).not.toBeInTheDocument()
    expect(
      within(english).queryByTestId('ShareLanguagePhoneIframe')
    ).not.toBeInTheDocument()
    expect(within(english).getByTestId('ShareLanguageCopy')).toBeDisabled()
    expect(within(english).getByTestId('ShareLanguageDownload')).toBeDisabled()
    expect(
      within(english).queryByTestId('ShareLanguageRefresh')
    ).not.toBeInTheDocument()
    expect(
      within(english).getByRole('button', { name: 'Swap journey' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('ShareSelectorPreview-529')).toHaveTextContent(
      'English · hidden while unpublished'
    )
  })

  it('previews a live journey in the sandboxed phone frame with its Share Link, copies the link with a toast and downloads the QR PNG', async () => {
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,QR')
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)
    renderShare()

    const english = await screen.findByTestId('ShareLanguageRow-529')
    expect(english).toHaveAttribute('data-state', 'live')
    const iframe = within(english).getByTestId('ShareLanguagePhoneIframe')
    expect(iframe).toHaveAttribute(
      'src',
      'https://your.nextstep.is/embed/outreach-europe?expand=false'
    )
    expect(iframe).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
    )
    expect(iframe).toHaveAttribute('allow', 'autoplay')
    expect(iframe).toHaveAttribute('loading', 'lazy')
    expect(iframe).toHaveAttribute('title', 'Outreach in Europe')
    expect(
      within(english).getByTestId('ShareLanguageShortLink')
    ).toHaveTextContent('short.nextstep.is/eur-en')
    expect(within(english).getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      'https://short.nextstep.is/eur-en'
    )
    expect(
      within(english).getByRole('img', {
        name: 'https://short.nextstep.is/eur-en'
      })
    ).toBeInTheDocument()

    fireEvent.click(within(english).getByTestId('ShareLanguageCopy'))
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://short.nextstep.is/eur-en'
      )
    )
    expect(await screen.findByText('Link copied')).toBeInTheDocument()

    fireEvent.click(within(english).getByTestId('ShareLanguageDownload'))
    expect(toDataURL).toHaveBeenCalledWith('image/png')
    const clicked = click.mock.contexts[0] as HTMLAnchorElement
    expect(clicked.download).toBe('outreach-2026-eur-en.png')
    toDataURL.mockRestore()
    click.mockRestore()
  })

  it('says the link could not be copied when the clipboard refuses it', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
      new Error('Write permission denied')
    )
    renderShare()

    const english = await screen.findByTestId('ShareLanguageRow-529')
    fireEvent.click(within(english).getByTestId('ShareLanguageCopy'))

    expect(await screen.findByText("Couldn't copy link")).toBeInTheDocument()
    expect(screen.queryByText('Link copied')).not.toBeInTheDocument()
  })

  it('marks an Unlinked Language hidden in the selector preview and disables its copy and download', async () => {
    renderShare()

    const french = await screen.findByTestId('ShareLanguageRow-496')
    expect(french).toHaveAttribute('data-state', 'unlinked')
    expect(within(french).getByTestId('ShareLanguagePhone')).toBeInTheDocument()
    expect(within(french).getByTestId('ShareLanguageCopy')).toBeDisabled()
    expect(within(french).getByTestId('ShareLanguageDownload')).toBeDisabled()
    expect(screen.getByTestId('ShareSelectorPreview-496')).toHaveTextContent(
      'Français (French) · hidden until a journey is linked'
    )
    expect(screen.getByTestId('ShareSelectorPreview-529')).toHaveTextContent(
      /^English$/
    )
  })

  it('refreshes an unedited snapshot from the journey at once, as a Command', async () => {
    renderShare(
      withEnglish({
        ...eurEnglish,
        journey: { ...eurEnglish.journey!, title: 'Renamed by its owner' }
      })
    )

    const english = await screen.findByTestId('ShareLanguageRow-529')
    fireEvent.click(within(english).getByTestId('ShareLanguageRefresh'))

    expect(
      screen.queryByTestId('ShareSnapshotRefreshDialog')
    ).not.toBeInTheDocument()
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('confirms before refreshing a snapshot the author edited', async () => {
    renderShare(withEnglish(editedEnglish))

    const english = await screen.findByTestId('ShareLanguageRow-529')
    expect(
      within(english).getByTestId('ShareLanguageJourney')
    ).toHaveTextContent('My Outreach title')
    fireEvent.click(within(english).getByTestId('ShareLanguageRefresh'))

    const dialog = await screen.findByTestId('ShareSnapshotRefreshDialog')
    expect(refreshMock.result).not.toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Refresh' }))

    await waitFor(() => expect(refreshMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        within(screen.getByTestId('ShareLanguageRow-529')).getByTestId(
          'ShareLanguageJourney'
        )
      ).toHaveTextContent('Outreach in Europe 2026')
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('renders nothing on the landing page', () => {
    render(
      <SnackbarProvider>
        <QueriedEditor
          campaign={campaignWithRegions}
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
