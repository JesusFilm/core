/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageAssignJourney
// ====================================================

export interface TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney_templates {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  primaryImageBlock: TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney_templates_primaryImageBlock | null;
}

export interface TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney {
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
   * Optional https URL of a hero/cover media asset shown on the public page. https-only on write.
   */
  mediaUrl: string | null;
  /**
   * Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the page has not yet been published.
   */
  publishedAt: any | null;
  createdAt: any;
  updatedAt: any;
  /**
   * Templates currently assigned to this page, in display order. Read-time filtered to same-team, non-soft-deleted, published, template-flagged journeys only — a journey transferred to another team or unflagged from `template` after being added is silently dropped from this list.
   */
  templates: TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney_templates[];
}

export interface TemplateGalleryPageAssignJourney {
  /**
   * Assign a journey to a TemplateGalleryPage, or unassign it. A journey may belong to at most one page at a time (single-membership invariant).
   * 
   * - `pageId` set: move the journey into that page. The new row appends at the end of the target's display order; if the journey was already in another page (cross-page move) it is removed from the source page first. Both pages are renumbered to contiguous orders 0..N-1 after the change. Allowed on both `draft` and `published` pages.
   * - `pageId` null/omitted: unassign — remove the journey from whatever page it is currently in. Returns null (idempotent no-op) if the journey is not in any page.
   * - Same-page-already: idempotent return; no row changes.
   * 
   * Auth: caller must be a member of the target page's team (and, on a cross-page move, also of the source page's team).
   * 
   * Errors:
   * - NOT_FOUND: target `pageId` does not resolve.
   * - NOT_FOUND (field: `journeyId`): journey does not exist or is soft-deleted.
   * - BAD_USER_INPUT (field: `journeyId`): journey is not flagged as a template.
   * - FORBIDDEN: caller is not in the target page's team.
   * - FORBIDDEN (field: `journeyId`): journey belongs to a different team than the target page.
   */
  templateGalleryPageAssignJourney: TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney | null;
}

export interface TemplateGalleryPageAssignJourneyVariables {
  journeyId: string;
  pageId?: string | null;
}
