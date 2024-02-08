import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_FormBlock as FormBlock } from '../../../../../../../../__generated__/GetJourney'

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
  drawerMobileOpen: false,
  activeTab: ActiveTab.Journey,
  activeFab: ActiveFab.Add,
  journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          ]
        },
        apiTokenExists: true
      }
    }))

    const { getByRole, getByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_FORM_BLOCK,
              variables: { id: 'formBlock.id' }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <Credentials />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(getByLabelText('Api Token')).toBeInTheDocument()
    expect(getByRole('button', { name: 'projectName' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'formName' })).toBeInTheDocument()
  })

  it('shows info message', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Credentials />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      getByText('Click here for formium docs on finding your api token')
    ).toHaveAttribute(
      'href',
      'https://formium.io/docs/react/frameworks/next-js#add-your-credentials'
    )
  })
})
