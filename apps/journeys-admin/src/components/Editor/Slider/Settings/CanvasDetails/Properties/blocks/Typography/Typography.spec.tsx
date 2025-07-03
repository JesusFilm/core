import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

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
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    },
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
    expect(getByRole('button', { name: 'Color #fefefe' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Alignment Left' })
    ).toBeInTheDocument()
  })

  it('shows filled attributes with enum colors', () => {
    const block: TreeBlock<TypographyBlock> = {
      id: 'typography1.id',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: TypographyAlign.center,
      color: TypographyColor.secondary,
      content: 'Typography',
      variant: TypographyVariant.h2,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      },
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

  it('shows filled attributes with hex color from settings', () => {
    const block: TreeBlock<TypographyBlock> = {
      id: 'typography1.id',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: TypographyAlign.center,
      color: null,
      content: 'Typography',
      variant: TypographyVariant.h2,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: '#C52D3A'
      },
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
    expect(getByRole('button', { name: 'Color #c52d3a' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Alignment Center' })
    ).toBeInTheDocument()
  })

  it('shows disabled color for empty content', () => {
    const block: TreeBlock<TypographyBlock> = {
      id: 'typography1.id',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: null,
      color: null,
      content: '',
      variant: null,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: '#C52D3A'
      },
      children: []
    }
    const { getByRole } = render(
      <MockedProvider>
        <Typography {...block} />
      </MockedProvider>
    )
    expect(
      getByRole('button', { name: 'Text Variant Body 2' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color #c52d3a' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Alignment Left' })
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
})
