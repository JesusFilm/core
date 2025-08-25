/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput, JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: LogoBlockCreate
// ====================================================

export interface LogoBlockCreate_imageBlockCreate {
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

export interface LogoBlockCreate_journeyUpdate_logoImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
}

export interface LogoBlockCreate_journeyUpdate {
  __typename: "Journey";
  id: string;
  logoImageBlock: LogoBlockCreate_journeyUpdate_logoImageBlock | null;
}

export interface LogoBlockCreate {
  imageBlockCreate: LogoBlockCreate_imageBlockCreate;
  journeyUpdate: LogoBlockCreate_journeyUpdate;
}

export interface LogoBlockCreateVariables {
  id: string;
  imageBlockCreateInput: ImageBlockCreateInput;
  journeyUpdateInput: JourneyUpdateInput;
}
