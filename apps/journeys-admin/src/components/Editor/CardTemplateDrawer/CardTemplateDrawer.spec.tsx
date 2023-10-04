import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { TestEditorState } from '../../../libs/TestEditorState'

import { CARD_VIDEO_CREATE } from './Templates/CardVideo/CardVideo'

import { CardTemplateDrawer } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('CardTemplateDrawer', () => {
  it('changes content of card to match template', async () => {
    const card: TreeBlock = {
      id: 'cardId',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const step: TreeBlock = {
      id: 'stepId',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: [card]
    }
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CARD_VIDEO_CREATE,
              variables: {
                videoInput: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  videoId: '1_jf-0-0',
                  videoVariantLanguageId: '529',
                  startAt: 2048,
                  endAt: 2058,
                  autoplay: true,
                  muted: false,
                  source: VideoBlockSource.internal
                }
              }
            },
            result: {
              data: {
                video: null
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <TestEditorState />
            <CardTemplateDrawer />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
    await waitFor(() =>
      expect(getByText('drawerTitle: Properties')).toBeInTheDocument()
    )
    expect(getByText('selectedBlock: stepId')).toBeInTheDocument()
    expect(getByText('selectedAttributeId:')).toBeInTheDocument()
  })
})
