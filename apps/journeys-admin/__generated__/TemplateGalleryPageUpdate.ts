/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageUpdateInput, TemplateGalleryPageStatus, TemplateGalleryPageMediaType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageUpdate
// ====================================================

export interface TemplateGalleryPageUpdate_templateGalleryPageUpdate_media {
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
  /**
   * Video name, denormalized from MuxVideo at save time. Populated for `mux` when Mux has a name; null for `link`.
   */
  muxName: string | null;
  /**
   * Video duration in seconds, denormalized from MuxVideo at save time. Populated for `mux` when Mux reports a duration; null for `link`.
   */
  muxDuration: number | null;
}

export interface TemplateGalleryPageUpdate_templateGalleryPageUpdate_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface TemplateGalleryPageUpdate_templateGalleryPageUpdate_templates {
  __typename: "TemplateGalleryItem";
  id: string;
  title: string;
  primaryImageBlock: TemplateGalleryPageUpdate_templateGalleryPageUpdate_templates_primaryImageBlock | null;
}

export interface TemplateGalleryPageUpdate_templateGalleryPageUpdate {
  __typename: "TemplateGalleryPageAdmin";
  /**
   * Stable UUID identifier.
   */
  id: string;
  /**
   * Display title shown in admin UI and on the public page.
   */
  title: string;
  /**
   * Long-form description shown on the public page. Defaults to empty string.
   */
  description: string;
  /**
   * URL-safe identifier. The public page is reached at `/collections/<slug>`. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, and must not be in the reserved list. Mutable after publish — changing it breaks any external links to the old URL.
   */
  slug: string;
  /**
   * `draft` hides the page from the public renderer; `published` exposes it via `templateGalleryPageBySlug`.
   */
  status: TemplateGalleryPageStatus;
  /**
   * Display name of the team or person credited as the page creator.
   */
  creatorName: string;
  /**
   * Optional https URL of the creator avatar image. Plain string (not a Block FK) — survives independently of any owning Block. https-only on write.
   */
  creatorImageSrc: string | null;
  /**
   * Optional alt text for the creator avatar.
   */
  creatorImageAlt: string | null;
  /**
   * Embedded media shown on the public page. `null` for legacy rows that predate the multi-type embed (which used the deprecated `mediaUrl` scalar).
   */
  media: TemplateGalleryPageUpdate_templateGalleryPageUpdate_media | null;
  /**
   * Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the page has not yet been published.
   */
  publishedAt: any | null;
  createdAt: any;
  updatedAt: any;
  /**
   * Templates currently assigned to this page, in display order. Read-time filtered to same-team, non-soft-deleted, published, template-flagged journeys only. Each item is the narrow `TemplateGalleryItem` DTO, NOT the full `Journey` type.
   */
  templates: TemplateGalleryPageUpdate_templateGalleryPageUpdate_templates[];
}

export interface TemplateGalleryPageUpdate {
  /**
   * Update editable fields of a TemplateGalleryPage. All input fields are optional: a field omitted leaves the existing value alone, a field set to `null` clears it (where the field is nullable). When `input.journeyIds` is provided, the page's template list is replaced — existing assignments are deleted and recreated in the given order. Single-membership is enforced: if any supplied journey id is currently a member of another TemplateGalleryPage, the call fails before any write. Allowed on both `draft` and `published` pages (publishers can correct typos and curate the template list while live).
   * 
   * Auth: caller must be a member of the page's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the page's team.
   * - BAD_USER_INPUT (field: `slug`): user-supplied slug fails shape, length, reserved-word, or uniqueness checks — including the concurrent-Update race where two callers pass the same slug and the second one trips the DB unique constraint at commit time.
   * - BAD_USER_INPUT (field: `mediaUrl` / `creatorImageSrc`): URL is not https.
   * - CONFLICT (field: `journeyIds`; extension `journeyId` carries the offending id): one of the supplied journeys is already a member of another TemplateGalleryPage.
   */
  templateGalleryPageUpdate: TemplateGalleryPageUpdate_templateGalleryPageUpdate;
}

export interface TemplateGalleryPageUpdateVariables {
  id: string;
  input: TemplateGalleryPageUpdateInput;
}
