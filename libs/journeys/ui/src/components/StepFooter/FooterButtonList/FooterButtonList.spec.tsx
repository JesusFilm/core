import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields } from '../../../libs/JourneyProvider/__generated__/JourneyFields'

import { FooterButtonList } from './FooterButtonList'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('FooterButtonList', () => {
  it('should render reaction buttons', () => {
    const journey = {
      showShareButton: true,
      showLikeButton: true,
      showDislikeButton: true
    } as unknown as JourneyFields

    render(
      <SnackbarProvider>
        <JourneyProvider value={{ journey }}>
          <FooterButtonList />
        </JourneyProvider>
      </SnackbarProvider>
    )
    expect(screen.getByTestId('StepFooterButtonList')).toBeInTheDocument()
    expect(screen.getByTestId('ShareIcon')).toBeInTheDocument()
    expect(screen.getByTestId('ThumbsUpIcon')).toBeInTheDocument()
    expect(screen.getByTestId('ThumbsDownIcon')).toBeInTheDocument()
  })

  it('should only hide a button when value is false', () => {
    const journey = {
      showShareButton: false,
      showLikeButton: null,
      showDislikeButton: undefined
    } as unknown as JourneyFields

    render(
      <SnackbarProvider>
        <JourneyProvider value={{ journey }}>
          <FooterButtonList />
        </JourneyProvider>
      </SnackbarProvider>
    )

    expect(screen.queryByTestId('ShareIcon')).not.toBeInTheDocument()
    expect(screen.getByTestId('ThumbsUpIcon')).toBeInTheDocument()
    expect(screen.getByTestId('ThumbsDownIcon')).toBeInTheDocument()
  })

  it('should not render footer button list if there are no buttons', () => {
    const journey = {
      showShareButton: false,
      showLikeButton: false,
      showDislikeButton: false
    } as unknown as JourneyFields

    render(
      <SnackbarProvider>
        <JourneyProvider value={{ journey }}>
          <FooterButtonList />
        </JourneyProvider>
      </SnackbarProvider>
    )

    expect(screen.queryByTestId('StepFooterButtonList')).not.toBeInTheDocument()
  })
})
