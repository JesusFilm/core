/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignStatus, UserTeamRole, ThemeMode, CampaignRadius, CampaignButtonRadius, CampaignPageKind, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, CampaignJourneyListDisplay, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCampaign
// ====================================================

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
}

export interface GetCampaign_campaign_blocks_CampaignHeroBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
}

export interface GetCampaign_campaign_blocks_CampaignHeroBlock_ledeTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
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

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
}

export interface GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
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
  videoVariantLanguageId: string | null;
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
}

export interface GetCampaign_campaign_blocks_CampaignJourneyListBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
}

export interface GetCampaign_campaign_blocks_CampaignJourneyListBlock_ledeTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
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
}

export interface GetCampaign_campaign_blocks_CampaignAnalyticsBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
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
}

export interface GetCampaign_campaign_blocks_CampaignRegionShareBlock_introTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
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

export interface GetCampaign_campaign_blocks_CampaignTypographyBlock_contentTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
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

export type GetCampaign_campaign_blocks = GetCampaign_campaign_blocks_CampaignHeaderBlock | GetCampaign_campaign_blocks_CampaignFooterBlock | GetCampaign_campaign_blocks_CampaignHeroBlock | GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock | GetCampaign_campaign_blocks_CampaignVideoCarouselBlock | GetCampaign_campaign_blocks_CampaignJourneyListBlock | GetCampaign_campaign_blocks_CampaignAnalyticsBlock | GetCampaign_campaign_blocks_CampaignRegionHeaderBlock | GetCampaign_campaign_blocks_CampaignRegionShareBlock | GetCampaign_campaign_blocks_CampaignTypographyBlock | GetCampaign_campaign_blocks_CampaignButtonBlock;

export interface GetCampaign_campaign_regions {
  __typename: "CampaignRegion";
  id: string;
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
}

export interface GetCampaign_campaign {
  __typename: "Campaign";
  id: string;
  teamId: string;
  /**
   * Default-language title; also the public page title. Required, at most 100 characters.
   */
  title: string;
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
  createdAt: any;
  updatedAt: any;
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
}
