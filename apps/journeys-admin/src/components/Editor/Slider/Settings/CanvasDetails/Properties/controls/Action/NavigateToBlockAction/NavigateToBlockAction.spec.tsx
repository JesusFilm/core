import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { ActiveSlide, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/TemplateView/TemplateFooter/data'

import { TestEditorState } from '../../../../../../../../../libs/TestEditorState'
import { steps } from '../data'

import { NavigateToBlockAction } from './NavigateToBlockAction'

describe('NavigateToBlockAction', () => {
  const selectedBlock = steps[1].children[0].children[3]

  it("should show 'back to map' button", () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ steps }}>
            <NavigateToBlockAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'back to map' })).toBeInTheDocument()
  })

  it("should hanle 'back to map' button click", () => {
    const { getByText, queryByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{ steps, activeSlide: ActiveSlide.Drawer }}
          >
            <NavigateToBlockAction />
            <TestEditorState />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(queryByText('activeSlide: 0')).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'back to map' }))
    expect(getByText('activeSlide: 0')).toBeInTheDocument()
  })

  it('should show preview of connected card', async () => {
    const selectedBlockWithAction = {
      ...selectedBlock,
      action: {
        __typename: 'NavigateToBlockAction' as const,
        blockId: 'step2.id',
        parentBlockId: 'someParentBlockId',
        gtmEventName: 'someGTMEventName'
      }
    }
    const { getByTestId, queryByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{
              steps,
              selectedBlock: selectedBlockWithAction,
              selectedStep: steps[2]
            }}
          >
            <NavigateToBlockAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        queryByText('Connect this block to a card in the Journey Flow')
      ).not.toBeInTheDocument()
    )
    expect(getByTestId('CardItem-step2.id')).toBeInTheDocument()
  })
})
