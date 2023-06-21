import { fireEvent, render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { HostAvatarsButton } from './HostAvatarsButton'

describe('HostAvatarsButton', () => {
  const defaultHost = {
    id: 'hostId',
    __typename: 'Host' as const,
    teamId: 'teamId',
    title: 'Cru International',
    location: null,
    src1: null,
    src2: null
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost
  } as unknown as Journey

  it('should display default icon if no avatars set ', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey: { ...journey, host: null } }}>
            <HostAvatarsButton />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByTestId('avatar1').firstChild).toHaveAttribute(
      'data-testid',
      'UserProfileAddIcon'
    )
    expect(getByTestId('avatar2').firstChild).toHaveAttribute(
      'data-testid',
      'UserProfileAddIcon'
    )
  })

  it('should display avatar image if set ', () => {
    const { getByAltText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: {
                ...journey,
                host: { ...defaultHost, src1: 'avatar1Src', src2: 'avatar2Src' }
              }
            }}
          >
            <HostAvatarsButton />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByAltText('avatar1')).toHaveAttribute('src', 'avatar1Src')
    expect(getByAltText('avatar2')).toHaveAttribute('src', 'avatar2Src')
  })

  it('should open image edit library on avatar click', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: {
                ...journey,
                host: { ...defaultHost, src1: 'avatar1Src' }
              }
            }}
          >
            <HostAvatarsButton />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('avatar1'))
    expect(getByTestId('imageSrcStack')).toBeInTheDocument()
    expect(getByRole('img')).toHaveAttribute('src', 'avatar1Src')
    fireEvent.click(getByRole('button', { name: 'close-image-library' }))

    fireEvent.click(getByTestId('avatar2'))
    expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
  })

  // TODO: Add to E2E
  xit('should change host image src on image change', () => {
    render(<HostAvatarsButton />)
  })

  xit('should remove host image src on image delete', () => {
    render(<HostAvatarsButton />)
  })
})
