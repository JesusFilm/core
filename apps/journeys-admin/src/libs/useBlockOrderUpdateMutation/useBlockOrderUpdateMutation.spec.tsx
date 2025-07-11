import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../__generated__/BlockFields'

import { getNewParentOrder } from '.'

describe('getNewParentOrder', () => {
  const typographyBlock = {
    id: 'typography1.id',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    },
    children: []
  } as unknown as TreeBlock<TypographyBlock>
  const imageBlock = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: 'card1.id',
    parentOrder: 1,
    children: []
  } as unknown as TreeBlock<ImageBlock>
  const backgroundBlock = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: 'card1.id',
    parentOrder: null,
    children: []
  } as unknown as TreeBlock<ImageBlock>
  const cardBlock = {
    id: 'card1.id',
    __typename: 'CardBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    children: [typographyBlock, imageBlock, backgroundBlock]
  } as unknown as TreeBlock<CardBlock>
  const stepBlock = {
    id: 'step0.id',
    __typename: 'StepBlock',
    name: 'Step 0',
    blocks: [],
    children: [],
    parentOrder: 0
  } as unknown as TreeBlock<StepBlock>
  const selectedStep = {
    id: 'step1.id',
    __typename: 'StepBlock',
    name: 'Step 1',
    blocks: [],
    children: [cardBlock],
    parentOrder: 1
  } as unknown as TreeBlock<StepBlock>

  it('should return the new parent order when moving to front', () => {
    expect(getNewParentOrder([stepBlock, selectedStep], imageBlock, 0)).toEqual(
      [
        { id: 'image1.id', parentOrder: 0, __typename: 'ImageBlock' },
        { id: 'typography1.id', parentOrder: 1, __typename: 'TypographyBlock' }
      ]
    )
  })

  it('should return the new parent order when moving to end', () => {
    expect(getNewParentOrder([stepBlock, selectedStep], imageBlock, 1)).toEqual(
      [
        { id: 'typography1.id', parentOrder: 0, __typename: 'TypographyBlock' },
        { id: 'image1.id', parentOrder: 1, __typename: 'ImageBlock' }
      ]
    )
  })

  it('should return sorted steps array when step is selectedBlock', () => {
    expect(
      getNewParentOrder([stepBlock, selectedStep], selectedStep, 0)
    ).toEqual([
      { id: 'step1.id', parentOrder: 0, __typename: 'StepBlock' },
      { id: 'step0.id', parentOrder: 1, __typename: 'StepBlock' }
    ])
  })

  it('should return empty array when block is not child of selected step', () => {
    expect(
      getNewParentOrder([{ ...selectedStep, children: [] }], imageBlock, 1)
    ).toEqual([])
  })
})
