import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { GetFormBlock } from '../../../../../../../../../../__generated__/GetFormBlock'

import { Credentials, GET_FORM_BLOCK } from './Credentials'

describe('Credentials', () => {
  it('shows credentials', async () => {
    const block: TreeBlock<FormBlock> = {
      id: 'formBlock.id',
      __typename: 'FormBlock',
      parentBlockId: 'step0.id',
      parentOrder: 0,
      form: null,
      action: null,
      children: []
    }

    const state: EditorState = {
      selectedBlock: block,
      activeFab: ActiveFab.Add,
      activeSlide: ActiveSlide.Drawer,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
    }

    const mockGetFormBlock: MockedResponse<GetFormBlock> = {
      request: {
        query: GET_FORM_BLOCK,
        variables: { id: 'formBlock.id' }
      },
      result: jest.fn(() => ({
        data: {
          block: {
            __typename: 'FormBlock',
            id: 'formBlock.id',
            projectId: 'projectId',
            formSlug: 'formSlug',
            projects: [
              {
                __typename: 'FormiumProject',
                id: 'projectId',
                name: 'projectName'
              }
            ],
            forms: [
              {
                __typename: 'FormiumForm',
                slug: 'formSlug',
                name: 'formName'
              }
            ],
            apiTokenExists: true
          }
        }
      }))
    }

    render(
      <MockedProvider mocks={[mockGetFormBlock]}>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <Credentials />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(mockGetFormBlock.result).toHaveBeenCalled())

    expect(screen.getByLabelText('Api Token')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'projectName' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'formName' })).toBeInTheDocument()
  })

  it('shows info message', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <Credentials />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      screen.getByText('Click here for formium docs on finding your api token')
    ).toHaveAttribute(
      'href',
      'https://formium.io/docs/react/frameworks/next-js#add-your-credentials'
    )
  })
})
