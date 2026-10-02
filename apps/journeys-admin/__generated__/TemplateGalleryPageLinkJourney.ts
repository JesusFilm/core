/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus, TemplateGalleryPageMediaType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageLinkJourney
// ====================================================

export interface TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney_media {
  __typename: "TemplateGalleryPageMedia";
  id: string;
  /**
   * Active selector for which payload renders.
   */
  type: TemplateGalleryPageMediaType;
  /**
   * Raw Mux video id of the stored upload payload. Authenticated-only — never exposed on the public type.
   */
  muxVideoId: string | null;
  /**
   * The stored link payload. May be retained while `type` is `mux`/`none` so the editor can offer switching back.
   */
  embedUrl: string | null;
  /**
   * Mux playback ID denormalized at save time. Tracks `muxVideoId`.
   */
  muxPlaybackId: string | null;
  /**
   * Video name denormalized at save time. Tracks `muxVideoId`.
   */
  muxName: string | null;
  /**
   * Video duration in seconds denormalized at save time. Tracks `muxVideoId`.
   */
  muxDuration: number | null;
}

export interface TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney_templates {
  __typename: "TemplateGalleryItem";
  id: string;
  title: string;
  primaryImageBlock: TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney_templates_primaryImageBlock | null;
}

export interface TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney_memberships {
  __typename: "TemplateGalleryPageMembership";
  journeyId: string;
  /**
   * True when this page is the journey's home; false when it is a link.
   */
  isHome: boolean;
}

export interface TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney {
  __typename: "TemplateGalleryPage";
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
   * Embedded media with both retained payload slots and the raw `muxVideoId`, so the editor can restore a parked link/upload. `null` only when the page has no media row.
   */
  media: TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney_media | null;
  /**
   * Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the page has not yet been published.
   */
  publishedAt: any | null;
  createdAt: any;
  updatedAt: any;
  /**
   * Templates currently assigned to this page, in display order. Read-time filtered to same-team, non-soft-deleted, published, template-flagged journeys only — a journey transferred to another team or unflagged from `template` after being added is silently dropped from this list. Each item is the narrow `TemplateGalleryItem` public DTO, NOT the full `Journey` type.
   */
  templates: TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney_templates[];
  /**
   * Every journey on this page with whether this page is its home. A journey has exactly one home across all pages; its other memberships are links. Home is presentational (the admin draws links greyed) and carries no behaviour. Unlike `templates`, this list is not filtered by the journey's status.
   */
  memberships: TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney_memberships[];
}

export interface TemplateGalleryPageLinkJourney {
  /**
   * Add a journey to a TemplateGalleryPage without removing it from any other page. The new row appends at the end of the page's display order and becomes the journey's home when it has none yet, otherwise a link (see `TemplateGalleryPage.memberships`). Idempotent: if the journey is already on the page nothing changes. Allowed on both `draft` and `published` pages.
   * 
   * Auth: caller must be a member of the page's team.
   * 
   * Errors:
   * - NOT_FOUND: `pageId` does not resolve.
   * - NOT_FOUND (field: `journeyId`): journey does not exist or is soft-deleted.
   * - BAD_USER_INPUT (field: `journeyId`): journey is not flagged as a template.
   * - FORBIDDEN: caller is not in the page's team.
   * - FORBIDDEN (field: `journeyId`): journey belongs to a different team than the page.
   */
  templateGalleryPageLinkJourney: TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney;
}

export interface TemplateGalleryPageLinkJourneyVariables {
  journeyId: string;
  pageId: string;
}
