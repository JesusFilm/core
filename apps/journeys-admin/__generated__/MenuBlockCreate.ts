/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockCreateInput, CardBlockCreateInput, TypographyBlockCreateInput, ButtonBlockCreateInput, JourneyUpdateInput, ThemeMode, ThemeName, TypographyAlign, TypographyColor, TypographyVariant, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MenuBlockCreate
// ====================================================

export interface MenuBlockCreate_step {
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
  /**
   * x is used to position the block horizontally in the journey flow diagram on
   * the editor.
   */
  x: number | null;
  /**
   * y is used to position the block vertically in the journey flow diagram on
   * the editor.
   */
  y: number | null;
}

export interface MenuBlockCreate_card {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
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

export interface MenuBlockCreate_heading {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface MenuBlockCreate_subHeading {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface MenuBlockCreate_button1_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockCreate_button1_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockCreate_button1_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockCreate_button1_action = MenuBlockCreate_button1_action_NavigateToBlockAction | MenuBlockCreate_button1_action_LinkAction | MenuBlockCreate_button1_action_EmailAction;

export interface MenuBlockCreate_button1_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface MenuBlockCreate_button1 {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: MenuBlockCreate_button1_action | null;
  settings: MenuBlockCreate_button1_settings | null;
}

export interface MenuBlockCreate_button2_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockCreate_button2_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockCreate_button2_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockCreate_button2_action = MenuBlockCreate_button2_action_NavigateToBlockAction | MenuBlockCreate_button2_action_LinkAction | MenuBlockCreate_button2_action_EmailAction;

export interface MenuBlockCreate_button2_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface MenuBlockCreate_button2 {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: MenuBlockCreate_button2_action | null;
  settings: MenuBlockCreate_button2_settings | null;
}

export interface MenuBlockCreate_button3_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MenuBlockCreate_button3_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface MenuBlockCreate_button3_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type MenuBlockCreate_button3_action = MenuBlockCreate_button3_action_NavigateToBlockAction | MenuBlockCreate_button3_action_LinkAction | MenuBlockCreate_button3_action_EmailAction;

export interface MenuBlockCreate_button3_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface MenuBlockCreate_button3 {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  submitEnabled: boolean | null;
  action: MenuBlockCreate_button3_action | null;
  settings: MenuBlockCreate_button3_settings | null;
}

export interface MenuBlockCreate_journeyUpdate_menuStepBlock {
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

export interface MenuBlockCreate_journeyUpdate {
  __typename: "Journey";
  id: string;
  menuStepBlock: MenuBlockCreate_journeyUpdate_menuStepBlock | null;
}

export interface MenuBlockCreate {
  step: MenuBlockCreate_step;
  card: MenuBlockCreate_card;
  heading: MenuBlockCreate_heading;
  subHeading: MenuBlockCreate_subHeading;
  button1: MenuBlockCreate_button1;
  button2: MenuBlockCreate_button2;
  button3: MenuBlockCreate_button3;
  journeyUpdate: MenuBlockCreate_journeyUpdate;
}

export interface MenuBlockCreateVariables {
  journeyId: string;
  stepInput: StepBlockCreateInput;
  cardInput: CardBlockCreateInput;
  headingInput: TypographyBlockCreateInput;
  subHeadingInput: TypographyBlockCreateInput;
  button1Input: ButtonBlockCreateInput;
  button2Input: ButtonBlockCreateInput;
  button3Input: ButtonBlockCreateInput;
  journeyUpdateInput: JourneyUpdateInput;
}
