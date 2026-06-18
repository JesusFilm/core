/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageReorderTemplate
// ====================================================

export interface TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate_templates {
  __typename: "TemplateGalleryItem";
  id: string;
  title: string;
  primaryImageBlock: TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate_templates_primaryImageBlock | null;
}

export interface TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate {
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
   * Templates currently assigned to this page, in display order. Read-time filtered to same-team, non-soft-deleted, published, template-flagged journeys only — a journey transferred to another team or unflagged from `template` after being added is silently dropped from this list. Each item is the narrow `TemplateGalleryItem` public DTO, NOT the full `Journey` type.
   */
  templates: TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate_templates[];
}

export interface TemplateGalleryPageReorderTemplate {
  /**
   * Reorder a single template within a TemplateGalleryPage by addressing the destination as a 0-based display index. The page is renumbered to contiguous orders 0..N-1 after the move so the next reorder sees a clean range. Allowed on both `draft` and `published` pages (the frontend gates the UX; the backend accepts unconditionally for symmetry with `templateGalleryPageUpdate` and `templateGalleryPageAssignJourney`).
   * 
   * Idempotent: when the journey is already at the requested display index, the call is a no-op.
   * 
   * Auth: caller must be a member of the page's team.
   * 
   * Errors:
   * - NOT_FOUND: `pageId` does not resolve.
   * - FORBIDDEN: caller is not in the page's team.
   * - BAD_USER_INPUT (field: `journeyId`): journey is not currently a member of the page.
   * - BAD_USER_INPUT (field: `order`): order is out of range; must satisfy `0 <= order < count(templates in page)`.
   */
  templateGalleryPageReorderTemplate: TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate;
}

export interface TemplateGalleryPageReorderTemplateVariables {
  pageId: string;
  journeyId: string;
  order: number;
}
