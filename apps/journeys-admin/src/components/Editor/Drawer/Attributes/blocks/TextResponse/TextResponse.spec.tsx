import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../__generated__/GetJourney'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../ThemeProvider'
import { Drawer } from '../../../../Drawer'

import { TextResponse } from './TextResponse'

describe('TextResponse', () => {
  const defaultBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    label: 'default label',
    hint: null,
    submitLabel: 'Submit',
    minRows: null,
    submitIconId: null,
    action: null,
    children: []
  }

  const completeBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    label: 'complete label',
    hint: 'hint text',
    minRows: 2,
    submitLabel: 'Submit',
    submitIconId: 'icon.id',
    action: {
      __typename: 'LinkAction',
      parentBlockId: 'responseAction.id',
      gtmEventName: 'responseAction',
      url: 'https://www.google.com'
    },
    children: [
      {
        id: 'icon.id',
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

  it('should show default attributes', () => {
    const { getByRole } = render(<TextResponse {...defaultBlock} />)

    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon None' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Feedback default label' })
    ).toBeInTheDocument()
  })

  it('should show filled attributes', () => {
    const { getByRole } = render(<TextResponse {...completeBlock} />)

    expect(
      getByRole('button', { name: 'Action URL/Website' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon Arrow Right' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Feedback complete label' })
    ).toBeInTheDocument()
  })

  it('should open feedback edit', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <TextResponse {...completeBlock} />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Feedback complete label' }))
    expect(getByTestId('drawer-title')).toHaveTextContent('Feedback Properties')
  })

  it('should open button action edit', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <TextResponse {...completeBlock} />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Action URL/Website' }))
    expect(getByTestId('drawer-title')).toHaveTextContent('Action')
  })

  it('should open button icon edit', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <TextResponse {...completeBlock} />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Button Icon Arrow Right' }))
    expect(getByTestId('drawer-title')).toHaveTextContent('Button Icon')
  })
})
