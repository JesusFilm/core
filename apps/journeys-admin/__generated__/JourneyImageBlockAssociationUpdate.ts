/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyImageBlockAssociationUpdate
// ====================================================

export interface JourneyImageBlockAssociationUpdate_journeyUpdate_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
}

export interface JourneyImageBlockAssociationUpdate_journeyUpdate_creatorImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
}

export interface JourneyImageBlockAssociationUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  primaryImageBlock: JourneyImageBlockAssociationUpdate_journeyUpdate_primaryImageBlock | null;
  creatorImageBlock: JourneyImageBlockAssociationUpdate_journeyUpdate_creatorImageBlock | null;
}

export interface JourneyImageBlockAssociationUpdate {
  journeyUpdate: JourneyImageBlockAssociationUpdate_journeyUpdate;
}

export interface JourneyImageBlockAssociationUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
