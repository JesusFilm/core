/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MenuBlockDelete
// ====================================================

export interface MenuBlockDelete_stepDelete {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface MenuBlockDelete_journeyUpdate_menuStepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface MenuBlockDelete_journeyUpdate {
  __typename: "Journey";
  id: string;
  menuStepBlock: MenuBlockDelete_journeyUpdate_menuStepBlock | null;
}

export interface MenuBlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  stepDelete: MenuBlockDelete_stepDelete[];
  journeyUpdate: MenuBlockDelete_journeyUpdate;
}

export interface MenuBlockDeleteVariables {
  journeyId: string;
  stepId: string;
  journeyUpdateInput: JourneyUpdateInput;
}
