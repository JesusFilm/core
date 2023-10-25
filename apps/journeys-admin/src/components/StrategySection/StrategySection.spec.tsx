import { fireEvent, render } from '@testing-library/react'

import { StrategySection } from './StrategySection'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('StrategySection', () => {
  it('should render embedded canva strategy slug', () => {
    const canvaStrategySlug = 'https://www.canva.com/design/DAFvDBw1z1A/view'
    const { getByTestId, getByText } = render(
      <StrategySection strategySlug={canvaStrategySlug} variant="full" />
    )

    expect(getByText('Strategy')).toBeInTheDocument()
    expect(getByTestId('strategy-iframe')).toHaveAttribute(
      'src',
      `${canvaStrategySlug}?embed`
    )
  })

  it('should render embedded google strategy slug', () => {
    const googleStrategySlug =
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
    const { getByTestId, getByText } = render(
      <StrategySection strategySlug={googleStrategySlug} variant="full" />
    )

    expect(getByText('Strategy')).toBeInTheDocument()
    expect(getByTestId('strategy-iframe')).toHaveAttribute(
      'src',
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/embed?start=false&loop=false&delayms=3000'
    )
  })

  it('should fade in iframe content when loaded', () => {
    const googleStrategySlug =
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
    const { getByTestId, getByText } = render(
      <StrategySection strategySlug={googleStrategySlug} variant="full" />
    )

    expect(getByText('Strategy')).toBeInTheDocument()
    const iframe = getByTestId('strategy-iframe')
    expect(iframe.style.opacity).toBe('0')
    fireEvent.load(iframe)
    expect(iframe.style.opacity).toBe('1')
  })

  it('should not render strategy title if preview variant', () => {
    const googleStrategySlug =
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
    const { queryByText } = render(
      <StrategySection
        strategySlug={googleStrategySlug}
        variant="placeholder"
      />
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
  })

  it('should render empty placeholder preview on empty strategy slug and validation error', () => {
    const { queryByText, queryByTestId, getByTestId } = render(
      <StrategySection strategySlug="" variant="placeholder" isError />
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
    expect(queryByTestId('strategy-iframe')).not.toBeInTheDocument()
    expect(getByTestId('case-study-preview-placeholder')).toBeInTheDocument()
  })
})
