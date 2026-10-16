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
   * Campaign Root: the campaign served at `/` and `/<regionSlug>` on this domain; null when none.
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
