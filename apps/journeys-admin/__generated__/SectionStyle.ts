/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignBackgroundKind } from "./globalTypes";

// ====================================================
// GraphQL fragment: SectionStyle
// ====================================================

export interface SectionStyle {
  __typename: "CampaignHeaderBlock" | "CampaignFooterBlock" | "CampaignHeroBlock" | "CampaignRegionSwitcherBlock" | "CampaignVideoCarouselBlock" | "CampaignJourneyListBlock" | "CampaignAnalyticsBlock" | "CampaignRegionHeaderBlock" | "CampaignRegionShareBlock" | "CampaignImageBlock";
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
}
