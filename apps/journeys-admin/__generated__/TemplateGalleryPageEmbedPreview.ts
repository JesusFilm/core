/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TemplateGalleryPageEmbedPreview
// ====================================================

export interface TemplateGalleryPageEmbedPreview {
  /**
   * Resolve a pasted embed URL to its normalized iframe `embedUrl` without saving — for the collection media link-field preview. Runs the same validation and normalization as the create/update `media` link path (https check, host allowlist, provider normalization for Canva/YouTube/Google Slides). Authenticated callers only.
   * 
   * Errors (same reason codes as the save path):
   * - BAD_USER_INPUT (field: `url`): URL is not https.
   * - BAD_USER_INPUT / EMBED_HOST_NOT_ALLOWED: host is not in the embed allowlist.
   * - BAD_USER_INPUT / CANVA_UNAVAILABLE, GOOGLE_SLIDES_NOT_PUBLISHED, etc.: provider normalization failed.
   */
  templateGalleryPageEmbedPreview: string;
}

export interface TemplateGalleryPageEmbedPreviewVariables {
  url: string;
}
