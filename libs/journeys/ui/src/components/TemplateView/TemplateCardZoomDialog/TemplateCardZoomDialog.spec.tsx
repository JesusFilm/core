import { ThemeProvider, createTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render, screen } from '@testing-library/react'

import { TreeBlock } from '../../../libs/block'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../libs/useJourneyQuery/__generated__/GetJourney'

import { TemplateCardZoomDialog } from './TemplateCardZoomDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('swiper/react', () => {
  const React = require('react')
  return {
    Swiper: ({ children }: any) => <div data-testid="Swiper">{children}</div>,
    SwiperSlide: ({ children, 'data-testid': dataTestId }: any) => (
      <div data-testid={dataTestId ?? 'TemplateCardsSwiperSlide'}>
        {children}
      </div>
    )
  }
})

const steps = [
  { id: '1', children: [{ __typename: 'CardBlock' }] },
  { id: '2', children: [{ __typename: 'CardBlock' }] }
] as Array<TreeBlock<StepBlock>>

describe('TemplateCardZoomDialog', () => {
  it('renders the dialog when open', () => {
    ;(useMediaQuery as unknown as jest.Mock).mockReturnValue(false)
    render(
      <ThemeProvider theme={createTheme()}>
        <TemplateCardZoomDialog
          open
          onClose={jest.fn()}
          steps={steps}
          selectedStep={null}
        />
      </ThemeProvider>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('uses guestPreviewMobile variant on mobile', () => {
    ;(useMediaQuery as unknown as jest.Mock).mockReturnValue(false)
    render(
      <ThemeProvider theme={createTheme()}>
        <TemplateCardZoomDialog
          open
          onClose={jest.fn()}
          steps={steps}
          selectedStep={null}
        />
      </ThemeProvider>
    )
    expect(screen.getByTestId('Swiper')).toBeInTheDocument()
  })

  it('uses guestPreviewDesktop variant on desktop', () => {
    ;(useMediaQuery as unknown as jest.Mock).mockReturnValue(true)
    render(
      <ThemeProvider theme={createTheme()}>
        <TemplateCardZoomDialog
          open
          onClose={jest.fn()}
          steps={steps}
          selectedStep={null}
        />
      </ThemeProvider>
    )
    expect(screen.getByTestId('Swiper')).toBeInTheDocument()
  })
})
