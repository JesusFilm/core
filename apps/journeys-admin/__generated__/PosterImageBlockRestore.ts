/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PosterImageBlockRestore
// ====================================================

export interface PosterImageBlockRestore_blockRestore_ButtonBlock {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
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
  focalTop: number | null;
  focalLeft: number | null;
}

export type PosterImageBlockRestore_blockRestore = PosterImageBlockRestore_blockRestore_ButtonBlock | PosterImageBlockRestore_blockRestore_ImageBlock;

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
