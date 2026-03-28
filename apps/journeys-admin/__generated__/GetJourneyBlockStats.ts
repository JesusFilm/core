/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyBlockStats
// ====================================================

export interface GetJourneyBlockStats_blocks_ButtonBlock {
  __typename: 'ButtonBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_CardBlock {
  __typename: 'CardBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_ImageBlock {
  __typename: 'ImageBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_VideoBlock {
  __typename: 'VideoBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_TypographyBlock {
  __typename: 'TypographyBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_RadioQuestionBlock {
  __typename: 'RadioQuestionBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_RadioOptionBlock {
  __typename: 'RadioOptionBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_TextResponseBlock {
  __typename: 'TextResponseBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_SignUpBlock {
  __typename: 'SignUpBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_SpacerBlock {
  __typename: 'SpacerBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_StepBlock {
  __typename: 'StepBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_VideoTriggerBlock {
  __typename: 'VideoTriggerBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_GridContainerBlock {
  __typename: 'GridContainerBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_GridItemBlock {
  __typename: 'GridItemBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_MultiselectBlock {
  __typename: 'MultiselectBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_MultiselectOptionBlock {
  __typename: 'MultiselectOptionBlock'
  id: string
}

export interface GetJourneyBlockStats_blocks_IconBlock {
  __typename: 'IconBlock'
  id: string
}

export type GetJourneyBlockStats_blocks =
  | GetJourneyBlockStats_blocks_ButtonBlock
  | GetJourneyBlockStats_blocks_CardBlock
  | GetJourneyBlockStats_blocks_ImageBlock
  | GetJourneyBlockStats_blocks_VideoBlock
  | GetJourneyBlockStats_blocks_TypographyBlock
  | GetJourneyBlockStats_blocks_RadioQuestionBlock
  | GetJourneyBlockStats_blocks_RadioOptionBlock
  | GetJourneyBlockStats_blocks_TextResponseBlock
  | GetJourneyBlockStats_blocks_SignUpBlock
  | GetJourneyBlockStats_blocks_SpacerBlock
  | GetJourneyBlockStats_blocks_StepBlock
  | GetJourneyBlockStats_blocks_VideoTriggerBlock
  | GetJourneyBlockStats_blocks_GridContainerBlock
  | GetJourneyBlockStats_blocks_GridItemBlock
  | GetJourneyBlockStats_blocks_MultiselectBlock
  | GetJourneyBlockStats_blocks_MultiselectOptionBlock
  | GetJourneyBlockStats_blocks_IconBlock

export interface GetJourneyBlockStats {
  blocks: GetJourneyBlockStats_blocks[]
}

export interface GetJourneyBlockStatsVariables {
  journeyId: string
}
