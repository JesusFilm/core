import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedLocalTemplate } from '@core/journeys/ui/TemplateView/data'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE } from '../../../../../libs/useJourneyCustomizationDescriptionUpdateMutation'
import { TITLE_DESC_LANGUAGE_UPDATE } from '../../../../../libs/useTitleDescLanguageUpdateMutation/useTitleDescLanguageUpdateMutation'

import { LocalTemplateDetailsDialog } from './LocalTemplateDetailsDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const onClose = jest.fn()

const getLanguagesMock = {
  request: {
    query: GET_LANGUAGES,
    variables: { languageId: '529' }
  },
  result: {
    data: {
      languages: [
        {
          __typename: 'Language',
          id: '529',
          slug: 'en',
          name: [
            {
              __typename: 'LanguageName',
              value: 'English',
              primary: true
            }
          ]
        },
        {
          __typename: 'Language',
          id: '496',
          slug: 'fr',
          name: [
            {
              __typename: 'LanguageName',
              value: 'Français',
              primary: true
            },
            {
              __typename: 'LanguageName',
              value: 'French',
              primary: false
            }
          ]
        }
      ]
    }
  }
}

function makeTitleDescLanguageMock(input: {
  title: string
  description: string | null
  languageId: string
}): {
  request: {
    query: typeof TITLE_DESC_LANGUAGE_UPDATE
    variables: {
      id: string
      input: typeof input
    }
  }
  result: jest.Mock
} {
  return {
    request: {
      query: TITLE_DESC_LANGUAGE_UPDATE,
      variables: { id: publishedLocalTemplate.id, input }
    },
    result: jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: publishedLocalTemplate.id,
          title: input.title,
          description: input.description,
          language: publishedLocalTemplate.language,
          updatedAt: '2026-04-28T00:00:00Z'
        }
      }
    }))
  }
}

describe('LocalTemplateDetailsDialog', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the dialog with "Template Details" title', () => {
    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: publishedLocalTemplate }}>
            <LocalTemplateDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      screen.getByRole('dialog', { name: 'Template Details' })
    ).toBeInTheDocument()
  })

  it('does not render Categories, Featured, Strategy, or Creator info', () => {
    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: publishedLocalTemplate }}>
            <LocalTemplateDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      screen.queryByRole('tab', { name: 'Categories' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: 'Featured' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('textbox', { name: 'Paste URL here' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('textbox', { name: "Creator's Info" })
    ).not.toBeInTheDocument()
  })

  it('updates title via useTitleDescLanguageUpdateMutation when title is dirty', async () => {
    const mock = makeTitleDescLanguageMock({
      title: 'Edited Title',
      description: publishedLocalTemplate.description ?? null,
      languageId: publishedLocalTemplate.language.id
    })

    render(
      <MockedProvider mocks={[getLanguagesMock, mock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: publishedLocalTemplate }}>
            <LocalTemplateDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Edited Title' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByText('Template details saved')).toBeInTheDocument()
    )
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('only updates customization description when only that field is dirty', async () => {
    const titleMock = makeTitleDescLanguageMock({
      title: publishedLocalTemplate.title,
      description: publishedLocalTemplate.description ?? null,
      languageId: publishedLocalTemplate.language.id
    })
    const customizationResult = jest.fn(() => ({
      data: {
        journeyCustomizationFieldPublisherUpdate: {
          __typename: 'JourneyCustomizationField',
          id: 'field-id',
          key: 'description',
          value: 'Edited customization'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          getLanguagesMock,
          titleMock,
          {
            request: {
              query: JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE,
              variables: {
                journeyId: publishedLocalTemplate.id,
                string: 'Edited customization'
              }
            },
            result: customizationResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey: publishedLocalTemplate }}>
            <LocalTemplateDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const customizationField = screen
      .getByTestId('CustomizationDescriptionEdit')
      .querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(customizationField, {
      target: { value: 'Edited customization' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(customizationResult).toHaveBeenCalled())
    expect(titleMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('shows a "Required" error and blocks submit when the title is empty', async () => {
    const titleMock = makeTitleDescLanguageMock({
      title: '',
      description: publishedLocalTemplate.description ?? null,
      languageId: publishedLocalTemplate.language.id
    })

    render(
      <MockedProvider mocks={[getLanguagesMock, titleMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: publishedLocalTemplate }}>
            <LocalTemplateDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: '' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Required')).toBeInTheDocument()
    expect(titleMock.result).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders via journey prop when no JourneyProvider is present', () => {
    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <SnackbarProvider>
          <LocalTemplateDetailsDialog
            open
            onClose={onClose}
            journey={publishedLocalTemplate}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      screen.getByRole('dialog', { name: 'Template Details' })
    ).toBeInTheDocument()
  })

  it('shows fresh values when reopened after the journey context updated (regression: same-mount stale memo)', async () => {
    // Repros the bug Esther reported: edit via one entry point + save, then
    // reopen the dialog (same mount), and the form shows STALE pre-save data
    // because initialValues was memoized by journey.id and never re-seeded.
    function Harness(): ReactElement {
      const [open, setOpen] = useState(true)
      const [journey, setJourney] = useState({
        ...publishedLocalTemplate,
        title: 'Old Title'
      })
      return (
        <>
          <button
            data-testid="bumpJourney"
            onClick={() => {
              setJourney((prev) => ({ ...prev, title: 'New Title' }))
              setOpen(false)
            }}
          >
            bump
          </button>
          <button
            data-testid="reopenDialog"
            onClick={() => setOpen(true)}
          >
            reopen
          </button>
          <SnackbarProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <LocalTemplateDetailsDialog open={open} onClose={() => setOpen(false)} />
            </JourneyProvider>
          </SnackbarProvider>
        </>
      )
    }

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <Harness />
      </MockedProvider>
    )

    // First mount: title field shows the original value.
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(
        'Old Title'
      )
    )

    // Simulate: user saved → cache (and so the journey prop) updated to new
    // title → onClose was called → dialog stays mounted with open={false}.
    act(() => {
      fireEvent.click(screen.getByTestId('bumpJourney'))
    })

    // User reopens the dialog (same mount).
    act(() => {
      fireEvent.click(screen.getByTestId('reopenDialog'))
    })

    // Form should show the fresh post-save title, not the stale pre-save one.
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(
        'New Title'
      )
    )
  })

  it('does not call any mutation when the form is unchanged', async () => {
    const titleMock = makeTitleDescLanguageMock({
      title: publishedLocalTemplate.title,
      description: publishedLocalTemplate.description ?? null,
      languageId: publishedLocalTemplate.language.id
    })

    render(
      <MockedProvider mocks={[getLanguagesMock, titleMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: publishedLocalTemplate }}>
            <LocalTemplateDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(titleMock.result).not.toHaveBeenCalled()
  })
})
