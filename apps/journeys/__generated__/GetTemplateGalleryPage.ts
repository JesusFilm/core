/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageMediaType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTemplateGalleryPage
// ====================================================

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_media {
  __typename: "TemplateGalleryPageMedia";
  id: string;
  /**
   * Discriminator for which underlying field is populated.
   */
  type: TemplateGalleryPageMediaType;
  /**
   * Server-normalized iframe URL. Populated for `link`; null for `mux`.
   */
  embedUrl: string | null;
  /**
   * Mux playback ID, denormalized from MuxVideo at save time so public reads never cross to the media DB. Populated for `mux`; null for `link`.
   */
  muxPlaybackId: string | null;
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_templates_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_templates_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: GetTemplateGalleryPage_templateGalleryPageBySlug_templates_language_name[];
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_templates {
  __typename: "TemplateGalleryItem";
  id: string;
  title: string;
  description: string | null;
  slug: string;
  createdAt: any;
  template: boolean | null;
  customizable: boolean | null;
  website: boolean | null;
  language: GetTemplateGalleryPage_templateGalleryPageBySlug_templates_language;
  primaryImageBlock: GetTemplateGalleryPage_templateGalleryPageBySlug_templates_primaryImageBlock | null;
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug {
  __typename: "TemplateGalleryPagePublic";
  /**
   * Stable UUID identifier.
   */
  id: string;
  /**
   * URL-safe identifier. The public page is reached at `/collections/<slug>`. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, and must not be in the reserved list. Mutable after publish — changing it breaks any external links to the old URL.
   */
  slug: string;
  /**
   * Display title shown in admin UI and on the public page.
   */
  title: string;
  /**
   * Long-form description shown on the public page. Defaults to empty string.
   */
  description: string;
  /**
   * Display name of the team or person credited as the page creator.
   */
  creatorName: string;
  /**
   * Embedded media shown on the public page. `null` for legacy rows that predate the multi-type embed (which used the deprecated `mediaUrl` scalar).
   */
  media: GetTemplateGalleryPage_templateGalleryPageBySlug_media | null;
  /**
   * Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the page has not yet been published.
   */
  publishedAt: any | null;
  /**
   * Optional https URL of the creator avatar image. Plain string (not a Block FK) — survives independently of any owning Block. https-only on write.
   */
  creatorImageSrc: string | null;
  /**
   * Optional alt text for the creator avatar.
   */
  creatorImageAlt: string | null;
  /**
   * Templates currently assigned to this page, in display order. Read-time filtered to same-team, non-soft-deleted, published, template-flagged journeys only. Each item is the narrow `TemplateGalleryItem` DTO, NOT the full `Journey` type.
   */
  templates: GetTemplateGalleryPage_templateGalleryPageBySlug_templates[];
}

export interface GetTemplateGalleryPage {
  /**
   * Public, unauthenticated read by slug. Returns the TemplateGalleryPage with the given slug, but ONLY if the page is currently `published`. Returns null for: unknown slug, draft slug, malformed slug (does not match `^[a-z0-9]+(-[a-z0-9]+)*$`), or slug exceeding 200 characters. Authenticated readers fetching their own team's drafts should use `templateGalleryPage(id)` or `templateGalleryPages(teamId)` instead.
   */
  templateGalleryPageBySlug: GetTemplateGalleryPage_templateGalleryPageBySlug | null;
}

export interface GetTemplateGalleryPageVariables {
  slug: string;
}
