import { fireEvent, render, screen } from '@testing-library/react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import { TestEditorState } from '../../../../../../../libs/TestEditorState'

import { GoalsListItem } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => false)
}))

describe('GoalListItem', () => {
  it('should render chat goal', () => {
    const goal = {
      url: 'https://chatUrl.com',
      count: 1,
      goalType: GoalType.Chat
    }

    render(
      <Table>
        <TableBody>
          <GoalsListItem goal={goal} />
        </TableBody>
      </Table>
    )

    expect(screen.getByText('Start a Conversation')).toBeInTheDocument()
    expect(screen.getAllByTestId('MessageChat1Icon')).toHaveLength(2)
    expect(screen.getByText(goal?.url)).toBeInTheDocument()
    expect(screen.getByText('Appears on card')).toBeInTheDocument()
  })

  it('should render bible goal', () => {
    const goal = {
      url: 'https://bibleUrl.com',
      count: 1,
      goalType: GoalType.Bible
    }

    render(
      <Table>
        <TableBody>
          <GoalsListItem goal={goal} />
        </TableBody>
      </Table>
    )

    expect(screen.getByText('Link to Bible')).toBeInTheDocument()
    expect(screen.getAllByTestId('BibleIcon')).toHaveLength(2)
    expect(screen.getByText(goal?.url)).toBeInTheDocument()
    expect(screen.getByText('Appears on card')).toBeInTheDocument()
  })

  it('should render website goal', () => {
    const goal = {
      url: 'https://websiteUrl.com',
      count: 1,
      goalType: GoalType.Website
    }

    render(
      <Table>
        <TableBody>
          <GoalsListItem goal={goal} />
        </TableBody>
      </Table>
    )

    expect(screen.getByText('Visit a Website')).toBeInTheDocument()
    expect(screen.getAllByTestId('LinkAngledIcon')).toHaveLength(2)
    expect(screen.getByText(goal?.url)).toBeInTheDocument()
    expect(screen.getByText('Appears on card')).toBeInTheDocument()
  })

  it('should handle click', () => {
    const state: EditorState = {
      activeSlide: ActiveSlide.JourneyFlow,
      activeContent: ActiveContent.Goals,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
      selectedGoalUrl: 'initialUrl'
    }
    const goal = {
      url: 'https://websiteUrl.com',
      count: 1,
      goalType: GoalType.Website
    }

    render(
      <EditorProvider initialState={state}>
        <TestEditorState />
        <Table>
          <TableBody>
            <GoalsListItem goal={goal} />
          </TableBody>
        </Table>
      </EditorProvider>
    )

    expect(screen.getByText('selectedGoalUrl: initialUrl')).toBeInTheDocument()
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('Edit2Icon'))

    expect(
      screen.getByText('selectedGoalUrl: https://websiteUrl.com')
    ).toBeInTheDocument()
    expect(screen.getByText('activeSlide: 2')).toBeInTheDocument()
  })
})
