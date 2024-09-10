/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetFormBlock
// ====================================================

export interface GetFormBlock_block_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface GetFormBlock_block_FormBlock_projects {
  __typename: "FormiumProject";
  /**
   * The projectId of the project
   */
  id: string;
  /**
   * The name of the project
   */
  name: string;
}

export interface GetFormBlock_block_FormBlock_forms {
  __typename: "FormiumForm";
  /**
   * The formSlug of the form
   */
  slug: string;
  /**
   * The name of the form
   */
  name: string;
}

export interface GetFormBlock_block_FormBlock {
  __typename: "FormBlock";
  id: string;
  projects: GetFormBlock_block_FormBlock_projects[];
  projectId: string | null;
  formSlug: string | null;
  forms: GetFormBlock_block_FormBlock_forms[];
  apiTokenExists: boolean;
}

export type GetFormBlock_block = GetFormBlock_block_ImageBlock | GetFormBlock_block_FormBlock;

export interface GetFormBlock {
  block: GetFormBlock_block;
}

export interface GetFormBlockVariables {
  id: string;
}
