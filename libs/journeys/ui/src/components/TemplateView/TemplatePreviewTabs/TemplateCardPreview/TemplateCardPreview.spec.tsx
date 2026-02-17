import { MockedProvider } from '@apollo/client/testing'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '../../../../libs/block/TreeBlock'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../libs/useJourneyQuery/__generated__/GetJourney'

import { TemplateCardPreview } from './TemplateCardPreview'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockSlideTo = jest.fn()

jest.mock('swiper/react', () => {
  const React = require('react')
  return {
    Swiper: ({ children, onSwiper }: any) => {
      React.useEffect(() => {
        onSwiper?.({ slideTo: mockSlideTo })
      }, [onSwiper])
      return <div data-testid="Swiper">{children}</div>
    },
    SwiperSlide: ({ children, 'data-testid': dataTestId, className }: any) => (
      <div
        data-testid={dataTestId ?? 'TemplateCardsSwiperSlide'}
        className={className}
      >
        {children}
      </div>
    )
  }
})

describe('TemplateCardPreview', () => {
  it('renders correct number of cards', async () => {
    ;(useMediaQuery as unknown as jest.Mock).mockReturnValue(false)
    const steps = [
      { id: '1', children: [{ __typename: 'CardBlock' }] },
      { id: '2', children: [{ __typename: 'CardBlock' }] },
      { id: '3', children: [{ __typename: 'CardBlock' }] }
    ] as Array<TreeBlock<StepBlock>>

    render(
      <ThemeProvider theme={createTheme()}>
        <TemplateCardPreview steps={steps} />
      </ThemeProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(3)
    )
  })

  it('renders use template slide if more than 7 cards in journey', async () => {
    const steps = [
      { id: '1', children: [{ __typename: 'CardBlock' }] },
      { id: '2', children: [{ __typename: 'CardBlock' }] },
      { id: '3', children: [{ __typename: 'CardBlock' }] },
      { id: '4', children: [{ __typename: 'CardBlock' }] },
      { id: '5', children: [{ __typename: 'CardBlock' }] },
      { id: '6', children: [{ __typename: 'CardBlock' }] },
      { id: '7', children: [{ __typename: 'CardBlock' }] },
      { id: '8', children: [{ __typename: 'CardBlock' }] },
      { id: '9', children: [{ __typename: 'CardBlock' }] },
      { id: '10', children: [{ __typename: 'CardBlock' }] }
    ] as Array<TreeBlock<StepBlock>>

    render(
      <MockedProvider>
        <ThemeProvider theme={createTheme()}>
          <TemplateCardPreview steps={steps} />
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(7)
    )
    expect(screen.getByTestId('UseTemplatesSlide')).toBeInTheDocument()
    expect(
      screen.getByTestId('UseThisTemplateButtonSkeleton')
    ).toBeInTheDocument()
  })

  it('renders correct number of cards on small breakpoints', async () => {
    ;(useMediaQuery as unknown as jest.Mock).mockReturnValue(true)
    const steps = [
      { id: '1', children: [{ __typename: 'CardBlock' }] },
      { id: '2', children: [{ __typename: 'CardBlock' }] },
      { id: '3', children: [{ __typename: 'CardBlock' }] }
    ] as Array<TreeBlock<StepBlock>>

    render(
      <ThemeProvider theme={createTheme()}>
        <TemplateCardPreview steps={steps} />
      </ThemeProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(3)
    )
  })

  it('renders skeleton cards while loading', async () => {
    const steps = undefined

    render(
      <ThemeProvider theme={createTheme()}>
        <TemplateCardPreview steps={steps} />
      </ThemeProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('TemplateCardSkeleton')).toHaveLength(7)
    )
  })

  describe('media variant', () => {
    it('should render all steps and not show more cards slide', async () => {
      const steps = [
        { id: '1', children: [{ __typename: 'CardBlock' }] },
        { id: '2', children: [{ __typename: 'CardBlock' }] },
        { id: '3', children: [{ __typename: 'CardBlock' }] },
        { id: '4', children: [{ __typename: 'CardBlock' }] },
        { id: '5', children: [{ __typename: 'CardBlock' }] },
        { id: '6', children: [{ __typename: 'CardBlock' }] },
        { id: '7', children: [{ __typename: 'CardBlock' }] },
        { id: '8', children: [{ __typename: 'CardBlock' }] },
        { id: '9', children: [{ __typename: 'CardBlock' }] },
        { id: '10', children: [{ __typename: 'CardBlock' }] }
      ] as Array<TreeBlock<StepBlock>>

      render(
        <ThemeProvider theme={createTheme()}>
          <TemplateCardPreview steps={steps} variant="media" />
        </ThemeProvider>
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(
          10
        )
      )
      expect(screen.queryByTestId('UseTemplatesSlide')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButtonSkeleton')
      ).not.toBeInTheDocument()
    })

    it('should slide to selected step', async () => {
      const steps = [
        { id: '1', children: [{ __typename: 'CardBlock' }] },
        { id: '2', children: [{ __typename: 'CardBlock' }] },
        { id: '3', children: [{ __typename: 'CardBlock' }] }
      ] as Array<TreeBlock<StepBlock>>

      render(
        <ThemeProvider theme={createTheme()}>
          <TemplateCardPreview
            steps={steps}
            variant="media"
            selectedStep={steps[1]}
          />
        </ThemeProvider>
      )
      await waitFor(() => expect(mockSlideTo).toHaveBeenCalledWith(1, 500))
    })
  })
})