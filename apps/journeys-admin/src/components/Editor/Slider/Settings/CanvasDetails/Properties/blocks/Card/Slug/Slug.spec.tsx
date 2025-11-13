import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../../../../__generated__/GetJourney'
import {
  StepBlockSlugUpdate,
  StepBlockSlugUpdateVariables
} from '../../../../../../../../../../__generated__/StepBlockSlugUpdate'
import { getCustomDomainMock } from '../../../../../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { STEP_BLOCK_SLUG_UPDATE } from './Slug'

import { Slug } from '.'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('Slug', () => {
  function getSlugUpdateMock(
    id: string,
    slug: string
  ): MockedResponse<StepBlockSlugUpdate, StepBlockSlugUpdateVariables> {
    return {
      request: {
        query: STEP_BLOCK_SLUG_UPDATE,
        variables: {
          id,
          input: {
            slug
          }
        }
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
  const defaultSelectedStep = {
    __typename: 'StepBlock',
    id: 'stepId',
    slug: 'slug'
  } as unknown as TreeBlock<StepBlock>
  const initialState = {
    selectedStep: defaultSelectedStep
  } as unknown as EditorState

  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
  })

  it('should prefill step slug', () => {
    render(
      <MockedProvider>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider>
              <EditorProvider initialState={initialState}>
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox')).toHaveValue('slug')
  })

  it('should prefill step id if no slug', () => {
    const selectedStep = {
      ...defaultSelectedStep,
      slug: null
    } as unknown as TreeBlock<StepBlock>
    const initialState = {
      selectedStep
    } as unknown as EditorState

    render(
      <MockedProvider>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider>
              <EditorProvider initialState={initialState}>
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox')).toHaveValue('stepId')
  })

  it('should update slug', async () => {
    const updateSlugMock = getSlugUpdateMock(defaultSelectedStep.id, 'new-slug')

    render(
      <MockedProvider mocks={[updateSlugMock]}>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider>
              <EditorProvider initialState={initialState}>
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox')

    fireEvent.change(field, {
      target: { value: 'new-slug' }
    })
    fireEvent.blur(field)

    await waitFor(() => expect(updateSlugMock.result).toHaveBeenCalled())
  })

  it('should reset slug to step id', async () => {
    const resetSlugMock = getSlugUpdateMock(
      defaultSelectedStep.id,
      defaultSelectedStep.id
    )

    render(
      <MockedProvider mocks={[resetSlugMock]}>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider>
              <EditorProvider initialState={initialState}>
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox')

    fireEvent.change(field, {
      target: { value: '' }
    })
    fireEvent.blur(field)

    await waitFor(() => expect(resetSlugMock.result).toHaveBeenCalled())
  })

  it('should undo slug update', async () => {
    const slugUpdateMock = getSlugUpdateMock(defaultSelectedStep.id, 'new-slug')
    const undoSlugUpdateMock = getSlugUpdateMock(defaultSelectedStep.id, 'slug')

    render(
      <MockedProvider mocks={[slugUpdateMock, undoSlugUpdateMock]}>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider>
              <EditorProvider initialState={initialState}>
                <CommandUndoItem variant="button" />
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox')

    fireEvent.change(field, {
      target: { value: 'new-slug' }
    })
    fireEvent.blur(field)

    await waitFor(() => expect(slugUpdateMock.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoSlugUpdateMock.result).toHaveBeenCalled())
  })

  it('should show error snackbar', async () => {
    const slugErrorUpdateMock = {
      ...getSlugUpdateMock(defaultSelectedStep.id, 'new-slug'),
      error: new Error('error')
    }

    render(
      <MockedProvider mocks={[slugErrorUpdateMock]}>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider>
              <EditorProvider initialState={initialState}>
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox')

    fireEvent.change(field, {
      target: { value: 'new-slug' }
    })
    fireEvent.blur(field)

    await waitFor(() =>
      expect(
        screen.getByText('Error updating, make sure slug is unique')
      ).toBeInTheDocument()
    )
  })

  it('should copy the url to the step for local', async () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const journey = {
      id: 'journeyId',
      slug: 'journey-slug'
    } as unknown as Journey

    render(
      <MockedProvider>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <EditorProvider initialState={initialState}>
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy Card URL' }))
    const cardUrl = `${process.env.NEXT_PUBLIC_JOURNEYS_URL as string}/${
      journey.slug
    }/${defaultSelectedStep.slug}`

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(cardUrl)
    await waitFor(() =>
      expect(
        screen.getByText(`Copied to clipboard: ${cardUrl}`)
      ).toBeInTheDocument()
    )
  })

  it('should copy the url to the step in prod', async () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: undefined
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const journey = {
      id: 'journeyId',
      slug: 'journey-slug'
    } as unknown as Journey

    render(
      <MockedProvider>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <EditorProvider initialState={initialState}>
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy Card URL' }))
    const cardUrl = `https://your.nextstep.is/${journey.slug}/${defaultSelectedStep.slug}`

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(cardUrl)
    await waitFor(() =>
      expect(
        screen.getByText(`Copied to clipboard: ${cardUrl}`)
      ).toBeInTheDocument()
    )
  })

  it('should copy the url to the step for custom domain', async () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: undefined
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const result = jest.fn().mockReturnValue(getCustomDomainMock.result)

    const journey = {
      id: 'journeyId',
      slug: 'journey-slug',
      team: { id: 'teamId' }
    } as unknown as Journey

    render(
      <MockedProvider mocks={[{ ...getCustomDomainMock, result }]}>
        <CommandProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <EditorProvider initialState={initialState}>
                <Slug />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </CommandProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Copy Card URL' }))
    const cardUrl = `https://example.com/${journey.slug}/${defaultSelectedStep.slug}`

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(cardUrl)
    await waitFor(() =>
      expect(
        screen.getByText(`Copied to clipboard: ${cardUrl}`)
      ).toBeInTheDocument()
    )
  })
})
