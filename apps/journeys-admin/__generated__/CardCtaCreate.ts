/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput, TypographyBlockCreateInput, ButtonBlockCreateInput, ButtonBlockUpdateInput, IconBlockCreateInput, TypographyAlign, TypographyColor, TypographyVariant, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardCtaCreate
// ====================================================

export interface CardCtaCreate_image {
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
}

export interface CardCtaCreate_subtitle {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface CardCtaCreate_title {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface CardCtaCreate_button1_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardCtaCreate_button1_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button1_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardCtaCreate_button1_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardCtaCreate_button1_action_NavigateToJourneyAction_journey_language;
}

export interface CardCtaCreate_button1_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardCtaCreate_button1_action_NavigateToJourneyAction_journey | null;
}

export interface CardCtaCreate_button1_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button1_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button1_action = CardCtaCreate_button1_action_NavigateAction | CardCtaCreate_button1_action_NavigateToBlockAction | CardCtaCreate_button1_action_NavigateToJourneyAction | CardCtaCreate_button1_action_LinkAction | CardCtaCreate_button1_action_EmailAction;

export interface CardCtaCreate_button1 {
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
  action: CardCtaCreate_button1_action | null;
}

export interface CardCtaCreate_startIcon1 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_endIcon1 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_button1Update_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardCtaCreate_button1Update_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button1Update_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardCtaCreate_button1Update_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardCtaCreate_button1Update_action_NavigateToJourneyAction_journey_language;
}

export interface CardCtaCreate_button1Update_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardCtaCreate_button1Update_action_NavigateToJourneyAction_journey | null;
}

export interface CardCtaCreate_button1Update_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button1Update_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button1Update_action = CardCtaCreate_button1Update_action_NavigateAction | CardCtaCreate_button1Update_action_NavigateToBlockAction | CardCtaCreate_button1Update_action_NavigateToJourneyAction | CardCtaCreate_button1Update_action_LinkAction | CardCtaCreate_button1Update_action_EmailAction;

export interface CardCtaCreate_button1Update {
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
  action: CardCtaCreate_button1Update_action | null;
}

export interface CardCtaCreate_button2_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardCtaCreate_button2_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button2_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardCtaCreate_button2_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardCtaCreate_button2_action_NavigateToJourneyAction_journey_language;
}

export interface CardCtaCreate_button2_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardCtaCreate_button2_action_NavigateToJourneyAction_journey | null;
}

export interface CardCtaCreate_button2_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button2_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button2_action = CardCtaCreate_button2_action_NavigateAction | CardCtaCreate_button2_action_NavigateToBlockAction | CardCtaCreate_button2_action_NavigateToJourneyAction | CardCtaCreate_button2_action_LinkAction | CardCtaCreate_button2_action_EmailAction;

export interface CardCtaCreate_button2 {
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
  action: CardCtaCreate_button2_action | null;
}

export interface CardCtaCreate_startIcon2 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_endIcon2 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_button2Update_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardCtaCreate_button2Update_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button2Update_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardCtaCreate_button2Update_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardCtaCreate_button2Update_action_NavigateToJourneyAction_journey_language;
}

export interface CardCtaCreate_button2Update_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardCtaCreate_button2Update_action_NavigateToJourneyAction_journey | null;
}

export interface CardCtaCreate_button2Update_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button2Update_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button2Update_action = CardCtaCreate_button2Update_action_NavigateAction | CardCtaCreate_button2Update_action_NavigateToBlockAction | CardCtaCreate_button2Update_action_NavigateToJourneyAction | CardCtaCreate_button2Update_action_LinkAction | CardCtaCreate_button2Update_action_EmailAction;

export interface CardCtaCreate_button2Update {
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
  action: CardCtaCreate_button2Update_action | null;
}

export interface CardCtaCreate_button3_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardCtaCreate_button3_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button3_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardCtaCreate_button3_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardCtaCreate_button3_action_NavigateToJourneyAction_journey_language;
}

export interface CardCtaCreate_button3_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardCtaCreate_button3_action_NavigateToJourneyAction_journey | null;
}

export interface CardCtaCreate_button3_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button3_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button3_action = CardCtaCreate_button3_action_NavigateAction | CardCtaCreate_button3_action_NavigateToBlockAction | CardCtaCreate_button3_action_NavigateToJourneyAction | CardCtaCreate_button3_action_LinkAction | CardCtaCreate_button3_action_EmailAction;

export interface CardCtaCreate_button3 {
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
  action: CardCtaCreate_button3_action | null;
}

export interface CardCtaCreate_startIcon3 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_endIcon3 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_button3Update_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardCtaCreate_button3Update_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button3Update_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardCtaCreate_button3Update_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardCtaCreate_button3Update_action_NavigateToJourneyAction_journey_language;
}

export interface CardCtaCreate_button3Update_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardCtaCreate_button3Update_action_NavigateToJourneyAction_journey | null;
}

export interface CardCtaCreate_button3Update_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button3Update_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button3Update_action = CardCtaCreate_button3Update_action_NavigateAction | CardCtaCreate_button3Update_action_NavigateToBlockAction | CardCtaCreate_button3Update_action_NavigateToJourneyAction | CardCtaCreate_button3Update_action_LinkAction | CardCtaCreate_button3Update_action_EmailAction;

export interface CardCtaCreate_button3Update {
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
  action: CardCtaCreate_button3Update_action | null;
}

export interface CardCtaCreate {
  image: CardCtaCreate_image;
  subtitle: CardCtaCreate_subtitle;
  title: CardCtaCreate_title;
  button1: CardCtaCreate_button1;
  startIcon1: CardCtaCreate_startIcon1;
  endIcon1: CardCtaCreate_endIcon1;
  button1Update: CardCtaCreate_button1Update | null;
  button2: CardCtaCreate_button2;
  startIcon2: CardCtaCreate_startIcon2;
  endIcon2: CardCtaCreate_endIcon2;
  button2Update: CardCtaCreate_button2Update | null;
  button3: CardCtaCreate_button3;
  startIcon3: CardCtaCreate_startIcon3;
  endIcon3: CardCtaCreate_endIcon3;
  button3Update: CardCtaCreate_button3Update | null;
}

export interface CardCtaCreateVariables {
  journeyId: string;
  imageInput: ImageBlockCreateInput;
  subtitleInput: TypographyBlockCreateInput;
  titleInput: TypographyBlockCreateInput;
  button1Input: ButtonBlockCreateInput;
  button1Id: string;
  button1UpdateInput: ButtonBlockUpdateInput;
  startIcon1Input: IconBlockCreateInput;
  endIcon1Input: IconBlockCreateInput;
  button2Input: ButtonBlockCreateInput;
  button2Id: string;
  button2UpdateInput: ButtonBlockUpdateInput;
  startIcon2Input: IconBlockCreateInput;
  endIcon2Input: IconBlockCreateInput;
  button3Input: ButtonBlockCreateInput;
  button3Id: string;
  button3UpdateInput: ButtonBlockUpdateInput;
  startIcon3Input: IconBlockCreateInput;
  endIcon3Input: IconBlockCreateInput;
}
