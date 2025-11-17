import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { EditorProvider, ActiveContent } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { CardSlugEdit } from '.'
import { STEP_BLOCK_SLUG_UPDATE } from './CardSlugEdit'
import {
  StepBlockSlugUpdate,
  StepBlockSlugUpdateVariables
} from '../../../../../../../__generated__/StepBlockSlugUpdate'
import { CommandUndoItem } from '../../../../Toolbar/Items/CommandUndoItem/CommandUndoItem'

// Mock translations
jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

function getSlugUpdateMock(
  id: string,
  slug: string
): MockedResponse<StepBlockSlugUpdate, StepBlockSlugUpdateVariables> {
  return {
    request: {
      query: STEP_BLOCK_SLUG_UPDATE,
      variables: { id, input: { slug } }
    },
    result: jest.fn(() => ({
      data: {
        stepBlockUpdate: {
          __typename: 'StepBlock',
          id,
          slug
        }
      }
    }))
  }
}

describe('CardSlugEdit', () => {
  it('should display the current slug in the text field', () => {
    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'existing-slug',
      children: []
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: { id: 'journeyId' } as any }}>
            <EditorProvider
              initialState={{
                steps: [step],
                selectedStep: step,
                activeContent: ActiveContent.Canvas
              }}
            >
              <CardSlugEdit />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByDisplayValue('existing-slug')).toBeInTheDocument()
  })

  it('should display placeholder if no slug is set', () => {
    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: []
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: { id: 'journeyId' } as any }}>
            <EditorProvider
              initialState={{
                steps: [step],
                selectedStep: step,
                activeContent: ActiveContent.Canvas
              }}
            >
              <CardSlugEdit />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByPlaceholderText('your-card-link')).toBeInTheDocument()
  })

  it('should update the slug when the text field is submitted', async () => {
    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'old-slug',
      children: []
    }

    const updateMock = getSlugUpdateMock(step.id, 'new-slug')

    render(
      <MockedProvider mocks={[updateMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: { id: 'j1' } as any }}>
            <EditorProvider
              initialState={{
                steps: [step],
                selectedStep: step,
                activeContent: ActiveContent.Canvas
              }}
            >
              <CardSlugEdit />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByDisplayValue('old-slug') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'new-slug' } })
    fireEvent.blur(input)

    await waitFor(() =>
      expect(updateMock.result as jest.Mock).toHaveBeenCalled()
    )
  })

  it('should throw error if invalid slug and reset input', async () => {
    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'valid-slug',
      children: []
    }
    const errorMock: MockedResponse<
      StepBlockSlugUpdate,
      StepBlockSlugUpdateVariables
    > = {
      ...getSlugUpdateMock(step.id, 'duplicate-slug'),
      error: new Error('duplicate')
    }

    render(
      <MockedProvider mocks={[errorMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: { id: 'journeyId' } as any }}>
            <EditorProvider
              initialState={{
                steps: [step],
                selectedStep: step,
                activeContent: ActiveContent.Canvas
              }}
            >
              <CardSlugEdit />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByDisplayValue('valid-slug') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'duplicate-slug' } })
    fireEvent.blur(input)

    await waitFor(() =>
      expect(
        screen.getByText(
          'This link name is already in use. Please choose a different one.'
        )
      ).toBeInTheDocument()
    )
  })

  it('should undo slug update', async () => {
    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'old-slug',
      children: []
    }

    const updateMock = getSlugUpdateMock(step.id, 'new-slug')
    const undoMock = getSlugUpdateMock(step.id, 'old-slug')

    render(
      <MockedProvider mocks={[updateMock, undoMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: { id: 'journeyId' } as any }}>
            <EditorProvider
              initialState={{
                steps: [step],
                selectedStep: step,
                activeContent: ActiveContent.Canvas
              }}
            >
              <CommandUndoItem variant="button" />
              <CardSlugEdit />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByDisplayValue('old-slug') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'new-slug' } })
    fireEvent.blur(input)

    await waitFor(() =>
      expect(updateMock.result as jest.Mock).toHaveBeenCalled()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(undoMock.result as jest.Mock).toHaveBeenCalled())
  })
})
