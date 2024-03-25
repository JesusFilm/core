import Button from '@mui/material/Button'
import { fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'

import { CustomDomainProvider, useCustomDomain } from '.'

const checkCustomDomain = jest.fn()

const TestComponent = (): ReactElement => {
  const { customDomains } = useCustomDomain()

  return <Button onClick={checkCustomDomain(customDomains)}>Test</Button>
}

const customDomains = {
  customDomains: [
    {
      __typename: 'CustomDomain' as const,
      name: 'mockdomain.com',
      apexName: 'mockdomain.com',
      id: 'customDomainId',
      teamId: 'teamId',
      verification: {
        __typename: 'CustomDomainVerification' as const,
        verified: true,
        verification: []
      },
      configuration: {
        __typename: 'VercelDomainConfiguration' as const,
        misconfigured: false
      },
      journeyCollection: {
        __typename: 'JourneyCollection' as const,
        id: 'journeyCollectionId',
        journeys: []
      }
    }
  ]
}

describe('CustomDomainContext', () => {
  it('should pass through the customDomain props', () => {
    const { getByRole } = render(
      <CustomDomainProvider value={{ customDomains }}>
        <TestComponent />
      </CustomDomainProvider>
    )

    fireEvent.click(getByRole('button'))

    expect(checkCustomDomain).toHaveBeenCalledWith({
      customDomains: [
        {
          __typename: 'CustomDomain',
          name: 'mockdomain.com',
          apexName: 'mockdomain.com',
          id: 'customDomainId',
          teamId: 'teamId',
          verification: {
            __typename: 'CustomDomainVerification',
            verified: true,
            verification: []
          },
          configuration: {
            __typename: 'VercelDomainConfiguration',
            misconfigured: false
          },
          journeyCollection: {
            __typename: 'JourneyCollection',
            id: 'journeyCollectionId',
            journeys: []
          }
        }
      ]
    })
  })
})
