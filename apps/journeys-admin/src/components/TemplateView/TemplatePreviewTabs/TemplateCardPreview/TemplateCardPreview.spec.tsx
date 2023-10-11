import { ThemeProvider, createTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourney'

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
      expect(getAllByTestId('templateCardsSwiperSlide')).toHaveLength(3)
    )
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
      expect(getAllByTestId('templateCardsSwiperSlide')).toHaveLength(3)
    )
  })
})
