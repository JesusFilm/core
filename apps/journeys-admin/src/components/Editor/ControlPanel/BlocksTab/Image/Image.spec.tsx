import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { fireEvent, getByRole, render, waitFor } from '@testing-library/react'
import { JourneyProvider } from 'apps/journeys-admin/src/libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { Image, IMAGE_BLOCK_CREATE } from '.'

describe('Image', () => {
  it('should check if the mutation gets called', async () => {
    const result = jest.fn()
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  src: null,
                  alt: 'Default Image Icon'
                }
              }
            },
            result: () => {
              result()
              return {}
            }
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider
            initialState={{
              selectedStep: {
                __typename: 'StepBlock',
                id: 'stepId',
                parentBlockId: null,
                locked: true,
                nextBlockId: null,
                children: [
                  {
                    id: 'cardId',
                    __typename: 'CardBlock',
                    parentBlockId: 'stepId',
                    coverBlockId: null,
                    backgroundColor: null,
                    themeMode: null,
                    themeName: null,
                    fullscreen: false,
                    children: []
                  }
                ]
              }
            }}
          >
            <Image />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
