/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RadioOptionImageRestore
// ====================================================

export interface RadioOptionImageRestore_blockRestore_StepBlock {
  __typename: "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoTriggerBlock";
  id: string;
}

export interface RadioOptionImageRestore_blockRestore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export type RadioOptionImageRestore_blockRestore = RadioOptionImageRestore_blockRestore_StepBlock | RadioOptionImageRestore_blockRestore_ImageBlock;

export interface RadioOptionImageRestore_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface RadioOptionImageRestore {
  /**
   * blockRestore is used for redo/undo
   */
  blockRestore: RadioOptionImageRestore_blockRestore[];
  radioOptionBlockUpdate: RadioOptionImageRestore_radioOptionBlockUpdate;
}

export interface RadioOptionImageRestoreVariables {
  id: string;
  radioOptionBlockId: string;
}
