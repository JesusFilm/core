/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomDomainCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignDomainCreate
// ====================================================

export interface CampaignDomainCreate_customDomainCreate {
  __typename: "CustomDomain";
  id: string;
  name: string;
  apexName: string;
}

export interface CampaignDomainCreate {
  customDomainCreate: CampaignDomainCreate_customDomainCreate;
}

export interface CampaignDomainCreateVariables {
  input: CustomDomainCreateInput;
}
