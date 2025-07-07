import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider/EditorProvider'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'

import { Typography } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Typography properties', () => {
  const block: TreeBlock<TypographyBlock> = {
    id: 'typography1.id',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    parentOrder: 0,
    align: null,
    color: null,
    content: 'Typography',
    variant: null,
    children: []
  }

  it('shows default attributes', () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <Typography {...block} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(
      getByRole('button', { name: 'Text Variant Body 2' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Primary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Alignment Left' })
    ).toBeInTheDocument()
  })

  it('shows filled attributes', () => {
    const block: TreeBlock<TypographyBlock> = {
      id: 'typography1.id',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: TypographyAlign.center,
      color: TypographyColor.secondary,
      content: 'Typography',
      variant: TypographyVariant.h2,
      children: []
    }
    const { getByRole } = render(
      <MockedProvider>
        <Typography {...block} />
      </MockedProvider>
    )
    expect(
      getByRole('button', { name: 'Text Variant Header 2' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Secondary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Alignment Center' })
    ).toBeInTheDocument()
  })

  it('variant accordion should be open', () => {
    const { getByText } = render(
      <MockedProvider>
        <EditorProvider>
          <Typography {...block} />
          <TestEditorState />
        </EditorProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: typography1.id-typography-variant')
    ).toBeInTheDocument()
  })

  it('should open theme builder dialog', async () => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)

    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <Typography {...block} />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Edit Font Theme' }))
    await waitFor(() => {
      expect(getByRole('dialog', { name: 'Select Fonts' })).toBeInTheDocument()
    })
  })
})
