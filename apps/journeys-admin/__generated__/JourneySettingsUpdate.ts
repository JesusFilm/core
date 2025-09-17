/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput, JourneyMenuButtonIcon, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneySettingsUpdate
// ====================================================

export interface JourneySettingsUpdate_journeyUpdate_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface JourneySettingsUpdate_journeyUpdate_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: JourneySettingsUpdate_journeyUpdate_language_name[];
}

export interface JourneySettingsUpdate_journeyUpdate_tags {
  __typename: "Tag";
  id: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_action = JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_action_NavigateToBlockAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_action_LinkAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_action_EmailAction;

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  alignment: ButtonAlignment | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock {
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
  action: JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_action | null;
  settings: JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock_settings | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_CardBlock {
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

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_ImageBlock {
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

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock_action = JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock_action_NavigateToBlockAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock_action_LinkAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock_action_EmailAction;

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock_action | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock_action = JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock_action_NavigateToBlockAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock_action_LinkAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock_action_EmailAction;

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock_action | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_StepBlock {
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

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: JourneySettingsUpdate_journeyUpdate_menuStepBlock_TypographyBlock_settings | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_title[];
  images: JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_images[];
  variant: JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo = JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_Video | JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_MuxVideo | JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo_YouTube;

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_action = JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_action_NavigateToBlockAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_action_LinkAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_action_EmailAction;

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean;
  autoplay: boolean;
  startAt: number | null;
  endAt: number | null;
  posterBlockId: string | null;
  fullsize: boolean;
  videoId: string | null;
  videoVariantLanguageId: string | null;
  source: VideoBlockSource | null;
  title: string;
  description: string;
  image: string | null;
  duration: number | null;
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_mediaVideo | null;
  action: JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock_action | null;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock_triggerAction = JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock_triggerAction_NavigateToBlockAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock_triggerAction_LinkAction | JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock_triggerAction_EmailAction;

export interface JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock_triggerAction | null;
}

export type JourneySettingsUpdate_journeyUpdate_menuStepBlock = JourneySettingsUpdate_journeyUpdate_menuStepBlock_GridContainerBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_ButtonBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_CardBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_IconBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_ImageBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioOptionBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_RadioQuestionBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_SignUpBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_SpacerBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_StepBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_TextResponseBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_TypographyBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoBlock | JourneySettingsUpdate_journeyUpdate_menuStepBlock_VideoTriggerBlock;

export interface JourneySettingsUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  strategySlug: string | null;
  language: JourneySettingsUpdate_journeyUpdate_language;
  tags: JourneySettingsUpdate_journeyUpdate_tags[];
  website: boolean | null;
  showShareButton: boolean | null;
  showLikeButton: boolean | null;
  showDislikeButton: boolean | null;
  /**
   * public title for viewers
   */
  displayTitle: string | null;
  menuButtonIcon: JourneyMenuButtonIcon | null;
  menuStepBlock: JourneySettingsUpdate_journeyUpdate_menuStepBlock | null;
  socialNodeX: number | null;
  socialNodeY: number | null;
}

export interface JourneySettingsUpdate {
  journeyUpdate: JourneySettingsUpdate_journeyUpdate;
}

export interface JourneySettingsUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
