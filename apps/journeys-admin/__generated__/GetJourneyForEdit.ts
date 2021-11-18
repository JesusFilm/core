/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyForEdit
// ====================================================

export interface GetJourneyForEdit_journey_blocks_ButtonBlock {
  __typename: "ButtonBlock" | "GridContainerBlock" | "GridItemBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
}

export interface GetJourneyForEdit_journey_blocks_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface GetJourneyForEdit_journey_blocks_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to when a
   * NavigateAction occurs or if the user manually tries to advance to the next
   * step. If no nextBlockId is set it can be assumed that this step represents
   * the end of the current journey.
   */
  nextBlockId: string | null;
}

export type GetJourneyForEdit_journey_blocks = GetJourneyForEdit_journey_blocks_ButtonBlock | GetJourneyForEdit_journey_blocks_CardBlock | GetJourneyForEdit_journey_blocks_StepBlock;

export interface GetJourneyForEdit_journey {
  __typename: "Journey";
  id: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  title: string;
  description: string | null;
  blocks: GetJourneyForEdit_journey_blocks[] | null;
}

export interface GetJourneyForEdit {
  journey: GetJourneyForEdit_journey | null;
}

export interface GetJourneyForEditVariables {
  id: string;
}
