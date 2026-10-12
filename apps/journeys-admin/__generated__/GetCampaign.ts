/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTextSource, CampaignStatus, UserTeamRole, ThemeMode, CampaignRadius, CampaignButtonRadius, CampaignPageKind, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignStringKey } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCampaign
// ====================================================

export interface GetCampaign_campaign_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_customDomains {
  __typename: "CustomDomain";
  id: string;
  name: string;
}

export interface GetCampaign_campaign_team_userTeams_user {
  __typename: "AuthenticatedUser" | "AnonymousUser";
  id: string;
}

export interface GetCampaign_campaign_team_userTeams {
  __typename: "UserTeam";
  id: string;
  role: UserTeamRole;
  user: GetCampaign_campaign_team_userTeams_user;
}

export interface GetCampaign_campaign_team {
  __typename: "Team";
  id: string;
  userTeams: GetCampaign_campaign_team_userTeams[];
}

export interface GetCampaign_campaign_languages_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetCampaign_campaign_languages_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: GetCampaign_campaign_languages_language_name[];
}

export interface GetCampaign_campaign_languages {
  __typename: "CampaignLanguage";
  id: string;
  /**
   * api-languages Language id.
   */
  languageId: string;
  order: number;
  language: GetCampaign_campaign_languages_language;
}

export interface GetCampaign_campaign_theme {
  __typename: "CampaignTheme";
  id: string;
  themeMode: ThemeMode;
  /**
   * Google Fonts family; null = the base theme default.
   */
  headerFont: string | null;
  bodyFont: string | null;
  labelFont: string | null;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  contrastBackgroundColor: string;
  contrastTextColor: string;
  radius: CampaignRadius;
  buttonRadius: CampaignButtonRadius;
}

export interface GetCampaign_campaign_pages {
  __typename: "CampaignPage";
  id: string;
  kind: CampaignPageKind;
}

export interface GetCampaign_campaign_blocks_CampaignColumnBlock {
  __typename: "CampaignColumnBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
}

export interface GetCampaign_campaign_blocks_CampaignHeaderBlock {
  __typename: "CampaignHeaderBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  /**
   * The owned CampaignImageBlock shown as the brand mark.
   */
  logoBlockId: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignFooterBlock {
  __typename: "CampaignFooterBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignHeroBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignHeroBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignHeroBlock_ledeTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignHeroBlock {
  __typename: "CampaignHeroBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  eyebrow: string | null;
  title: string | null;
  lede: string | null;
  /**
   * Alignment of the Section Body; the editor offers left and center.
   */
  align: TypographyAlign | null;
  /**
   * The owned CampaignVideoBlock or CampaignImageBlock in the Media Slot.
   */
  mediaBlockId: string | null;
  eyebrowTranslations: GetCampaign_campaign_blocks_CampaignHeroBlock_eyebrowTranslations[];
  titleTranslations: GetCampaign_campaign_blocks_CampaignHeroBlock_titleTranslations[];
  ledeTranslations: GetCampaign_campaign_blocks_CampaignHeroBlock_ledeTranslations[];
}

export interface GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock {
  __typename: "CampaignRegionSwitcherBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  title: string | null;
  switcherVariant: CampaignSwitcherVariant;
  titleTranslations: GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock_titleTranslations[];
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_title_language {
  __typename: "Language";
  id: string;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_title_language;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children_title_language {
  __typename: "Language";
  id: string;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children_title_language;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
  title: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children_title[];
  images: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children_images[];
  variant: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children_variant | null;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
  title: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_title[];
  images: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_images[];
  variant: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_variant | null;
  children: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video_children[];
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock {
  __typename: "CampaignVideoCarouselBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  eyebrow: string | null;
  title: string | null;
  /**
   * The Watch Video to expand; null for explicit children.
   */
  videoId: string | null;
  /**
   * The campaign language when the Watch Video was linked; the language the expansion resolves in.
   */
  videoVariantLanguageId: string | null;
  /**
   * Watch expansion: the federated `Video` reference (`id`, `primaryLanguageId`) the gateway joins for `children` and `childrenCount`; api-journeys never fetches or caches it. Null in explicit mode.
   */
  video: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video | null;
  eyebrowTranslations: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_eyebrowTranslations[];
  titleTranslations: GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_titleTranslations[];
}

export interface GetCampaign_campaign_blocks_CampaignJourneyListBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignJourneyListBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignJourneyListBlock_ledeTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignJourneyListBlock {
  __typename: "CampaignJourneyListBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  eyebrow: string | null;
  title: string | null;
  lede: string | null;
  display: CampaignJourneyListDisplay;
  eyebrowTranslations: GetCampaign_campaign_blocks_CampaignJourneyListBlock_eyebrowTranslations[];
  titleTranslations: GetCampaign_campaign_blocks_CampaignJourneyListBlock_titleTranslations[];
  ledeTranslations: GetCampaign_campaign_blocks_CampaignJourneyListBlock_ledeTranslations[];
}

export interface GetCampaign_campaign_blocks_CampaignAnalyticsBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignAnalyticsBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignAnalyticsBlock {
  __typename: "CampaignAnalyticsBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  eyebrow: string | null;
  title: string | null;
  showMap: boolean;
  eyebrowTranslations: GetCampaign_campaign_blocks_CampaignAnalyticsBlock_eyebrowTranslations[];
  titleTranslations: GetCampaign_campaign_blocks_CampaignAnalyticsBlock_titleTranslations[];
}

export interface GetCampaign_campaign_blocks_CampaignRegionHeaderBlock_introTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignRegionHeaderBlock {
  __typename: "CampaignRegionHeaderBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  intro: string | null;
  introTranslations: GetCampaign_campaign_blocks_CampaignRegionHeaderBlock_introTranslations[];
}

export interface GetCampaign_campaign_blocks_CampaignRegionShareBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignRegionShareBlock_introTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignRegionShareBlock {
  __typename: "CampaignRegionShareBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  title: string | null;
  intro: string | null;
  titleTranslations: GetCampaign_campaign_blocks_CampaignRegionShareBlock_titleTranslations[];
  introTranslations: GetCampaign_campaign_blocks_CampaignRegionShareBlock_introTranslations[];
}

export interface GetCampaign_campaign_blocks_CampaignRichTextBlock {
  __typename: "CampaignRichTextBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  title: string | null;
  /**
   * Paragraphs separated by blank lines.
   */
  richTextContent: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignColumnsBlock {
  __typename: "CampaignColumnsBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  /**
   * Width of the two slots at `md` and up; defaults to equal.
   */
  ratio: CampaignColumnsRatio;
}

export interface GetCampaign_campaign_blocks_CampaignImageBlock {
  __typename: "CampaignImageBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  /**
   * The Cloudflare image address (`https: // imagedelivery.net/…`); null until an image is chosen.
   */
  src: string | null;
  /**
   * Visitor-facing alternative text; at most 500 characters.
   */
  alt: string | null;
  /**
   * Measured by the server from the image; never client-supplied.
   */
  width: number | null;
  /**
   * Measured by the server from the image; never client-supplied.
   */
  height: number | null;
}

export interface GetCampaign_campaign_blocks_CampaignFeaturedMediaBlock {
  __typename: "CampaignFeaturedMediaBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  eyebrow: string | null;
  title: string | null;
  lede: string | null;
  /**
   * One bullet per line; the viewer splits on line breaks.
   */
  bullets: string | null;
  /**
   * Which side the media sits on at `md` and up.
   */
  mediaSide: CampaignMediaSide;
  /**
   * The owned CampaignVideoBlock or CampaignImageBlock in the Media Slot.
   */
  mediaBlockId: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignJourneyBlock_journeyImage {
  __typename: "CampaignJourneyImage";
  src: string;
  alt: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignJourneyBlock {
  __typename: "CampaignJourneyBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  /**
   * Snapshot of the journey's title, editable; the default-language value.
   */
  title: string | null;
  /**
   * Snapshot of the journey's description, editable; the default-language value.
   */
  description: string | null;
  /**
   * The journey’s live status, read at request time; null when the journey was deleted. The public page shows a card only while this is `published` or `archived`.
   */
  journeyStatus: JourneyStatus | null;
  /**
   * The journey's public address, decided by its own team's domains; null unless the journey is published or archived.
   */
  journeyUrl: string | null;
  /**
   * The journey's primary image, read live; null when it has none.
   */
  journeyImage: GetCampaign_campaign_blocks_CampaignJourneyBlock_journeyImage | null;
  /**
   * The linked journey. Null only if the row predates the link; never exposes the journey itself.
   */
  journeyId: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video_title_language {
  __typename: "Language";
  id: string;
}

export interface GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video_title_language;
}

export interface GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
  title: GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video_title[];
  images: GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video_images[];
  variant: GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video_variant | null;
}

export interface GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  playbackId: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo = GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_Video | GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_MuxVideo | GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo_YouTube;

export interface GetCampaign_campaign_blocks_CampaignVideoBlock {
  __typename: "CampaignVideoBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  /**
   * Always `internal`, `youTube` or `mux`.
   */
  source: VideoBlockSource | null;
  /**
   * The Watch Video id, the YouTube video id or the Mux video id, by `source`.
   */
  videoId: string | null;
  /**
   * For `internal`: the campaign language at link time; the language `mediaVideo` resolves in.
   */
  videoVariantLanguageId: string | null;
  /**
   * The author’s override (at most 200 characters), or for YouTube and Mux the title captured at pick. Null on a Watch video means the Video’s own title.
   */
  title: string | null;
  /**
   * The author’s override (at most 1000 characters), or for YouTube the description captured at pick. Null on a Watch video means the Video’s own text.
   */
  description: string | null;
  /**
   * The poster captured at pick for YouTube and Mux; null for a Watch video (read through `mediaVideo`).
   */
  image: string | null;
  /**
   * Seconds, captured at pick for YouTube and Mux.
   */
  duration: number | null;
  /**
   * The federated video reference (`Video`, `YouTube` or `MuxVideo` by `source`, with `id` and `primaryLanguageId`); the gateway resolves it, api-journeys never does.
   */
  mediaVideo: GetCampaign_campaign_blocks_CampaignVideoBlock_mediaVideo | null;
}

export interface GetCampaign_campaign_blocks_CampaignTypographyBlock_contentTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignTypographyBlock {
  __typename: "CampaignTypographyBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  content: string;
  /**
   * Null means body1.
   */
  typographyVariant: TypographyVariant | null;
  /**
   * Null means inherit from the section.
   */
  align: TypographyAlign | null;
  /**
   * `#RRGGBB`; null means the section override, then the theme.
   */
  color: string | null;
  /**
   * Which side of the Section Body this Extra renders on; null on a Region Line.
   */
  placement: CampaignChildPlacement | null;
  contentTranslations: GetCampaign_campaign_blocks_CampaignTypographyBlock_contentTranslations[];
}

export interface GetCampaign_campaign_blocks_CampaignButtonBlock_action_CampaignLinkAction {
  __typename: "CampaignLinkAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  url: string;
  target: string | null;
}

export interface GetCampaign_campaign_blocks_CampaignButtonBlock_action_CampaignScrollToBlockAction {
  __typename: "CampaignScrollToBlockAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  blockId: string;
}

export interface GetCampaign_campaign_blocks_CampaignButtonBlock_action_CampaignNavigateToRegionAction {
  __typename: "CampaignNavigateToRegionAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  /**
   * Null once the region has been deleted.
   */
  regionId: string | null;
}

export type GetCampaign_campaign_blocks_CampaignButtonBlock_action = GetCampaign_campaign_blocks_CampaignButtonBlock_action_CampaignLinkAction | GetCampaign_campaign_blocks_CampaignButtonBlock_action_CampaignScrollToBlockAction | GetCampaign_campaign_blocks_CampaignButtonBlock_action_CampaignNavigateToRegionAction;

export interface GetCampaign_campaign_blocks_CampaignButtonBlock_labelTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_blocks_CampaignButtonBlock {
  __typename: "CampaignButtonBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  label: string;
  /**
   * Null means contained.
   */
  buttonVariant: ButtonVariant | null;
  /**
   * Null means medium.
   */
  size: ButtonSize | null;
  /**
   * Null means follow the section.
   */
  align: TypographyAlign | null;
  /**
   * Fill (contained) or border and label (outlined). Null means the section buttonColor, then the theme primary.
   */
  color: string | null;
  /**
   * Label colour for contained. Null means the section buttonTextColor, then on-primary.
   */
  labelColor: string | null;
  placement: CampaignChildPlacement | null;
  action: GetCampaign_campaign_blocks_CampaignButtonBlock_action | null;
  labelTranslations: GetCampaign_campaign_blocks_CampaignButtonBlock_labelTranslations[];
}

export type GetCampaign_campaign_blocks = GetCampaign_campaign_blocks_CampaignColumnBlock | GetCampaign_campaign_blocks_CampaignHeaderBlock | GetCampaign_campaign_blocks_CampaignFooterBlock | GetCampaign_campaign_blocks_CampaignHeroBlock | GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock | GetCampaign_campaign_blocks_CampaignVideoCarouselBlock | GetCampaign_campaign_blocks_CampaignJourneyListBlock | GetCampaign_campaign_blocks_CampaignAnalyticsBlock | GetCampaign_campaign_blocks_CampaignRegionHeaderBlock | GetCampaign_campaign_blocks_CampaignRegionShareBlock | GetCampaign_campaign_blocks_CampaignRichTextBlock | GetCampaign_campaign_blocks_CampaignColumnsBlock | GetCampaign_campaign_blocks_CampaignImageBlock | GetCampaign_campaign_blocks_CampaignFeaturedMediaBlock | GetCampaign_campaign_blocks_CampaignJourneyBlock | GetCampaign_campaign_blocks_CampaignVideoBlock | GetCampaign_campaign_blocks_CampaignTypographyBlock | GetCampaign_campaign_blocks_CampaignButtonBlock;

export interface GetCampaign_campaign_regions_languages_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetCampaign_campaign_regions_languages_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: GetCampaign_campaign_regions_languages_language_name[];
}

export interface GetCampaign_campaign_regions_languages_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  status: JourneyStatus;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
}

export interface GetCampaign_campaign_regions_languages_qrCode_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface GetCampaign_campaign_regions_languages_qrCode_shortLink {
  __typename: "ShortLink";
  id: string;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  domain: GetCampaign_campaign_regions_languages_qrCode_shortLink_domain;
}

export interface GetCampaign_campaign_regions_languages_qrCode {
  __typename: "QrCode";
  id: string;
  shortLink: GetCampaign_campaign_regions_languages_qrCode_shortLink;
}

export interface GetCampaign_campaign_regions_languages {
  __typename: "CampaignRegionLanguage";
  id: string;
  regionId: string;
  /**
   * api-languages Language id.
   */
  languageId: string;
  journeyId: string | null;
  /**
   * Snapshot of the linked journey's title; the journey's own language, not translated.
   */
  title: string | null;
  description: string | null;
  /**
   * True once an author changed the snapshot title or description by hand, so "Refresh from journey" asks before replacing them. Linking, unlinking and refreshing from the journey clear it.
   */
  snapshotEdited: boolean;
  qrCodeId: string | null;
  order: number;
  language: GetCampaign_campaign_regions_languages_language;
  journey: GetCampaign_campaign_regions_languages_journey | null;
  /**
   * The Campaign QR Code, present from the moment a journey is linked; its short link is the Share Link.
   */
  qrCode: GetCampaign_campaign_regions_languages_qrCode | null;
}

export interface GetCampaign_campaign_regions_countries_country_name {
  __typename: "CountryName";
  value: string;
}

export interface GetCampaign_campaign_regions_countries_country {
  __typename: "Country";
  id: string;
  flagPngSrc: string | null;
  name: GetCampaign_campaign_regions_countries_country_name[];
}

export interface GetCampaign_campaign_regions_countries {
  __typename: "CampaignRegionCountry";
  id: string;
  regionId: string;
  /**
   * api-languages Country id.
   */
  countryId: string;
  order: number;
  /**
   * The api-languages Country, resolved through federation: flag and translated name live there.
   */
  country: GetCampaign_campaign_regions_countries_country;
}

export interface GetCampaign_campaign_regions {
  __typename: "CampaignRegion";
  id: string;
  campaignId: string;
  /**
   * Required, at most 60 characters.
   */
  name: string;
  /**
   * Unique within the campaign. Changing it breaks links already shared to the region page.
   */
  slug: string;
  order: number;
  /**
   * Whether the region appears on the Region Switcher.
   */
  listed: boolean;
  /**
   * Share Languages in selector order.
   */
  languages: GetCampaign_campaign_regions_languages[];
  /**
   * Region Countries in chip order.
   */
  countries: GetCampaign_campaign_regions_countries[];
}

export interface GetCampaign_campaign_strings_valueTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface GetCampaign_campaign_strings {
  __typename: "CampaignString";
  id: string;
  key: CampaignStringKey;
  /**
   * Default-language wording, at most 200 characters.
   */
  value: string;
  valueTranslations: GetCampaign_campaign_strings_valueTranslations[];
}

export interface GetCampaign_campaign {
  __typename: "Campaign";
  id: string;
  teamId: string;
  /**
   * Default-language title; also the public page title. Required, at most 100 characters.
   */
  title: string;
  titleTranslations: GetCampaign_campaign_titleTranslations[];
  /**
   * Globally unique. The permanent Campaign Address is `/campaign/<slug>` on the root domain. Generated from the title; author-editable.
   */
  slug: string;
  status: CampaignStatus;
  /**
   * api-languages Language id; always one of `languages`. The default-language value of every Translated Field sits on the field itself.
   */
  defaultLanguageId: string;
  /**
   * First publish; never cleared by unpublish. Means "first went live", not "currently live".
   */
  publishedAt: any | null;
  /**
   * The eight most recently used picker colours, newest first, `#RRGGBB` uppercase, no duplicates. Picker convenience; never read by the public page.
   */
  palette: string[];
  createdAt: any;
  updatedAt: any;
  /**
   * Custom Domains that name this campaign as their Campaign Root, by name. The campaign stores no address; Settings reads this to show the domain form beside the permanent root-domain address.
   */
  customDomains: GetCampaign_campaign_customDomains[];
  /**
   * Owning team; the campaign is hard-deleted with it.
   */
  team: GetCampaign_campaign_team;
  /**
   * Page Languages in selector order.
   */
  languages: GetCampaign_campaign_languages[];
  /**
   * The one Campaign Theme row; created with the campaign.
   */
  theme: GetCampaign_campaign_theme;
  /**
   * Exactly the landing page and the Region Page.
   */
  pages: GetCampaign_campaign_pages[];
  /**
   * Every live Campaign Block of the campaign as one flat list (both pages, chrome, Region Lines, owned blocks), ordered by parentOrder; the client trees it by parentBlockId and partitions it by pageId / regionId.
   */
  blocks: GetCampaign_campaign_blocks[];
  /**
   * Every Campaign Region, listed and orphan, in switcher order.
   */
  regions: GetCampaign_campaign_regions[];
  /**
   * The seventeen Campaign Strings.
   */
  strings: GetCampaign_campaign_strings[];
}

export interface GetCampaign {
  /**
   * Read one Campaign by id in its full admin shape, draft or published.
   * 
   * Auth: campaign Read — any member or manager of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   */
  campaign: GetCampaign_campaign;
}

export interface GetCampaignVariables {
  id: string;
  languageId?: string | null;
}
