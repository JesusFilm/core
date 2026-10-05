/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignDelete
// ====================================================

export interface CampaignDelete_campaignDelete {
  __typename: "Campaign";
  id: string;
}

export interface CampaignDelete {
  /**
   * Hard-delete a Campaign. The database cascade removes its blocks, actions, pages, languages, theme, strings, regions and their rows; a Custom Domain naming it as Campaign Root is released, and the linked journeys and their QR codes are untouched. Returns the deleted campaign as its last canonical view.
   * 
   * Auth: campaign Delete — a manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not a manager of the team.
   */
  campaignDelete: CampaignDelete_campaignDelete;
}

export interface CampaignDeleteVariables {
  id: string;
}
