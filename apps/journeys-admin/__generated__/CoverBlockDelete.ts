/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CoverBlockDelete
// ====================================================

export interface CoverBlockDelete_blockDelete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CoverBlockDelete_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
}

export interface CoverBlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: CoverBlockDelete_blockDelete[];
  cardBlockUpdate: CoverBlockDelete_cardBlockUpdate;
}

export interface CoverBlockDeleteVariables {
  id: string;
  cardBlockId: string;
}
