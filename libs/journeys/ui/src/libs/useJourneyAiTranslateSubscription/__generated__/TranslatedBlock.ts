/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: TranslatedBlock
// ====================================================

export interface TranslatedBlock_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface TranslatedBlock_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  content: string;
}

export interface TranslatedBlock_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  label: string;
}

export interface TranslatedBlock_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  label: string;
}

export interface TranslatedBlock_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  label: string;
  placeholder: string | null;
}

export type TranslatedBlock = TranslatedBlock_ImageBlock | TranslatedBlock_TypographyBlock | TranslatedBlock_ButtonBlock | TranslatedBlock_RadioOptionBlock | TranslatedBlock_TextResponseBlock;
