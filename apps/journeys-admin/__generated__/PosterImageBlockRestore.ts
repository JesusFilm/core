/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PosterImageBlockRestore
// ====================================================

export interface PosterImageBlockRestore_blockRestore_StepBlock {
  __typename: "StepBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface PosterImageBlockRestore_blockRestore_ImageBlock {
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
}

export type PosterImageBlockRestore_blockRestore = PosterImageBlockRestore_blockRestore_StepBlock | PosterImageBlockRestore_blockRestore_ImageBlock;

export interface PosterImageBlockRestore_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
}

export interface PosterImageBlockRestore {
  /**
   * blockRestore is used for redo/undo
   */
  blockRestore: PosterImageBlockRestore_blockRestore[];
  videoBlockUpdate: PosterImageBlockRestore_videoBlockUpdate;
}

export interface PosterImageBlockRestoreVariables {
  id: string;
  videoBlockId: string;
}
