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
   * Remove an unlinked Share Language from a Campaign Region; a linked one must be unlinked first. A Campaign QR Code the language kept from an earlier link goes with it: its `QrCode` row is deleted in the same transaction and its short link queued for deletion once it commits, so printed copies stop redirecting; a QR code another Share Language still holds is kept. There is no restore, so the editor confirms first when the language has a QR code; a later link of a re-added language mints a new one. The journey and its own QR codes are untouched. The remaining languages are renumbered. Returns the deleted row; only its scalar fields are readable.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `id`): "Unlink the journey before removing this language."
   */
  campaignRegionLanguageDelete: CampaignRegionLanguageDelete_campaignRegionLanguageDelete;
}

export interface CampaignRegionLanguageDeleteVariables {
  id: string;
}
