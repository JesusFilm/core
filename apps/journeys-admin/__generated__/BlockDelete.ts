/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDelete
// ====================================================

export interface BlockDelete_blockDelete {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDelete_blockDelete[];
}

export interface BlockDeleteVariables {
  id: string;
  journeyId: string;
  parentBlockId?: string | null;
}
