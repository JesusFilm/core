import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_RadioQuestionBlock as RadioQuestionBlock } from '../../../../../../../../../__generated__/BlockFields'

import { RadioQuestion } from '.'

describe('RadioQuestion Properties', () => {
  const block: TreeBlock<RadioQuestionBlock> = {
    id: 'radioQuestion1.id',
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    gridView: false,
    children: []
  }

  it('should render', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <RadioQuestion {...block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      screen.getByText('To edit poll content, choose each option individually.')
    ).toBeInTheDocument()
  })
})
