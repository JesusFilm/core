/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignRichTextBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRichTextBlockUpdateText
// ====================================================

export interface CampaignRichTextBlockUpdateText_campaignRichTextBlockUpdate {
  __typename: "CampaignRichTextBlock";
  id: string;
  title: string | null;
  /**
   * Paragraphs separated by blank lines.
   */
  richTextContent: string | null;
}

export interface CampaignRichTextBlockUpdateText {
  /**
   * Update the rich text section’s default-language title or content, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignRichTextBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title` / `content`): over 150 / 5000 characters.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a CampaignImageBlock this section owns (live, or soft-deleted by an earlier swap), or the block another of its slots holds.
   */
  campaignRichTextBlockUpdate: CampaignRichTextBlockUpdateText_campaignRichTextBlockUpdate;
}

export interface CampaignRichTextBlockUpdateTextVariables {
  id: string;
  input: CampaignRichTextBlockUpdateInput;
}
