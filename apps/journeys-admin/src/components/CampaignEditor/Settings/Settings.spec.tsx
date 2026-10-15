import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'
import { type MockedFunction } from 'vitest'

import { CommandProvider, useCommand } from '@core/journeys/ui/CommandProvider'
import { CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION } from '@core/journeys/ui/useCampaignAiTranslateSubscription'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CAMPAIGN_DELETE } from '../../../libs/useCampaignDeleteMutation'
import { GET_CAMPAIGN } from '../../../libs/useCampaignQuery'
import { CAMPAIGN_UPDATE } from '../../../libs/useCampaignUpdateMutation'
import { campaign, publishedCampaign } from '../data'
import {
  TranslationRun,
  TranslationRunContext,
  TranslationRunProvider
} from '../TranslationRunProvider'

import { Settings, shapeSlug } from './Settings'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

function CommandCount(): ReactElement {
  const { state } = useCommand()
  return <span data-testid="CommandCount">{state.commands.length}</span>
}

/** The real provider, or a fixed run in flight when one is given. */
function RunScope({
  run,
  children
}: {
  run?: TranslationRun
  children: ReactNode
}): ReactElement {
  if (run == null)
    return <TranslationRunProvider>{children}</TranslationRunProvider>
  return (
    <TranslationRunContext.Provider
      value={{ run, start: vi.fn(), cancel: vi.fn() }}
    >
      {children}
    </TranslationRunContext.Provider>
  )
}

interface RenderOptions {
  campaign?: Campaign
  isManager?: boolean
  mocks?: Array<Record<string, unknown>>
  onDefaultLanguageChanged?: () => void
  cache?: InMemoryCache
  /** A background machine-translation run in flight. */
  run?: TranslationRun
}

function renderSettings({
  campaign: campaignProp = campaign,
  isManager = true,
  mocks = [],
  onDefaultLanguageChanged,
  cache,
  run
}: RenderOptions = {}): void {
  render(
    <MockedProvider mocks={mocks as never} cache={cache}>
      <SnackbarProvider>
        <CommandProvider>
          <CommandCount />
          <RunScope run={run}>
            <Settings
              campaign={campaignProp}
              isManager={isManager}
              onDefaultLanguageChanged={onDefaultLanguageChanged}
            />
          </RunScope>
        </CommandProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('Settings', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as NextRouter)
  })

  it('shows the draft status copy', () => {
    renderSettings()

    expect(screen.getByTestId('CampaignStatusCopy')).toHaveTextContent(
      'Draft. Edits are saved as you make them; nothing is public until you publish.'
    )
  })

  it('shows the published status copy', () => {
    renderSettings({ campaign: publishedCampaign })

    expect(screen.getByTestId('CampaignStatusCopy')).toHaveTextContent(
      'Published. Edits are saved as you make them and reach the public page shortly.'
    )
  })

  it('shows the permanent root-domain address and the current public address', () => {
    renderSettings()

    expect(
      screen.getByText(
        'Permanent address: https://your.nextstep.is/campaign/christmas-2026'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Current public address: https://your.nextstep.is/campaign/christmas-2026'
      )
    ).toBeInTheDocument()
  })

  it('shows the domain form as the current public address when a Campaign Root is attached', () => {
    renderSettings({
      campaign: {
        ...campaign,
        customDomains: [
          {
            __typename: 'CustomDomain',
            id: 'customDomainId',
            name: 'christmas.example.org'
          }
        ]
      }
    })

    expect(
      screen.getByText(
        'Permanent address: https://your.nextstep.is/campaign/christmas-2026'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('Current public address: https://christmas.example.org')
    ).toBeInTheDocument()
  })

  it('saves the title through campaignUpdate on commit without adding a Command', async () => {
    const result = vi.fn(() => ({
      data: {
        campaignUpdate: {
          __typename: 'Campaign',
          id: 'campaignId',
          title: 'Easter 2027',
          slug: 'christmas-2026'
        }
      }
    }))
    renderSettings({
      mocks: [
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaignId', input: { title: 'Easter 2027' } }
          },
          result
        }
      ]
    })

    const title = screen.getByLabelText('Title')
    fireEvent.change(title, { target: { value: ' Easter 2027 ' } })
    fireEvent.blur(title)

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('shapes the slug as typed and saves it through campaignUpdate', async () => {
    const result = vi.fn(() => ({
      data: {
        campaignUpdate: {
          __typename: 'Campaign',
          id: 'campaignId',
          title: 'Christmas 2026',
          slug: 'xmas-2026'
        }
      }
    }))
    renderSettings({
      mocks: [
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaignId', input: { slug: 'xmas-2026' } }
          },
          result
        }
      ]
    })

    const slug = screen.getByLabelText('Slug')
    fireEvent.change(slug, { target: { value: 'Xmas 2026!' } })
    expect(slug).toHaveValue('xmas-2026-')
    fireEvent.blur(slug)

    expect(slug).toHaveValue('xmas-2026')
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it("shows the API's BAD_USER_INPUT message verbatim on the slug field", async () => {
    renderSettings({
      mocks: [
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaignId', input: { slug: 'campaign' } }
          },
          result: {
            errors: [
              new GraphQLError('slug "campaign" is reserved', {
                extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
              })
            ]
          }
        }
      ]
    })

    const slug = screen.getByLabelText('Slug')
    fireEvent.change(slug, { target: { value: 'campaign' } })
    fireEvent.blur(slug)

    expect(
      await screen.findByText('slug "campaign" is reserved')
    ).toBeInTheDocument()
  })

  it('keeps the field on the rejected value while the API error is shown', async () => {
    renderSettings({
      mocks: [
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaignId', input: { slug: 'campaign' } }
          },
          result: {
            errors: [
              new GraphQLError('slug "campaign" is reserved', {
                extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
              })
            ]
          }
        }
      ]
    })

    const slug = screen.getByLabelText('Slug')
    fireEvent.change(slug, { target: { value: 'campaign' } })
    fireEvent.blur(slug)

    // The optimistic value rolled back in the cache, but the field still shows
    // what the error describes.
    expect(
      await screen.findByText('slug "campaign" is reserved')
    ).toBeInTheDocument()
    expect(slug).toHaveValue('campaign')
  })

  it('releases the field to the rolled-back value after a failure with no field error', async () => {
    renderSettings({
      mocks: [
        {
          request: {
            query: CAMPAIGN_UPDATE,
            variables: { id: 'campaignId', input: { title: 'Easter 2027' } }
          },
          error: new Error('Network down')
        }
      ]
    })

    const title = screen.getByLabelText('Title')
    fireEvent.change(title, { target: { value: 'Easter 2027' } })
    fireEvent.blur(title)

    expect(await screen.findByText('Network down')).toBeInTheDocument()
    await waitFor(() => expect(title).toHaveValue('Christmas 2026'))
  })

  it('rejects an empty title before calling the API', () => {
    renderSettings()

    const title = screen.getByLabelText('Title')
    fireEvent.change(title, { target: { value: '   ' } })
    fireEvent.blur(title)

    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  it('has no Save button, Unsaved chip or save indicator', () => {
    renderSettings()

    expect(
      screen.queryByRole('button', { name: 'Save' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Unsaved')).not.toBeInTheDocument()
    expect(screen.queryByText(/Saving/)).not.toBeInTheDocument()
  })

  it('offers Delete campaign to managers and confirms before campaignDelete', async () => {
    const result = vi.fn(() => ({
      data: { campaignDelete: { __typename: 'Campaign', id: 'campaignId' } }
    }))
    renderSettings({
      mocks: [
        {
          request: { query: CAMPAIGN_DELETE, variables: { id: 'campaignId' } },
          result
        }
      ]
    })

    fireEvent.click(screen.getByRole('button', { name: 'Delete campaign' }))
    const dialog = screen.getByTestId('CampaignDeleteDialog')
    expect(result).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/campaigns'))
  })

  it('evicts the campaign from the cache only after the redirect resolves', async () => {
    let finishRedirect: (value: boolean) => void = () => undefined
    mockPush.mockReturnValue(
      new Promise<boolean>((resolve) => {
        finishRedirect = resolve
      })
    )
    const cache = new InMemoryCache()
    const evict = vi.spyOn(cache, 'evict')
    renderSettings({
      cache,
      mocks: [
        {
          request: { query: CAMPAIGN_DELETE, variables: { id: 'campaignId' } },
          result: {
            data: {
              campaignDelete: { __typename: 'Campaign', id: 'campaignId' }
            }
          }
        }
      ]
    })

    fireEvent.click(screen.getByRole('button', { name: 'Delete campaign' }))
    fireEvent.click(
      within(screen.getByTestId('CampaignDeleteDialog')).getByRole('button', {
        name: 'Delete'
      })
    )

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/campaigns'))
    expect(evict).not.toHaveBeenCalled()

    finishRedirect(true)
    await waitFor(() => expect(evict).toHaveBeenCalled())
  })

  it('does not offer Delete campaign to members', () => {
    renderSettings({ isManager: false })

    expect(
      screen.queryByRole('button', { name: 'Delete campaign' })
    ).not.toBeInTheDocument()
  })

  describe('default language', () => {
    const FRENCH = '496'

    function pickFrench(): void {
      fireEvent.mouseDown(screen.getByRole('combobox'))
      fireEvent.click(screen.getByRole('option', { name: 'Français' }))
    }

    function updateMock(
      result: Record<string, unknown>
    ): Record<string, unknown> {
      return {
        request: {
          query: CAMPAIGN_UPDATE,
          variables: { id: 'campaignId', input: { defaultLanguageId: FRENCH } }
        },
        ...result
      }
    }

    const swapped = vi.fn(() => ({
      data: {
        campaignUpdate: {
          __typename: 'Campaign',
          id: 'campaignId',
          title: 'Christmas 2026',
          slug: 'christmas-2026'
        }
      }
    }))
    const refetched = vi.fn(() => ({
      data: { campaign: { ...campaign, defaultLanguageId: FRENCH } }
    }))
    const refetchMock = {
      request: { query: GET_CAMPAIGN, variables: { id: 'campaignId' } },
      result: refetched
    }

    it('lists the campaign languages with the default selected', () => {
      renderSettings()

      expect(screen.getByRole('combobox')).toHaveTextContent('English')
    })

    it('confirms before changing, then swaps, refetches the campaign and tells the editor, without adding a Command', async () => {
      const onDefaultLanguageChanged = vi.fn()
      renderSettings({
        mocks: [updateMock({ result: swapped }), refetchMock],
        onDefaultLanguageChanged
      })

      pickFrench()
      const dialog = screen.getByTestId('CampaignDefaultLanguageDialog')
      expect(swapped).not.toHaveBeenCalled()

      fireEvent.click(within(dialog).getByRole('button', { name: 'Change' }))

      await waitFor(() => expect(onDefaultLanguageChanged).toHaveBeenCalled())
      expect(swapped).toHaveBeenCalled()
      expect(refetched).toHaveBeenCalled()
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    })

    it('does nothing when the confirmation is cancelled', () => {
      renderSettings({ mocks: [updateMock({ result: swapped })] })

      pickFrench()
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(swapped).not.toHaveBeenCalled()
    })

    it('on CONFLICT offers to machine-translate the missing texts first, then changes the default', async () => {
      const onDefaultLanguageChanged = vi.fn()
      const sweep = vi.fn(() => ({
        data: {
          campaignAiTranslateSubscription: {
            __typename: 'CampaignAiTranslateProgress',
            progress: 100,
            message: 'Translation completed!',
            campaign: {
              __typename: 'Campaign',
              id: 'campaignId',
              titleTranslations: []
            }
          }
        }
      }))
      renderSettings({
        mocks: [
          updateMock({
            result: {
              errors: [
                new GraphQLError('3 texts have no translation', {
                  extensions: {
                    code: 'CONFLICT',
                    field: 'defaultLanguageId',
                    count: 3
                  }
                })
              ]
            }
          }),
          {
            request: {
              query: CAMPAIGN_AI_TRANSLATE_SUBSCRIPTION,
              variables: {
                campaignId: 'campaignId',
                languageId: FRENCH,
                mode: 'missing'
              }
            },
            delay: 20,
            result: sweep
          },
          updateMock({ result: swapped }),
          refetchMock
        ],
        onDefaultLanguageChanged
      })

      pickFrench()
      fireEvent.click(screen.getByRole('button', { name: 'Change' }))

      const conflict = await screen.findByTestId(
        'CampaignDefaultLanguageConflict'
      )
      expect(conflict).toHaveTextContent(
        '3 texts have no translation in Français yet'
      )
      expect(onDefaultLanguageChanged).not.toHaveBeenCalled()

      fireEvent.click(
        within(conflict).getByRole('button', {
          name: 'Machine-translate missing into Français'
        })
      )

      await waitFor(() => expect(onDefaultLanguageChanged).toHaveBeenCalled())
      expect(sweep).toHaveBeenCalled()
      expect(swapped).toHaveBeenCalled()
    })

    it('disables machine-translating the missing texts while a background run is in flight', async () => {
      renderSettings({
        mocks: [
          updateMock({
            result: {
              errors: [
                new GraphQLError('3 texts have no translation', {
                  extensions: {
                    code: 'CONFLICT',
                    field: 'defaultLanguageId',
                    count: 3
                  }
                })
              ]
            }
          })
        ],
        run: {
          campaignId: 'campaignId',
          languageId: FRENCH,
          mode: 'missing',
          languageName: 'Français',
          progress: 40,
          translatedCount: 4
        }
      })

      pickFrench()
      fireEvent.click(screen.getByRole('button', { name: 'Change' }))

      const conflict = await screen.findByTestId(
        'CampaignDefaultLanguageConflict'
      )
      expect(
        within(conflict).getByRole('button', {
          name: 'Machine-translate missing into Français'
        })
      ).toBeDisabled()
    })

    it('shows the API error when the change is refused for another reason', async () => {
      renderSettings({
        mocks: [
          updateMock({
            result: {
              errors: [
                new GraphQLError(
                  'defaultLanguageId must be one of the campaign languages',
                  {
                    extensions: {
                      code: 'BAD_USER_INPUT',
                      field: 'defaultLanguageId'
                    }
                  }
                )
              ]
            }
          })
        ]
      })

      pickFrench()
      fireEvent.click(screen.getByRole('button', { name: 'Change' }))

      expect(
        await screen.findByTestId('CampaignDefaultLanguageError')
      ).toHaveTextContent(
        'defaultLanguageId must be one of the campaign languages'
      )
    })
  })

  describe('shapeSlug', () => {
    it('lowercases, swaps invalid runs for one dash and clips leading dashes', () => {
      expect(shapeSlug('  Xmas 2026!! ')).toBe('xmas-2026-')
      expect(shapeSlug('--Easter')).toBe('easter')
    })
  })
})
