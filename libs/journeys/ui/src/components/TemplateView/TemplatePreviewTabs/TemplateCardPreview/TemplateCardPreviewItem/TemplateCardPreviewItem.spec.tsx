import { ThemeProvider, createTheme } from '@mui/material/styles'
import { fireEvent, render, act } from '@testing-library/react'
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

  describe('iframe tab focus prevention', () => {
    it('should set tabIndex -1 on iframe for guestPreview variant', () => {
      const { container } = renderWithProviders(
        <TemplateCardPreviewItem step={step} variant="guestPreview" />
      )
      const iframe = container.querySelector('iframe')
      expect(iframe).toHaveAttribute('tabindex', '-1')
    })

    it('should not set tabIndex on iframe for standard variant', () => {
      const { container } = renderWithProviders(
        <TemplateCardPreviewItem step={step} variant="standard" />
      )
      const iframe = container.querySelector('iframe')
      expect(iframe).not.toHaveAttribute('tabindex')
    })

    it('should not set tabIndex on iframe for compact variant', () => {
      const { container } = renderWithProviders(
        <TemplateCardPreviewItem step={step} variant="compact" />
      )
      const iframe = container.querySelector('iframe')
      expect(iframe).not.toHaveAttribute('tabindex')
    })

    it('should disable focusable elements inside iframe for guestPreview', () => {
      jest.useFakeTimers()

      const { container } = renderWithProviders(
        <TemplateCardPreviewItem step={step} variant="guestPreview" />
      )

      const iframe = container.querySelector('iframe')
      if (iframe?.contentDocument?.body != null) {
        const button = iframe.contentDocument.createElement('button')
        button.textContent = 'Click me'
        iframe.contentDocument.body.appendChild(button)

        act(() => {
          jest.advanceTimersByTime(100)
        })

        expect(button.getAttribute('tabindex')).toBe('-1')
      }

      jest.useRealTimers()
    })

    it('should clean up interval and observer on unmount', () => {
      jest.useFakeTimers()
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

      const { unmount } = renderWithProviders(
        <TemplateCardPreviewItem step={step} variant="guestPreview" />
      )

      unmount()
      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
      jest.useRealTimers()
    })
  })
})
