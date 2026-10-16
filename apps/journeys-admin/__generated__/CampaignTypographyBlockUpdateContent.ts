/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTypographyBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignTypographyBlockUpdateContent
// ====================================================

export interface CampaignTypographyBlockUpdateContent_campaignTypographyBlockUpdate {
  __typename: "CampaignTypographyBlock";
  id: string;
  content: string;
}

export interface CampaignTypographyBlockUpdateContent {
  /**
   * Update a text block’s default-language content, variant, alignment, colour or placement. Only the given fields change; translations are untouched.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignTypographyBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `content`): over 2000 characters.
   * - BAD_USER_INPUT (field: `variant`, `align`, `color`, `placement`): the value fails its rule.
   */
  campaignTypographyBlockUpdate: CampaignTypographyBlockUpdateContent_campaignTypographyBlockUpdate;
}

export interface CampaignTypographyBlockUpdateContentVariables {
  id: string;
  input: CampaignTypographyBlockUpdateInput;
}
