/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CardPollDelete
// ====================================================

export interface CardPollDelete_bodyDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_bodyDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardPollDelete_bodyDelete_deletedBlocks[];
}

export interface CardPollDelete_radioOption4Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioOption4Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardPollDelete_radioOption4Delete_deletedBlocks[];
}

export interface CardPollDelete_radioOption3Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioOption3Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardPollDelete_radioOption3Delete_deletedBlocks[];
}

export interface CardPollDelete_radioOption2Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioOption2Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardPollDelete_radioOption2Delete_deletedBlocks[];
}

export interface CardPollDelete_radioOption1Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioOption1Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardPollDelete_radioOption1Delete_deletedBlocks[];
}

export interface CardPollDelete_radioQuestionDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_radioQuestionDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardPollDelete_radioQuestionDelete_deletedBlocks[];
}

export interface CardPollDelete_titleDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_titleDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardPollDelete_titleDelete_deletedBlocks[];
}

export interface CardPollDelete_subtitleDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_subtitleDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardPollDelete_subtitleDelete_deletedBlocks[];
}

export interface CardPollDelete_imageDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardPollDelete_imageDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardPollDelete_imageDelete_deletedBlocks[];
}

export interface CardPollDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  bodyDelete: CardPollDelete_bodyDelete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  radioOption4Delete: CardPollDelete_radioOption4Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  radioOption3Delete: CardPollDelete_radioOption3Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  radioOption2Delete: CardPollDelete_radioOption2Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  radioOption1Delete: CardPollDelete_radioOption1Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  radioQuestionDelete: CardPollDelete_radioQuestionDelete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  titleDelete: CardPollDelete_titleDelete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  subtitleDelete: CardPollDelete_subtitleDelete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  imageDelete: CardPollDelete_imageDelete;
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
