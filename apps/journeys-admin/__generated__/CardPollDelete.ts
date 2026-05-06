/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CardPollDelete
// ====================================================

export interface CardPollDelete_bodyDelete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioOption4Delete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioOption3Delete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioOption2Delete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioOption1Delete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioQuestionDelete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_titleDelete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_subtitleDelete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_imageDelete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete {
  bodyDelete: CardPollDelete_bodyDelete[];
  radioOption4Delete: CardPollDelete_radioOption4Delete[];
  radioOption3Delete: CardPollDelete_radioOption3Delete[];
  radioOption2Delete: CardPollDelete_radioOption2Delete[];
  radioOption1Delete: CardPollDelete_radioOption1Delete[];
  radioQuestionDelete: CardPollDelete_radioQuestionDelete[];
  titleDelete: CardPollDelete_titleDelete[];
  subtitleDelete: CardPollDelete_subtitleDelete[];
  imageDelete: CardPollDelete_imageDelete[];
}

export interface CardPollDeleteVariables {
  imageId: string;
  subtitleId: string;
  titleId: string;
  radioQuestionId: string;
  radioOption1Id: string;
  radioOption2Id: string;
  radioOption3Id: string;
  radioOption4Id: string;
  bodyId: string;
}
