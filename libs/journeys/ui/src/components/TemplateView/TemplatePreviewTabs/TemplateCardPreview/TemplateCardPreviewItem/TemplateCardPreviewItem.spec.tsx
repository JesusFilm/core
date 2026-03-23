import { ThemeProvider, createTheme } from '@mui/material/styles'
import { fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../../libs/block'
import { JourneyProvider } from '../../../../../libs/JourneyProvider'
import { journey } from '../../../../../libs/JourneyProvider/JourneyProvider.mock'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../libs/useJourneyQuery/__generated__/GetJourney'

import { TemplateCardPreviewItem } from './TemplateCardPreviewItem'

function renderWithProviders(children: ReactElement) {
  return render(
    <ThemeProvider theme={createTheme()}>
      <JourneyProvider value={{ journey: journey }}>{children}</JourneyProvider>
    </ThemeProvider>
  )
}

describe('TemplateCardPreviewItem', () => {
  const step = {
    __typename: 'StepBlock',
    id: 'step1',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        __typename: 'CardBlock',
        id: 'card1',
        parentBlockId: 'step1',
        parentOrder: 0,
        backgroundColor: null,
        backdropBlur: null,
        coverBlockId: null,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        fullscreen: false,
        eventLabel: null,
        children: []
      }
    ]
  } as TreeBlock<StepBlock>

  it('should render preview variant', () => {
    const { getByTestId } = renderWithProviders(
      <TemplateCardPreviewItem step={step} variant="standard" />
    )
    expect(getByTestId('TemplateCardPreviewItem')).toBeInTheDocument()
  })

  it('should render media variant', () => {
    const { getByTestId } = renderWithProviders(
      <TemplateCardPreviewItem step={step} variant="compact" />
    )
    expect(getByTestId('TemplateCardPreviewItem')).toBeInTheDocument()
  })

  it('should render guestPreview variant', () => {
    const { getByTestId } = renderWithProviders(
      <TemplateCardPreviewItem step={step} variant="guestPreview" />
    )
    expect(getByTestId('TemplateCardPreviewItem')).toBeInTheDocument()
  })

  it('should call onClick with step when clicked', () => {
    const handleClick = jest.fn()
    const { getByTestId } = renderWithProviders(
      <TemplateCardPreviewItem
        step={step}
        variant="standard"
        onClick={handleClick}
      />
    )
    fireEvent.click(getByTestId('TemplateCardPreviewItem'))
    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith(step)
  })

  it('should render when selectedStep matches step id', () => {
    const { getByTestId } = renderWithProviders(
      <TemplateCardPreviewItem
        step={step}
        variant="standard"
        selectedStep={step}
      />
    )
    expect(getByTestId('TemplateCardPreviewItem')).toBeInTheDocument()
  })

  it('should render when selectedStep is null', () => {
    const { getByTestId } = renderWithProviders(
      <TemplateCardPreviewItem
        step={step}
        variant="standard"
        selectedStep={null}
      />
    )
    expect(getByTestId('TemplateCardPreviewItem')).toBeInTheDocument()
  })

  it('should scale up the selected compact card', () => {
    const { getByTestId } = renderWithProviders(
      <TemplateCardPreviewItem
        step={step}
        variant="compact"
        selectedStep={step}
      />
    )
    expect(getByTestId('TemplateCardPreviewItem')).toHaveStyle({
      transform: 'scale(1.25)'
    })
  })

  it('should dim non-selected compact cards', () => {
    const otherStep = { ...step, id: 'other' } as TreeBlock<StepBlock>
    const { getByTestId } = renderWithProviders(
      <TemplateCardPreviewItem
        step={step}
        variant="compact"
        selectedStep={otherStep}
      />
    )
    expect(getByTestId('TemplateCardPreviewItem')).toHaveStyle({
      opacity: 0.75
    })
  })

  it('should render with steps prop for StepHeader and StepFooter', () => {
    const { getByTestId } = renderWithProviders(
      <TemplateCardPreviewItem step={step} variant="standard" steps={[step]} />
    )
    expect(getByTestId('TemplateCardPreviewItem')).toBeInTheDocument()
  })
})
