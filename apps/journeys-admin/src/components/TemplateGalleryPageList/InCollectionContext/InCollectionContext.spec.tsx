import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'

import { InCollectionContext, useInCollection } from './InCollectionContext'

function Probe({ testId }: { testId: string }): ReactElement {
  const inCollection = useInCollection()
  return <div data-testid={testId}>{inCollection ? 'true' : 'false'}</div>
}

describe('InCollectionContext', () => {
  describe('useInCollection', () => {
    it('returns true when consumer is rendered inside a provider', () => {
      render(
        <InCollectionContext.Provider value>
          <Probe testId="probe" />
        </InCollectionContext.Provider>
      )

      expect(screen.getByTestId('probe')).toHaveTextContent('true')
    })

    it('returns false when consumer is rendered outside any provider', () => {
      render(<Probe testId="probe" />)

      expect(screen.getByTestId('probe')).toHaveTextContent('false')
    })

    it('does not throw and resolves to the closest provider value when nested', () => {
      render(
        <InCollectionContext.Provider value={false}>
          <Probe testId="outer" />
          <InCollectionContext.Provider value>
            <Probe testId="inner" />
          </InCollectionContext.Provider>
        </InCollectionContext.Provider>
      )

      expect(screen.getByTestId('outer')).toHaveTextContent('false')
      expect(screen.getByTestId('inner')).toHaveTextContent('true')
    })
  })
})
