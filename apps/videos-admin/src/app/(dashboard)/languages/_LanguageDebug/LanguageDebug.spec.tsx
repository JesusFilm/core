import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import { LanguageDebug, REINDEX_LANGUAGES_IN_ALGOLIA } from './LanguageDebug'

function renderWithMocks(
  mocks: React.ComponentProps<typeof MockedProvider>['mocks']
): void {
  render(
    <MockedProvider mocks={mocks}>
      <SnackbarProvider>
        <LanguageDebug />
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('LanguageDebug', () => {
  it('reindexes languages and reports the count on success', async () => {
    const user = userEvent.setup()
    renderWithMocks([
      {
        request: { query: REINDEX_LANGUAGES_IN_ALGOLIA },
        result: {
          data: {
            reindexLanguagesInAlgolia: {
              count: 7,
              __typename: 'ReindexLanguagesInAlgoliaResult'
            }
          }
        }
      }
    ])

    await user.click(
      screen.getByRole('button', { name: 'Reindex languages in Algolia' })
    )

    expect(
      await screen.findByText('Reindexed 7 languages in Algolia')
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Last run reindexed 7 languages.')
    ).toBeInTheDocument()
  })

  it('shows an error message when the mutation fails', async () => {
    const user = userEvent.setup()
    renderWithMocks([
      {
        request: { query: REINDEX_LANGUAGES_IN_ALGOLIA },
        error: new Error('boom')
      }
    ])

    await user.click(
      screen.getByRole('button', { name: 'Reindex languages in Algolia' })
    )

    expect(
      await screen.findByText('Failed to reindex languages in Algolia')
    ).toBeInTheDocument()
  })
})
