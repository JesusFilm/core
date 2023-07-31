import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { GET_DISCOVERY_JOURNEY } from './EmbedJourney'
import { EmbedJourney } from '.'

describe('EmbedJourney', () => {
  const result = jest.fn(() => ({
    data: {
      discoveryJourney: {
        id: 'd3ec8a9a-51e8-4977-a4da-750245cc22d2',
        title: 'Discovery Journey - Vision',
        seoTitle: null,
        __typename: 'Journey',
        blocks: [
          {
            id: '3250f2c3-082f-4373-b46d-d2e4df899789',
            parentBlockId: null,
            parentOrder: 0,
            locked: false,
            nextBlockId: null,
            __typename: 'StepBlock'
          },
          {
            id: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
            parentBlockId: '3250f2c3-082f-4373-b46d-d2e4df899789',
            parentOrder: 0,
            backgroundColor: '#FFFFFF',
            coverBlockId: '8c1a1509-685c-4c5e-9bbf-f3b9dd0e7aff',
            themeMode: 'light',
            themeName: 'base',
            fullscreen: false,
            __typename: 'CardBlock'
          },
          {
            id: 'aee42424-97bb-4a60-b459-8123b97868a6',
            parentBlockId: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
            parentOrder: 0,
            align: 'center',
            color: null,
            content: 'Vision',
            variant: 'h6',
            __typename: 'TypographyBlock'
          },
          {
            id: '74bf83db-292b-47e9-b465-7044f12c0bc4',
            parentBlockId: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
            parentOrder: 1,
            align: 'center',
            color: null,
            content: 'Innovation in Digital Missions',
            variant: 'h1',
            __typename: 'TypographyBlock'
          },
          {
            id: '65862251-8e65-4430-9e98-cd909b85bb4f',
            parentBlockId: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
            parentOrder: 2,
            label:
              'Learn how NextSteps can be instrumental in reaching the lost.',
            buttonVariant: 'text',
            buttonColor: 'primary',
            size: 'medium',
            startIconId: null,
            endIconId: null,
            action: null,
            __typename: 'ButtonBlock'
          },
          {
            id: '8c1a1509-685c-4c5e-9bbf-f3b9dd0e7aff',
            parentBlockId: '89bd305e-3662-4d1e-913a-066f2f55d9c0',
            parentOrder: 0,
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/0faecc7a-1749-4e2c-66a0-4dde6d5cbc00/public',
            alt: 'public',
            width: 6000,
            height: 4000,
            blurhash: 'LZECIr~Xxtxb?K?I%LocIUWCxubD',
            __typename: 'ImageBlock'
          }
        ]
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: GET_DISCOVERY_JOURNEY,
        variables: {
          id: `discovery-admin-center`
        }
      },
      result
    }
  ]

  it('should get discovery journeys', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <EmbedJourney slug="admin-center" />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should handle click for embed journey', () => {
    window.open = jest.fn()
    const { getByLabelText } = render(
      <MockedProvider>
        <EmbedJourney slug="admin-center" />
      </MockedProvider>
    )
    fireEvent.click(getByLabelText('admin-center-embedded'))
    expect(window.open).toHaveBeenCalledWith(
      'https://your.nextstep.is/admin-center'
    )
  })
})
