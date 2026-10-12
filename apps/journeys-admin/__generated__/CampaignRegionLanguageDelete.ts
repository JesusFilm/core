/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignRegionLanguageDelete
// ====================================================

export interface CampaignRegionLanguageDelete_campaignRegionLanguageDelete {
  __typename: "CampaignRegionLanguage";
  id: string;
  regionId: string;
}

export interface CampaignRegionLanguageDelete {
  /**
   * Remove a Share Language from a Campaign Region. Its Campaign QR Code and short link are deleted with it, as `qrCodeDelete` does; the linked journey is untouched. The remaining languages are renumbered. Returns the deleted row; only its scalar fields are readable.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   */
  campaignRegionLanguageDelete: CampaignRegionLanguageDelete_campaignRegionLanguageDelete;
}

export interface CampaignRegionLanguageDeleteVariables {
  id: string;
}
