/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignCreateInput, CampaignTextSource, CampaignStatus, UserTeamRole, ThemeMode, CampaignRadius, CampaignButtonRadius, CampaignPageKind, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, CampaignJourneyListDisplay, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignStringKey } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignCreate
// ====================================================

export interface CampaignCreate_campaignCreate_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_team_userTeams_user {
  __typename: "AuthenticatedUser" | "AnonymousUser";
  id: string;
}

export interface CampaignCreate_campaignCreate_team_userTeams {
  __typename: "UserTeam";
  id: string;
  role: UserTeamRole;
  user: CampaignCreate_campaignCreate_team_userTeams_user;
}

export interface CampaignCreate_campaignCreate_team {
  __typename: "Team";
  id: string;
  userTeams: CampaignCreate_campaignCreate_team_userTeams[];
}

export interface CampaignCreate_campaignCreate_languages_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignCreate_campaignCreate_languages_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignCreate_campaignCreate_languages_language_name[];
}

export interface CampaignCreate_campaignCreate_languages {
  __typename: "CampaignLanguage";
  id: string;
  /**
   * api-languages Language id.
   */
  languageId: string;
  order: number;
  language: CampaignCreate_campaignCreate_languages_language;
}

export interface CampaignCreate_campaignCreate_theme {
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

export interface CampaignCreate_campaignCreate_pages {
  __typename: "CampaignPage";
  id: string;
  kind: CampaignPageKind;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignHeaderBlock {
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

export interface CampaignCreate_campaignCreate_blocks_CampaignFooterBlock {
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

export interface CampaignCreate_campaignCreate_blocks_CampaignHeroBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignHeroBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignHeroBlock_ledeTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignHeroBlock {
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
  eyebrowTranslations: CampaignCreate_campaignCreate_blocks_CampaignHeroBlock_eyebrowTranslations[];
  titleTranslations: CampaignCreate_campaignCreate_blocks_CampaignHeroBlock_titleTranslations[];
  ledeTranslations: CampaignCreate_campaignCreate_blocks_CampaignHeroBlock_ledeTranslations[];
}

export interface CampaignCreate_campaignCreate_blocks_CampaignRegionSwitcherBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignRegionSwitcherBlock {
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
  titleTranslations: CampaignCreate_campaignCreate_blocks_CampaignRegionSwitcherBlock_titleTranslations[];
}

export interface CampaignCreate_campaignCreate_blocks_CampaignVideoCarouselBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignVideoCarouselBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignVideoCarouselBlock {
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
  eyebrowTranslations: CampaignCreate_campaignCreate_blocks_CampaignVideoCarouselBlock_eyebrowTranslations[];
  titleTranslations: CampaignCreate_campaignCreate_blocks_CampaignVideoCarouselBlock_titleTranslations[];
}

export interface CampaignCreate_campaignCreate_blocks_CampaignJourneyListBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignJourneyListBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignJourneyListBlock_ledeTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignJourneyListBlock {
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
  eyebrowTranslations: CampaignCreate_campaignCreate_blocks_CampaignJourneyListBlock_eyebrowTranslations[];
  titleTranslations: CampaignCreate_campaignCreate_blocks_CampaignJourneyListBlock_titleTranslations[];
  ledeTranslations: CampaignCreate_campaignCreate_blocks_CampaignJourneyListBlock_ledeTranslations[];
}

export interface CampaignCreate_campaignCreate_blocks_CampaignAnalyticsBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignAnalyticsBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignAnalyticsBlock {
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
  eyebrowTranslations: CampaignCreate_campaignCreate_blocks_CampaignAnalyticsBlock_eyebrowTranslations[];
  titleTranslations: CampaignCreate_campaignCreate_blocks_CampaignAnalyticsBlock_titleTranslations[];
}

export interface CampaignCreate_campaignCreate_blocks_CampaignRegionHeaderBlock_introTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignRegionHeaderBlock {
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
  introTranslations: CampaignCreate_campaignCreate_blocks_CampaignRegionHeaderBlock_introTranslations[];
}

export interface CampaignCreate_campaignCreate_blocks_CampaignRegionShareBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignRegionShareBlock_introTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignRegionShareBlock {
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
  titleTranslations: CampaignCreate_campaignCreate_blocks_CampaignRegionShareBlock_titleTranslations[];
  introTranslations: CampaignCreate_campaignCreate_blocks_CampaignRegionShareBlock_introTranslations[];
}

export interface CampaignCreate_campaignCreate_blocks_CampaignTypographyBlock_contentTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignTypographyBlock {
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
  contentTranslations: CampaignCreate_campaignCreate_blocks_CampaignTypographyBlock_contentTranslations[];
}

export interface CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_action_CampaignLinkAction {
  __typename: "CampaignLinkAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  url: string;
  target: string | null;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_action_CampaignScrollToBlockAction {
  __typename: "CampaignScrollToBlockAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  blockId: string;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_action_CampaignNavigateToRegionAction {
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

export type CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_action = CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_action_CampaignLinkAction | CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_action_CampaignScrollToBlockAction | CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_action_CampaignNavigateToRegionAction;

export interface CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_labelTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_blocks_CampaignButtonBlock {
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
  action: CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_action | null;
  labelTranslations: CampaignCreate_campaignCreate_blocks_CampaignButtonBlock_labelTranslations[];
}

export type CampaignCreate_campaignCreate_blocks = CampaignCreate_campaignCreate_blocks_CampaignHeaderBlock | CampaignCreate_campaignCreate_blocks_CampaignFooterBlock | CampaignCreate_campaignCreate_blocks_CampaignHeroBlock | CampaignCreate_campaignCreate_blocks_CampaignRegionSwitcherBlock | CampaignCreate_campaignCreate_blocks_CampaignVideoCarouselBlock | CampaignCreate_campaignCreate_blocks_CampaignJourneyListBlock | CampaignCreate_campaignCreate_blocks_CampaignAnalyticsBlock | CampaignCreate_campaignCreate_blocks_CampaignRegionHeaderBlock | CampaignCreate_campaignCreate_blocks_CampaignRegionShareBlock | CampaignCreate_campaignCreate_blocks_CampaignTypographyBlock | CampaignCreate_campaignCreate_blocks_CampaignButtonBlock;

export interface CampaignCreate_campaignCreate_regions_countries_country_name {
  __typename: "CountryName";
  value: string;
}

export interface CampaignCreate_campaignCreate_regions_countries_country {
  __typename: "Country";
  id: string;
  flagPngSrc: string | null;
  name: CampaignCreate_campaignCreate_regions_countries_country_name[];
}

export interface CampaignCreate_campaignCreate_regions_countries {
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
  country: CampaignCreate_campaignCreate_regions_countries_country;
}

export interface CampaignCreate_campaignCreate_regions {
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
   * Region Countries in chip order.
   */
  countries: CampaignCreate_campaignCreate_regions_countries[];
}

export interface CampaignCreate_campaignCreate_strings_valueTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignCreate_campaignCreate_strings {
  __typename: "CampaignString";
  id: string;
  key: CampaignStringKey;
  /**
   * Default-language wording, at most 200 characters.
   */
  value: string;
  valueTranslations: CampaignCreate_campaignCreate_strings_valueTranslations[];
}

export interface CampaignCreate_campaignCreate {
  __typename: "Campaign";
  id: string;
  teamId: string;
  /**
   * Default-language title; also the public page title. Required, at most 100 characters.
   */
  title: string;
  titleTranslations: CampaignCreate_campaignCreate_titleTranslations[];
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
   * Owning team; the campaign is hard-deleted with it.
   */
  team: CampaignCreate_campaignCreate_team;
  /**
   * Page Languages in selector order.
   */
  languages: CampaignCreate_campaignCreate_languages[];
  /**
   * The one Campaign Theme row; created with the campaign.
   */
  theme: CampaignCreate_campaignCreate_theme;
  /**
   * Exactly the landing page and the Region Page.
   */
  pages: CampaignCreate_campaignCreate_pages[];
  /**
   * Every live Campaign Block of the campaign as one flat list (both pages, chrome, Region Lines, owned blocks), ordered by parentOrder; the client trees it by parentBlockId and partitions it by pageId / regionId.
   */
  blocks: CampaignCreate_campaignCreate_blocks[];
  /**
   * Every Campaign Region, listed and orphan, in switcher order.
   */
  regions: CampaignCreate_campaignCreate_regions[];
  /**
   * The seventeen Campaign Strings.
   */
  strings: CampaignCreate_campaignCreate_strings[];
}

export interface CampaignCreate {
  /**
   * Create a draft Campaign born complete (the Campaign Seed): the generated slug, one Campaign Language, the Light Campaign Theme and a Palette drawn from it, both Campaign Pages, the Campaign Chrome, the seventeen Campaign Strings and the starter sections, all in one transaction. No regions, media or journeys. Returns the full campaign so the editor opens it with no second fetch.
   * 
   * Auth: campaign Create — any member or manager of `input.teamId`.
   * 
   * Errors:
   * - FORBIDDEN: caller is not in the team.
   * - NOT_FOUND: the team does not exist.
   * - BAD_USER_INPUT (field: `title`): empty or over 100 characters.
   * - BAD_USER_INPUT (field: `defaultLanguageId`): not an api-languages language.
   * - BAD_USER_INPUT (field: `slug`): the title normalises to empty or to a reserved word.
   */
  campaignCreate: CampaignCreate_campaignCreate;
}

export interface CampaignCreateVariables {
  input: CampaignCreateInput;
}
