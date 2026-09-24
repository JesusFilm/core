/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL fragment: CampaignJourneyItemFields
// ====================================================

export interface CampaignJourneyItemFields_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignJourneyItemFields_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignJourneyItemFields_language_name[];
}

export interface CampaignJourneyItemFields_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface CampaignJourneyItemFields {
  __typename: "CampaignJourneyItem";
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: JourneyStatus;
  createdAt: any;
  customizable: boolean | null;
  language: CampaignJourneyItemFields_language;
  primaryImageBlock: CampaignJourneyItemFields_primaryImageBlock | null;
}
