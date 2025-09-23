/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockDuplicateIdMap, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepDuplicate
// ====================================================

export interface StepDuplicate_blockDuplicate_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface StepDuplicate_blockDuplicate_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface StepDuplicate_blockDuplicate_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface StepDuplicate_blockDuplicate_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type StepDuplicate_blockDuplicate_ButtonBlock_action = StepDuplicate_blockDuplicate_ButtonBlock_action_PhoneAction | StepDuplicate_blockDuplicate_ButtonBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_ButtonBlock_action_LinkAction | StepDuplicate_blockDuplicate_ButtonBlock_action_EmailAction;

export interface StepDuplicate_blockDuplicate_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface StepDuplicate_blockDuplicate_ButtonBlock {
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
  action: StepDuplicate_blockDuplicate_ButtonBlock_action | null;
  settings: StepDuplicate_blockDuplicate_ButtonBlock_settings | null;
}

export interface StepDuplicate_blockDuplicate_CardBlock {
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

export interface StepDuplicate_blockDuplicate_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface StepDuplicate_blockDuplicate_ImageBlock {
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

export interface StepDuplicate_blockDuplicate_MultiselectOptionBlock {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface StepDuplicate_blockDuplicate_MultiselectBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  target: string | null;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface StepDuplicate_blockDuplicate_MultiselectBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_MultiselectBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface StepDuplicate_blockDuplicate_MultiselectBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type StepDuplicate_blockDuplicate_MultiselectBlock_action = StepDuplicate_blockDuplicate_MultiselectBlock_action_LinkAction | StepDuplicate_blockDuplicate_MultiselectBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_MultiselectBlock_action_EmailAction | StepDuplicate_blockDuplicate_MultiselectBlock_action_PhoneAction;

export interface StepDuplicate_blockDuplicate_MultiselectBlock {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  submitLabel: string | null;
  min: number | null;
  max: number | null;
  action: StepDuplicate_blockDuplicate_MultiselectBlock_action | null;
}

export interface StepDuplicate_blockDuplicate_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface StepDuplicate_blockDuplicate_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface StepDuplicate_blockDuplicate_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type StepDuplicate_blockDuplicate_RadioOptionBlock_action = StepDuplicate_blockDuplicate_RadioOptionBlock_action_PhoneAction | StepDuplicate_blockDuplicate_RadioOptionBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_RadioOptionBlock_action_LinkAction | StepDuplicate_blockDuplicate_RadioOptionBlock_action_EmailAction;

export interface StepDuplicate_blockDuplicate_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: StepDuplicate_blockDuplicate_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface StepDuplicate_blockDuplicate_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface StepDuplicate_blockDuplicate_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface StepDuplicate_blockDuplicate_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface StepDuplicate_blockDuplicate_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type StepDuplicate_blockDuplicate_SignUpBlock_action = StepDuplicate_blockDuplicate_SignUpBlock_action_PhoneAction | StepDuplicate_blockDuplicate_SignUpBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_SignUpBlock_action_LinkAction | StepDuplicate_blockDuplicate_SignUpBlock_action_EmailAction;

export interface StepDuplicate_blockDuplicate_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: StepDuplicate_blockDuplicate_SignUpBlock_action | null;
}

export interface StepDuplicate_blockDuplicate_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface StepDuplicate_blockDuplicate_StepBlock {
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

export interface StepDuplicate_blockDuplicate_TextResponseBlock {
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

export interface StepDuplicate_blockDuplicate_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface StepDuplicate_blockDuplicate_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: StepDuplicate_blockDuplicate_TypographyBlock_settings | null;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_title[];
  images: StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_images[];
  variant: StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type StepDuplicate_blockDuplicate_VideoBlock_mediaVideo = StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_Video | StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_MuxVideo | StepDuplicate_blockDuplicate_VideoBlock_mediaVideo_YouTube;

export interface StepDuplicate_blockDuplicate_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface StepDuplicate_blockDuplicate_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type StepDuplicate_blockDuplicate_VideoBlock_action = StepDuplicate_blockDuplicate_VideoBlock_action_PhoneAction | StepDuplicate_blockDuplicate_VideoBlock_action_NavigateToBlockAction | StepDuplicate_blockDuplicate_VideoBlock_action_LinkAction | StepDuplicate_blockDuplicate_VideoBlock_action_EmailAction;

export interface StepDuplicate_blockDuplicate_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: StepDuplicate_blockDuplicate_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: StepDuplicate_blockDuplicate_VideoBlock_action | null;
}

export interface StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction = StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_PhoneAction | StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_NavigateToBlockAction | StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_LinkAction | StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction_EmailAction;

export interface StepDuplicate_blockDuplicate_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: StepDuplicate_blockDuplicate_VideoTriggerBlock_triggerAction;
}

export type StepDuplicate_blockDuplicate = StepDuplicate_blockDuplicate_GridContainerBlock | StepDuplicate_blockDuplicate_ButtonBlock | StepDuplicate_blockDuplicate_CardBlock | StepDuplicate_blockDuplicate_IconBlock | StepDuplicate_blockDuplicate_ImageBlock | StepDuplicate_blockDuplicate_MultiselectOptionBlock | StepDuplicate_blockDuplicate_MultiselectBlock | StepDuplicate_blockDuplicate_RadioOptionBlock | StepDuplicate_blockDuplicate_RadioQuestionBlock | StepDuplicate_blockDuplicate_SignUpBlock | StepDuplicate_blockDuplicate_SpacerBlock | StepDuplicate_blockDuplicate_StepBlock | StepDuplicate_blockDuplicate_TextResponseBlock | StepDuplicate_blockDuplicate_TypographyBlock | StepDuplicate_blockDuplicate_VideoBlock | StepDuplicate_blockDuplicate_VideoTriggerBlock;

export interface StepDuplicate {
  /**
   * blockDuplicate returns the updated block, it's children and sibling blocks on successful duplicate
   */
  blockDuplicate: StepDuplicate_blockDuplicate[];
}

export interface StepDuplicateVariables {
  id: string;
  journeyId: string;
  parentOrder?: number | null;
  idMap?: BlockDuplicateIdMap[] | null;
  x?: number | null;
  y?: number | null;
}
