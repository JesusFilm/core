/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus, ThemeName, ThemeMode, ButtonVariant, ButtonColor, ButtonSize, ContactActionType, ButtonAlignment, BlockEventLabel, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit, UserJourneyRole, MessagePlatform, JourneyMenuButtonIcon } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPrivateJourneyPreview
// ====================================================

export interface GetPrivateJourneyPreview_journey_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetPrivateJourneyPreview_journey_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: GetPrivateJourneyPreview_journey_language_name[];
}

export interface GetPrivateJourneyPreview_journey_blocks_GridContainerBlock {
  __typename: "GridContainerBlock" | "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_ChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action = GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_NavigateToBlockAction | GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_LinkAction | GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_EmailAction | GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_ChatAction | GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action_PhoneAction;

export interface GetPrivateJourneyPreview_journey_blocks_ButtonBlock_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_ButtonBlock {
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
  action: GetPrivateJourneyPreview_journey_blocks_ButtonBlock_action | null;
  settings: GetPrivateJourneyPreview_journey_blocks_ButtonBlock_settings | null;
  eventLabel: BlockEventLabel | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_CardBlock {
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
  eventLabel: BlockEventLabel | null;
  /**
   * When true, this card displays the AI chat button.
   */
  showAssistant: boolean | null;
  /**
   * When true, the chat drawer auto-opens on first visit to this card.
   */
  expandChatByDefault: boolean | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_ImageBlock {
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
  customizable: boolean | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_MultiselectOptionBlock {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface GetPrivateJourneyPreview_journey_blocks_MultiselectBlock {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  min: number | null;
  max: number | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_ChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action = GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_NavigateToBlockAction | GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_LinkAction | GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_EmailAction | GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_ChatAction | GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action_PhoneAction;

export interface GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
  eventLabel: BlockEventLabel | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_ChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action = GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_NavigateToBlockAction | GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_LinkAction | GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_EmailAction | GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_ChatAction | GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action_PhoneAction;

export interface GetPrivateJourneyPreview_journey_blocks_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: GetPrivateJourneyPreview_journey_blocks_SignUpBlock_action | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_SpacerBlock {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_StepBlock {
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

export interface GetPrivateJourneyPreview_journey_blocks_TextResponseBlock {
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
  hideLabel: boolean | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_TypographyBlock_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: GetPrivateJourneyPreview_journey_blocks_TypographyBlock_settings | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_subtitleLanguage {
  __typename: "Language";
  id: string;
  bcp47: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_title[];
  images: GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_images[];
  variant: GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo = GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_Video | GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_MuxVideo | GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo_YouTube;

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_ChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetPrivateJourneyPreview_journey_blocks_VideoBlock_action = GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_NavigateToBlockAction | GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_LinkAction | GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_EmailAction | GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_ChatAction | GetPrivateJourneyPreview_journey_blocks_VideoBlock_action_PhoneAction;

export interface GetPrivateJourneyPreview_journey_blocks_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  startAt: number | null;
  endAt: number | null;
  posterBlockId: string | null;
  fullsize: boolean | null;
  videoId: string | null;
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  title: string | null;
  description: string | null;
  image: string | null;
  duration: number | null;
  objectFit: VideoBlockObjectFit | null;
  showGeneratedSubtitles: boolean | null;
  subtitleLanguage: GetPrivateJourneyPreview_journey_blocks_VideoBlock_subtitleLanguage | null;
  mediaVideo: GetPrivateJourneyPreview_journey_blocks_VideoBlock_mediaVideo | null;
  action: GetPrivateJourneyPreview_journey_blocks_VideoBlock_action | null;
  eventLabel: BlockEventLabel | null;
  endEventLabel: BlockEventLabel | null;
  customizable: boolean | null;
  /**
   * Publisher notes for template adapters (e.g. trailer, intro).
   */
  notes: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_ChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction = GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_NavigateToBlockAction | GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_LinkAction | GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_EmailAction | GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_ChatAction | GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction_PhoneAction;

export interface GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock_triggerAction;
}

export type GetPrivateJourneyPreview_journey_blocks = GetPrivateJourneyPreview_journey_blocks_GridContainerBlock | GetPrivateJourneyPreview_journey_blocks_ButtonBlock | GetPrivateJourneyPreview_journey_blocks_CardBlock | GetPrivateJourneyPreview_journey_blocks_IconBlock | GetPrivateJourneyPreview_journey_blocks_ImageBlock | GetPrivateJourneyPreview_journey_blocks_MultiselectOptionBlock | GetPrivateJourneyPreview_journey_blocks_MultiselectBlock | GetPrivateJourneyPreview_journey_blocks_RadioOptionBlock | GetPrivateJourneyPreview_journey_blocks_RadioQuestionBlock | GetPrivateJourneyPreview_journey_blocks_SignUpBlock | GetPrivateJourneyPreview_journey_blocks_SpacerBlock | GetPrivateJourneyPreview_journey_blocks_StepBlock | GetPrivateJourneyPreview_journey_blocks_TextResponseBlock | GetPrivateJourneyPreview_journey_blocks_TypographyBlock | GetPrivateJourneyPreview_journey_blocks_VideoBlock | GetPrivateJourneyPreview_journey_blocks_VideoTriggerBlock;

export interface GetPrivateJourneyPreview_journey_primaryImageBlock {
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
  customizable: boolean | null;
}

export interface GetPrivateJourneyPreview_journey_creatorImageBlock {
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
  customizable: boolean | null;
}

export interface GetPrivateJourneyPreview_journey_userJourneys_user_AnonymousUser {
  __typename: "AnonymousUser";
  id: string;
}

export interface GetPrivateJourneyPreview_journey_userJourneys_user_AuthenticatedUser {
  __typename: "AuthenticatedUser";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export type GetPrivateJourneyPreview_journey_userJourneys_user = GetPrivateJourneyPreview_journey_userJourneys_user_AnonymousUser | GetPrivateJourneyPreview_journey_userJourneys_user_AuthenticatedUser;

export interface GetPrivateJourneyPreview_journey_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  openedAt: any | null;
  user: GetPrivateJourneyPreview_journey_userJourneys_user | null;
}

export interface GetPrivateJourneyPreview_journey_chatButtons {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: MessagePlatform | null;
  customizable: boolean | null;
}

export interface GetPrivateJourneyPreview_journey_host {
  __typename: "Host";
  id: string;
  teamId: string;
  title: string;
  location: string | null;
  src1: string | null;
  src2: string | null;
}

export interface GetPrivateJourneyPreview_journey_team {
  __typename: "Team";
  id: string;
  title: string;
  publicTitle: string | null;
}

export interface GetPrivateJourneyPreview_journey_tags_name_language {
  __typename: "Language";
  id: string;
}

export interface GetPrivateJourneyPreview_journey_tags_name {
  __typename: "TagName";
  value: string;
  language: GetPrivateJourneyPreview_journey_tags_name_language;
  primary: boolean;
}

export interface GetPrivateJourneyPreview_journey_tags {
  __typename: "Tag";
  id: string;
  parentId: string | null;
  name: GetPrivateJourneyPreview_journey_tags_name[];
}

export interface GetPrivateJourneyPreview_journey_logoImageBlock {
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
  customizable: boolean | null;
}

export interface GetPrivateJourneyPreview_journey_menuStepBlock {
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

export interface GetPrivateJourneyPreview_journey_journeyTheme {
  __typename: "JourneyTheme";
  id: string;
  headerFont: string | null;
  bodyFont: string | null;
  labelFont: string | null;
}

export interface GetPrivateJourneyPreview_journey_journeyCustomizationFields {
  __typename: "JourneyCustomizationField";
  id: string;
  journeyId: string;
  key: string;
  value: string | null;
  defaultValue: string | null;
}

export interface GetPrivateJourneyPreview_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  status: JourneyStatus;
  language: GetPrivateJourneyPreview_journey_language;
  createdAt: any;
  updatedAt: any;
  featuredAt: any | null;
  publishedAt: any | null;
  themeName: ThemeName;
  themeMode: ThemeMode;
  strategySlug: string | null;
  /**
   * title for seo and sharing
   */
  seoTitle: string | null;
  seoDescription: string | null;
  template: boolean | null;
  blocks: GetPrivateJourneyPreview_journey_blocks[] | null;
  primaryImageBlock: GetPrivateJourneyPreview_journey_primaryImageBlock | null;
  creatorDescription: string | null;
  creatorImageBlock: GetPrivateJourneyPreview_journey_creatorImageBlock | null;
  userJourneys: GetPrivateJourneyPreview_journey_userJourneys[] | null;
  chatButtons: GetPrivateJourneyPreview_journey_chatButtons[];
  host: GetPrivateJourneyPreview_journey_host | null;
  team: GetPrivateJourneyPreview_journey_team | null;
  tags: GetPrivateJourneyPreview_journey_tags[];
  website: boolean | null;
  showShareButton: boolean | null;
  showLikeButton: boolean | null;
  showDislikeButton: boolean | null;
  /**
   * public title for viewers
   */
  displayTitle: string | null;
  logoImageBlock: GetPrivateJourneyPreview_journey_logoImageBlock | null;
  menuButtonIcon: JourneyMenuButtonIcon | null;
  menuStepBlock: GetPrivateJourneyPreview_journey_menuStepBlock | null;
  socialNodeX: number | null;
  socialNodeY: number | null;
  journeyTheme: GetPrivateJourneyPreview_journey_journeyTheme | null;
  journeyCustomizationDescription: string | null;
  journeyCustomizationFields: GetPrivateJourneyPreview_journey_journeyCustomizationFields[];
  fromTemplateId: string | null;
  customizable: boolean | null;
  showAssistant: boolean | null;
}

export interface GetPrivateJourneyPreview {
  journey: GetPrivateJourneyPreview_journey;
}

export interface GetPrivateJourneyPreviewVariables {
  id: string;
  expectedRevision?: string | null;
}
