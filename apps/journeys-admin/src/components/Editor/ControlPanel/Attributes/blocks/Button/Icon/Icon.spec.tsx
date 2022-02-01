import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { Icon } from '.'

describe('Button icon selector', () => {
  it('shows icon properties', () => {
    const { getByText } = render(
      <MockedProvider>
        <Icon
          id={'button-icon-id'}
          iconName={null}
          iconSize={null}
          iconColor={null}
        />
      </MockedProvider>
    )
    expect(getByText('Icon')).toBeInTheDocument()
  })
  it('changes icon properties', () => {
    const { getByText } = render(
      <MockedProvider>
        <Icon
          id={'button-icon-id'}
          iconName={null}
          iconSize={null}
          iconColor={null}
        />
      </MockedProvider>
    )
    expect(getByText('Icon')).toBeInTheDocument()
  })
})
