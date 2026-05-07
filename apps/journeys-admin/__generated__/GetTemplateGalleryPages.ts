/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTemplateGalleryPages
// ====================================================

export interface GetTemplateGalleryPages_templateGalleryPages_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface GetTemplateGalleryPages_templateGalleryPages_templates {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  primaryImageBlock: GetTemplateGalleryPages_templateGalleryPages_templates_primaryImageBlock | null;
}

export interface GetTemplateGalleryPages_templateGalleryPages {
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
  templates: GetTemplateGalleryPages_templateGalleryPages_templates[];
}

export interface GetTemplateGalleryPages {
  /**
   * List all TemplateGalleryPages owned by a team — both `draft` and `published` rows — ordered by `createdAt` descending.
   * 
   * Auth: caller must be a member of the requested team.
   */
  templateGalleryPages: GetTemplateGalleryPages_templateGalleryPages[];
}

export interface GetTemplateGalleryPagesVariables {
  teamId: string;
}
