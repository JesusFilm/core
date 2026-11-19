import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock,
  BlockFields_CardBlock,
  BlockFields_RadioOptionBlock,
  BlockFields_StepBlock,
  BlockFields_VideoBlock
} from '../../../../__generated__/BlockFields'
import {
  BlockEventLabel,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'

export const trackedButton: TreeBlock<BlockFields_ButtonBlock> = {
  __typename: 'ButtonBlock',
  id: 'button.id',
  parentBlockId: 'card.id',
  parentOrder: 0,
  label: 'RSVP',
  buttonVariant: null,
  buttonColor: null,
  size: null,
  startIconId: null,
  endIconId: null,
  submitEnabled: false,
  action: null,
  settings: null,
  eventLabel: BlockEventLabel.rsvp,
  children: []
}

export const trackedOption: TreeBlock<BlockFields_RadioOptionBlock> = {
  __typename: 'RadioOptionBlock',
  id: 'option.id',
  parentBlockId: 'question.id',
  parentOrder: 0,
  label: 'Custom option',
  action: null,
  pollOptionImageBlockId: null,
  eventLabel: BlockEventLabel.custom1,
  children: []
}

export const trackedVideo: TreeBlock<BlockFields_VideoBlock> = {
  __typename: 'VideoBlock',
  id: 'video.id',
  parentBlockId: 'card.id',
  parentOrder: 1,
  muted: null,
  autoplay: null,
  startAt: null,
  endAt: null,
  posterBlockId: null,
  fullsize: null,
  videoId: null,
  videoVariantLanguageId: null,
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  image: null,
  duration: null,
  objectFit: null,
  showGeneratedSubtitles: null,
  subtitleLanguage: null,
  mediaVideo: null,
  action: null,
  eventLabel: null,
  endEventLabel: BlockEventLabel.specialVideoComplete,
  customizable: null,
  notes: null,
  children: []
}

export const untrackedButton: typeof trackedButton = {
  ...trackedButton,
  id: 'untrackedButton.id',
  parentOrder: 2,
  eventLabel: null
}

export const untrackedVideo: typeof trackedVideo = {
  ...trackedVideo,
  id: 'untrackedVideo.id',
  parentOrder: 3,
  endEventLabel: null
}

export const trackedCard: TreeBlock<BlockFields_CardBlock> = {
  __typename: 'CardBlock',
  id: 'card.id',
  parentBlockId: 'stepId',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  eventLabel: null,
  showAssistant: null,
  expandChatByDefault: null,
  children: [trackedButton, trackedVideo, untrackedButton, untrackedVideo]
}

export const trackedStep: TreeBlock<BlockFields_StepBlock> = {
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [trackedCard]
}

export const otherStep: typeof trackedStep = {
  ...trackedStep,
  id: 'otherStep.id',
  parentOrder: 1,
  children: []
}
