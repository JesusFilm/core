import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { TypographyVariant } from '../../../../__generated__/globalTypes'
import { GET_DISCOVERY_JOURNEY } from './EmbedJourney'
import { EmbedJourney } from '.'

describe('EmbedJourney', () => {
  const result = jest.fn(() => ({
    data: {
      discoveryJourney: {
        id: 'id',
        title: 'Discovery Journey - How To',
        seoTitle: 'Discovery Journey - How to',
        blocks: [
          {
            id: 'step1.id',
            __typename: 'StepBlock',
            parentBlockId: null,
            parentOrder: 1,
            locked: true,
            nextBlockId: 'step2.id',
            children: [
              {
                id: 'card1.id',
                __typename: 'CardBlock',
                parentBlockId: 'step1.id',
                parentOrder: 0,
                backgroundColor: null,
                coverBlockId: null,
                themeMode: null,
                themeName: null,
                fullscreen: false,
                children: [
                  {
                    id: 'typographyBlockId1',
                    __typename: 'TypographyBlock',
                    parentBlockId: 'card1.id',
                    parentOrder: 0,
                    align: null,
                    color: null,
                    content: 'Step 1',
                    variant: TypographyVariant.h3,
                    children: []
                  }
                ]
              }
            ]
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
