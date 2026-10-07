import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { CAMPAIGN_CREATE } from '../../../libs/useCampaignCreateMutation'
import { campaign } from '../../CampaignEditor/data'

import { CreateCampaignDialog } from './CreateCampaignDialog'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

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
          id: '496',
          slug: 'french',
          name: [
            { __typename: 'LanguageName', value: 'French', primary: false },
            { __typename: 'LanguageName', value: 'Français', primary: true }
          ]
        }
      ]
    }
  }
}

const createVariables = {
  input: { teamId: 'teamId', title: 'Christmas 2026', defaultLanguageId: '529' }
}

function renderDialog(mocks: Array<Record<string, unknown>>): {
  onClose: ReturnType<typeof vi.fn>
} {
  const onClose = vi.fn()
  render(
    <MockedProvider mocks={[languagesMock, ...mocks] as never}>
      <SnackbarProvider>
        <CreateCampaignDialog open onClose={onClose} teamId="teamId" />
      </SnackbarProvider>
    </MockedProvider>
  )
  return { onClose }
}

async function fillForm(): Promise<void> {
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: ' Christmas 2026 ' }
  })
  const combobox = screen.getByRole('combobox')
  await waitFor(() => expect(combobox).not.toBeDisabled())
  fireEvent.focus(combobox)
  fireEvent.keyDown(combobox, { key: 'ArrowDown' })
  fireEvent.click(await screen.findByRole('option', { name: 'English' }))
}

describe('CreateCampaignDialog', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as NextRouter)
  })

  it('creates the campaign from a title and default language, then opens the editor', async () => {
    const result = vi.fn(() => ({ data: { campaignCreate: campaign } }))
    const { onClose } = renderDialog([
      {
        request: { query: CAMPAIGN_CREATE, variables: createVariables },
        result
      }
    ])

    await fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/campaigns/campaignId')
    )
    expect(onClose).toHaveBeenCalled()
  })

  it("shows the API's BAD_USER_INPUT message verbatim on the named field", async () => {
    const { onClose } = renderDialog([
      {
        request: { query: CAMPAIGN_CREATE, variables: createVariables },
        result: {
          errors: [
            new GraphQLError('title must be at most 100 characters', {
              extensions: { code: 'BAD_USER_INPUT', field: 'title' }
            })
          ]
        }
      }
    ])

    await fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(
      await screen.findByText('title must be at most 100 characters')
    ).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows a language error from the API on the language field', async () => {
    renderDialog([
      {
        request: { query: CAMPAIGN_CREATE, variables: createVariables },
        result: {
          errors: [
            new GraphQLError('defaultLanguageId must be an existing language', {
              extensions: { code: 'BAD_USER_INPUT', field: 'defaultLanguageId' }
            })
          ]
        }
      }
    ])

    await fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(
      await screen.findByText('defaultLanguageId must be an existing language')
    ).toBeInTheDocument()
  })

  it('requires a title and a language before calling the API', async () => {
    const result = vi.fn(() => ({ data: { campaignCreate: campaign } }))
    renderDialog([
      {
        request: { query: CAMPAIGN_CREATE, variables: createVariables },
        result
      }
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Language is required')).toBeInTheDocument()
    expect(result).not.toHaveBeenCalled()
  })
})
