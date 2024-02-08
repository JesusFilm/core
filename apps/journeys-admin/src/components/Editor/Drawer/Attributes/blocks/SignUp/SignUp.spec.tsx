import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorProvider,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourney'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../ThemeProvider'
import { Drawer } from '../../../../Drawer'
import { Action } from '../../Action'

import { SignUp } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('SignUp Attributes', () => {
  const block: TreeBlock<SignUpBlock> = {
    id: 'signup.id',
    __typename: 'SignUpBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    submitLabel: 'Sign Up',
    action: {
      __typename: 'LinkAction',
      parentBlockId: 'signup.id',
      gtmEventName: 'signup',
      url: 'https://www.google.com'
    },
    submitIconId: 'icon',
    children: [
      {
        id: 'icon',
        __typename: 'IconBlock',
        parentBlockId: 'button',
        parentOrder: 0,
        iconName: IconName.ArrowForwardRounded,
        iconColor: IconColor.action,
        iconSize: IconSize.lg,
        children: []
      }
    ]
  }
  const state: EditorState = {
    steps: [],
    drawerMobileOpen: false,
    activeTab: ActiveTab.Journey,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch: jest.fn()
    })
  })

  it('shows default attributes', () => {
    const emptyBlock: TreeBlock<SignUpBlock> = {
      id: 'signup.id',
      __typename: 'SignUpBlock',
      parentBlockId: null,
      parentOrder: 0,
      submitLabel: null,
      action: null,
      submitIconId: null,
      children: []
    }

    const { getByRole } = render(<SignUp {...emptyBlock} />)
    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon None' })
    ).toBeInTheDocument()
  })

  it('shows filled attributes', () => {
    const { getByRole } = render(<SignUp {...block} />)
    expect(
      getByRole('button', { name: 'Action URL/Website' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon Arrow Right' })
    ).toBeInTheDocument()
  })

  it('clicking icon properties button should open icon editing drawer', () => {
    const { getByRole, getAllByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <SignUp {...block} />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Button Icon Arrow Right' }))
    expect(getAllByText('Button Icon')).toHaveLength(2)
  })

  it('action property button should open action edit drawer', async () => {
    const { getByRole, getByTestId, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <SignUp {...block} />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Action URL/Website' }))
    expect(getByTestId('drawer-title')).toBeInTheDocument()
    expect(getByText('Form Submission')).toBeInTheDocument()
  })

  it('should open property drawr for variant', () => {
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
    render(<SignUp {...block} />)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedAttributeIdAction',
      id: 'signup.id-signup-action'
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Form Submission',
      children: <Action />
    })
  })
})
