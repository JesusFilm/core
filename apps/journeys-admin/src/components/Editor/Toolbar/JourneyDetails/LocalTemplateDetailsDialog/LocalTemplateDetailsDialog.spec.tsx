import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedLocalTemplate } from '@core/journeys/ui/TemplateView/data'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE } from '../../../../../libs/useJourneyCustomizationDescriptionUpdateMutation'
import { TITLE_DESC_LANGUAGE_UPDATE } from '../../../../../libs/useTitleDescLanguageUpdateMutation/useTitleDescLanguageUpdateMutation'
import { ThemeProvider } from '../../../../ThemeProvider'

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

interface ProvidersProps {
  mocks?: MockedResponse[]
  withJourneyProvider?: boolean
  children: ReactNode
}

// Standard provider stack per project test conventions:
// SnackbarProvider → MockedProvider → ThemeProvider → (JourneyProvider) → component.
function Providers({
  mocks = [],
  withJourneyProvider = true,
  children
}: ProvidersProps): ReactElement {
  const inner = withJourneyProvider ? (
    <JourneyProvider value={{ journey: publishedLocalTemplate }}>
      {children}
    </JourneyProvider>
  ) : (
    <>{children}</>
  )
  return (
    <SnackbarProvider>
      <MockedProvider mocks={mocks}>
        <ThemeProvider>{inner}</ThemeProvider>
      </MockedProvider>
    </SnackbarProvider>
  )
}

describe('LocalTemplateDetailsDialog', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the dialog with "Template Details" title', () => {
    render(
      <Providers mocks={[getLanguagesMock]}>
        <LocalTemplateDetailsDialog open onClose={onClose} />
      </Providers>
    )
    expect(
      screen.getByRole('dialog', { name: 'Template Details' })
    ).toBeInTheDocument()
  })

  it('does not render Categories, Featured, Strategy, or Creator info', () => {
    render(
      <Providers mocks={[getLanguagesMock]}>
        <LocalTemplateDetailsDialog open onClose={onClose} />
      </Providers>
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
      <Providers mocks={[getLanguagesMock, mock]}>
        <LocalTemplateDetailsDialog open onClose={onClose} />
      </Providers>
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
      <Providers
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
        <LocalTemplateDetailsDialog open onClose={onClose} />
      </Providers>
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
      <Providers mocks={[getLanguagesMock, titleMock]}>
        <LocalTemplateDetailsDialog open onClose={onClose} />
      </Providers>
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
      <Providers mocks={[getLanguagesMock]} withJourneyProvider={false}>
        <LocalTemplateDetailsDialog
          open
          onClose={onClose}
          journey={publishedLocalTemplate}
        />
      </Providers>
    )
    expect(
      screen.getByRole('dialog', { name: 'Template Details' })
    ).toBeInTheDocument()
  })

  it('does not call any mutation when the form is unchanged', async () => {
    const titleMock = makeTitleDescLanguageMock({
      title: publishedLocalTemplate.title,
      description: publishedLocalTemplate.description ?? null,
      languageId: publishedLocalTemplate.language.id
    })

    render(
      <Providers mocks={[getLanguagesMock, titleMock]}>
        <LocalTemplateDetailsDialog open onClose={onClose} />
      </Providers>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(titleMock.result).not.toHaveBeenCalled()
  })
})
