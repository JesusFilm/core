/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignBackgroundKind, CampaignBackgroundOverlay } from "./globalTypes";

// ====================================================
// GraphQL fragment: CampaignSectionStyleFields
// ====================================================

export interface CampaignSectionStyleFields {
  __typename: "CampaignHeaderBlock" | "CampaignFooterBlock" | "CampaignHeroBlock" | "CampaignRegionSwitcherBlock" | "CampaignVideoCarouselBlock" | "CampaignJourneyListBlock" | "CampaignAnalyticsBlock" | "CampaignRegionHeaderBlock" | "CampaignRegionShareBlock";
  id: string;
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
