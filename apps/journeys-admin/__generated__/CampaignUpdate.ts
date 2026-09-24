/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignUpdateInput } from "./globalTypes";
import { CampaignFields } from "./CampaignFields";

// ====================================================
// GraphQL mutation operation: CampaignUpdate
// ====================================================

export type CampaignUpdate_campaignUpdate = CampaignFields;

export interface CampaignUpdate {
  campaignUpdate: CampaignUpdate_campaignUpdate;
}

export interface CampaignUpdateVariables {
  id: string;
  input: CampaignUpdateInput;
}
