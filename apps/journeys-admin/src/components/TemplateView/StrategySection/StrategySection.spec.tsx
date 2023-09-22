import { fireEvent, render, waitFor } from '@testing-library/react'

import { StrategySection } from './StrategySection'

describe('StrategySection', () => {
  it('should render embedded canva strategy slug properly', () => {
    const canvaStrategySlug = 'https://www.canva.com/design/DAFvDBw1z1A/view'
    const { getByTestId } = render(
      <StrategySection strategySlug={canvaStrategySlug} />
    )

    expect(getByTestId('strategy-iframe')).toHaveAttribute(
      'src',
      `${canvaStrategySlug}?embed`
    )
  })

  it('should render embedded google strategy slug properly', () => {
    const googleStrategySlug =
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
    const { getByTestId } = render(
      <StrategySection strategySlug={googleStrategySlug} />
    )

    expect(getByTestId('strategy-iframe')).toHaveAttribute(
      'src',
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/embed?start=false&loop=false&delayms=3000'
    )
  })

  it('should fade in iframe content when loaded', () => {
    const googleStrategySlug =
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
    const { getByTestId } = render(
      <StrategySection strategySlug={googleStrategySlug} />
    )

    const iframe = getByTestId('strategy-iframe')
    expect(iframe.style.opacity).toBe('0')
    fireEvent.load(iframe)
    expect(iframe.style.opacity).toBe('1')
  })
})
