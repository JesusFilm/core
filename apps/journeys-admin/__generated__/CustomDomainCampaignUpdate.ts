/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CustomDomainCampaignUpdate
// ====================================================

export interface CustomDomainCampaignUpdate_customDomainUpdate {
  __typename: "CustomDomain";
  id: string;
  /**
   * Campaign Root: the campaign served at `/` and `/<regionSlug>` on this domain; null when none, or when the campaign is a draft and the caller cannot read the domain team's campaigns.
   */
  campaignId: string | null;
}

export interface CustomDomainCampaignUpdate {
  customDomainUpdate: CustomDomainCampaignUpdate_customDomainUpdate;
}

export interface CustomDomainCampaignUpdateVariables {
  id: string;
  campaignId?: string | null;
}
