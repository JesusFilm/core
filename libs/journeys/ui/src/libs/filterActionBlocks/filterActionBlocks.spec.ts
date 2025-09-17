import { RadioOptionFields } from '../../components/RadioOption/__generated__/RadioOptionFields'
import { RadioQuestionFields } from '../../components/RadioQuestion/__generated__/RadioQuestionFields'
import { TreeBlock } from '../block'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_ButtonBlock_action as ButtonBlockAction,
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_StepBlock as StepBlock
} from '../block/__generated__/BlockFields'

import { filterActionBlocks } from './filterActionBlocks'

const buttonAction: ButtonBlockAction = {
  __typename: 'LinkAction',
  parentBlockId: 'button',
  gtmEventName: 'click',
  url: 'https://m.me/some-user',
  customizable: false,
  parentStepId: null
}

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
  submitEnabled: null,
  action: buttonAction,
  children: [],
  settings: null
}

const RadioOption1: TreeBlock<RadioOptionFields> = {
  __typename: 'RadioOptionBlock',
  id: 'RadioOption1',
  label: 'Option 1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  action: null,
  pollOptionImageBlockId: null,
  children: []
}

const RadioOption2: TreeBlock<RadioOptionFields> = {
  __typename: 'RadioOptionBlock',
  id: 'RadioOption2',
  label: 'Option 2',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 1,
  action: null,
  pollOptionImageBlockId: null,
  children: []
}

const radioQuestionBlock: TreeBlock<RadioQuestionFields> = {
  __typename: 'RadioQuestionBlock',
  id: 'RadioQuestion1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  gridView: false,
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
  scale: null,
  focalLeft: 50,
  focalTop: 50,
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
  backdropBlur: null,
  children: [image, button, radioQuestionBlock]
}

const step: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [card]
}

describe('filterActionBlocks', () => {
  it('should filter action blocks', () => {
    const filteredActionBlocks = filterActionBlocks(step)
    expect(filteredActionBlocks).toEqual([button, RadioOption1, RadioOption2])
  })

  it('should filter out certain blocks', () => {
    const filteredActionBlocks = filterActionBlocks(step)
    expect(filteredActionBlocks).not.toContain([radioQuestionBlock, image])
  })
})
