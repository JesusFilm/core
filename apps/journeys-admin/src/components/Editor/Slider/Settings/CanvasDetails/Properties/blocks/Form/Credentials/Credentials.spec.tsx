import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { GetFormBlock } from '../../../../../../../../../../__generated__/GetFormBlock'

import { Credentials, GET_FORM_BLOCK } from './Credentials'

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
  activeSlide: ActiveSlide.Drawer,
  activeContent: ActiveContent.Canvas,
  activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
}

const mockGetFormBlock: MockedResponse<GetFormBlock> = {
  request: {
    query: GET_FORM_BLOCK,
    variables: { id: 'formBlock.id' }
  },
  result: {
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
  }
}

describe('Credentials', () => {
  it('shows credentials', async () => {
    const result = jest.fn(() => ({
      ...mockGetFormBlock.result
    }))
    render(
      <MockedProvider mocks={[{ ...mockGetFormBlock, result }]}>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <Credentials />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(screen.getByLabelText('Api Token')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'projectName' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'formName' })).toBeInTheDocument()
  })

  it('shows info message', async () => {
    render(
      <MockedProvider mocks={[mockGetFormBlock]}>
        <EditorProvider initialState={state}>
          <SnackbarProvider>
            <Credentials />
          </SnackbarProvider>
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getByText(
          'Click here for formium docs on finding your api token'
        )
      ).toHaveAttribute(
        'href',
        'https://formium.io/docs/react/frameworks/next-js#add-your-credentials'
      )
    )
  })
})
