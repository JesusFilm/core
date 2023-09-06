import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { FlagsProvider, useFlags } from '.'

describe('FlagsProvider', () => {
  it('should render children', () => {
    const { getByText } = render(
      <FlagsProvider>Hello from FlagsProvider</FlagsProvider>
    )
    expect(getByText('Hello from FlagsProvider')).toBeInTheDocument()
  })
})

describe('useFlags', () => {
  const FlagsComponent = (): ReactElement => {
    const flags = useFlags()
    return <>{JSON.stringify(flags)}</>
  }

  it('should render empty object', () => {
    const { getByText } = render(<FlagsComponent />)
    expect(getByText('{}')).toBeInTheDocument()
  })

  it('should render flags when in provider', () => {
    const { getByText } = render(
      <FlagsProvider flags={{ testFlag: true }}>
        <FlagsComponent />
      </FlagsProvider>
    )
    expect(getByText('{"testFlag":true}')).toBeInTheDocument()
  })
})
