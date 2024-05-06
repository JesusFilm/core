import { filterActionBlocks } from './filterActionBlocks'
import { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { RadioQuestionFields } from '../../../../../../../__generated__/RadioQuestionFields'
import { RadioOptionFields } from '../../../../../../../__generated__/RadioOptionFields'

const button: TreeBlock<ButtonBlock> = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  parentOrder: 0,
  label: 'This is a button',
  buttonVariant: null,
  buttonColor: null,
  size: null,
  startIconId: null,
  endIconId: null,
  action: null,
  children: []
}

const RadioOption1: TreeBlock<RadioOptionFields> = {
  __typename: 'RadioOptionBlock',
  id: 'RadioOption1',
  label: 'Option 1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  action: null,
  children: []
}

const RadioOption2: TreeBlock<RadioOptionFields> = {
  __typename: 'RadioOptionBlock',
  id: 'RadioOption2',
  label: 'Option 2',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 1,
  action: null,
  children: []
}

const radioQuestionBlock: TreeBlock<RadioQuestionFields> = {
  __typename: 'RadioQuestionBlock',
  id: 'RadioQuestion1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  children: [RadioOption1, RadioOption2]
}

const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: 'card1.id',
  parentOrder: 3,
  src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
  alt: 'public',
  width: 1920,
  height: 1080,
  blurhash: '',
  children: []
}

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: image.id,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  children: [image, button, radioQuestionBlock]
}

const step: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: [card]
}

describe('filterActionBlocks', () => {
  it('should filter action blocks', () => {
    const filteredActionBlocks = filterActionBlocks(step)
    expect(filteredActionBlocks).toHaveLength(3)
    expect(filteredActionBlocks).toContain(button)
    expect(filteredActionBlocks).toContain(RadioOption1)
    expect(filteredActionBlocks).toContain(RadioOption2)

    // should not contain RadioQuestionBlock or image
    expect(filteredActionBlocks).not.toContain(radioQuestionBlock)
    expect(filteredActionBlocks).not.toContain(image)
  })
})
