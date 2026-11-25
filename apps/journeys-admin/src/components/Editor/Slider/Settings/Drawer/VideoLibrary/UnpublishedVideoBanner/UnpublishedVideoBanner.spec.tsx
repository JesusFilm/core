import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../../../../../../ThemeProvider'

import { UnpublishedVideoBanner } from './UnpublishedVideoBanner'

describe('UnpublishedVideoBanner', () => {
  it('should render an unpublished warning with an explanatory note', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider>
          <UnpublishedVideoBanner />
        </ThemeProvider>
      </SnackbarProvider>
    )

    expect(getByText('Unpublished')).toBeInTheDocument()
    expect(
      getByText(
        'This video has not been published yet. It can still be added to a journey, but visitors will not be able to watch it until it is published.'
      )
    ).toBeInTheDocument()
  })
})
