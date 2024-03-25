import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveContent,
  ActiveFab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  GetFormBlock,
  GetFormBlockVariables
} from '../../../../../../../../../../__generated__/GetFormBlock'

import { Credentials, GET_FORM_BLOCK } from './Credentials'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

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
  steps: [],
  selectedBlock: block,
  activeFab: ActiveFab.Add,
  activeSlide: ActiveSlide.JourneyFlow,
  activeContent: ActiveContent.Canvas,
  activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
}

const getFormBlockMock: MockedResponse<GetFormBlock, GetFormBlockVariables> = {
  request: {
    query: GET_FORM_BLOCK,
    variables: {
      id: block.id
    }
  },
  result: {
    data: {
      block: {
        id: 'formBlock.id',
        __typename: 'FormBlock',
        projects: [
          {
            __typename: 'FormiumProject',
            id: 'projectId',
            name: 'project name'
          }
        ],
        projectId: 'projectId',
        formSlug: 'FilledFormSlug',
        forms: [
          {
            __typename: 'FormiumForm',
            slug: 'FilledFormSlug',
            name: 'Filled Form Name'
          }
        ],
        apiTokenExists: true
      }
    }
  }
}

describe('Credentials', () => {
  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch: jest.fn()
    })
  })

  it('shows credentials', async () => {
    const result = jest.fn(() => ({
      ...getFormBlockMock.result
    }))

    const { getByRole, getByLabelText } = render(
      <MockedProvider mocks={[{ ...getFormBlockMock, result }]}>
        <SnackbarProvider>
          <Credentials />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(getByLabelText('Api Token')).toBeInTheDocument()
    expect(getByRole('button', { name: 'project name' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Filled Form Name' })
    ).toBeInTheDocument()
  })

  it('shows info message', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[getFormBlockMock]}>
        <SnackbarProvider>
          <Credentials />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByText('Click here for formium docs on finding your api token')
      ).toHaveAttribute(
        'href',
        'https://formium.io/docs/react/frameworks/next-js#add-your-credentials'
      )
    )
  })
})
