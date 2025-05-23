import { MockedProvider } from '@apollo/client/testing'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render, waitFor } from '@testing-library/react'

import { TreeBlock } from '../../../../libs/block/TreeBlock'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../libs/useJourneyQuery/__generated__/GetJourney'

import { TemplateCardPreview } from './TemplateCardPreview'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TemplateCardPreview', () => {
  it('renders correct number of cards', async () => {
    ;(useMediaQuery as unknown as jest.Mock).mockReturnValue(false)
    const steps = [
      { id: '1', children: [{ __typename: 'CardBlock' }] },
      { id: '2', children: [{ __typename: 'CardBlock' }] },
      { id: '3', children: [{ __typename: 'CardBlock' }] }
    ] as Array<TreeBlock<StepBlock>>

    const { getAllByTestId } = render(
      <ThemeProvider theme={createTheme()}>
        <TemplateCardPreview steps={steps} />
      </ThemeProvider>
    )
    await waitFor(() =>
      expect(getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(3)
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

    const { getAllByTestId, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider theme={createTheme()}>
          <TemplateCardPreview steps={steps} />
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(7)
    )
    expect(getByTestId('UseTemplatesSlide')).toBeInTheDocument()
  })

  it('renders correct number of cards on small breakpoints', async () => {
    ;(useMediaQuery as unknown as jest.Mock).mockReturnValue(true)
    const steps = [
      { id: '1', children: [{ __typename: 'CardBlock' }] },
      { id: '2', children: [{ __typename: 'CardBlock' }] },
      { id: '3', children: [{ __typename: 'CardBlock' }] }
    ] as Array<TreeBlock<StepBlock>>

    const { getAllByTestId } = render(
      <ThemeProvider theme={createTheme()}>
        <TemplateCardPreview steps={steps} />
      </ThemeProvider>
    )
    await waitFor(() =>
      expect(getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(3)
    )
  })

  it('renders skeleton cards while loading', async () => {
    const steps = undefined

    const { getAllByTestId } = render(
      <ThemeProvider theme={createTheme()}>
        <TemplateCardPreview steps={steps} />
      </ThemeProvider>
    )
    await waitFor(() =>
      expect(getAllByTestId('TemplateCardSkeleton')).toHaveLength(7)
    )
  })
})
