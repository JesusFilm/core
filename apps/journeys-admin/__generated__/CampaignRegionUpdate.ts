/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignRegionUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRegionUpdate
// ====================================================

export interface CampaignRegionUpdate_campaignRegionUpdate {
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
  /**
   * Whether the region appears on the Region Switcher.
   */
  listed: boolean;
}

export interface CampaignRegionUpdate {
  /**
   * Update a Campaign Region’s settings: the default-language name, the slug and whether it is listed on the Region Switcher. The slug never follows a name change; it moves only when given here, and links already shared to the old region address stop resolving. List and unlist are one-field changes with no confirmation.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `name`): empty or over 60 characters.
   * - BAD_USER_INPUT (field: `slug`): fails the shape, length or reserved-word checks, is taken by another region of the campaign (including the concurrent-update race on the unique constraint), or equals the slug of a journey in the campaign’s team.
   */
  campaignRegionUpdate: CampaignRegionUpdate_campaignRegionUpdate;
}

export interface CampaignRegionUpdateVariables {
  id: string;
  input: CampaignRegionUpdateInput;
}
