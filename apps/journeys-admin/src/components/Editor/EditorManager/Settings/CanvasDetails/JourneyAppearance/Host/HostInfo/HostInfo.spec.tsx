import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'

import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { HostInfo } from './HostInfo'

describe('HostInfo', () => {
  it('should render hostinfo', () => {
    const handleSelection = jest.fn()

    const { getByText, getByTestId, getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <HostInfo handleSelection={handleSelection} />
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(getByTestId('UserProfileCircleIcon')).toBeInTheDocument()
    expect(getByText('Why does your journey need a host?')).toBeInTheDocument()
    expect(
      getByText(
        'A great way to add personality to your content is to include both male and female journey creators. Diverse creators, especially with a local feel, are more likely to engage users in conversation.'
      )
    ).toBeInTheDocument()
    expect(
      getByText(
        'In countries with security concerns, it is advisable to create fake personas for your own safety.'
      )
    ).toBeInTheDocument()
  })

  it('should call handleselection on back button click', () => {
    const handleSelection = jest.fn()

    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <HostInfo handleSelection={handleSelection} />
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Back' }))
    expect(handleSelection).toHaveBeenCalledWith('list')
  })
})
