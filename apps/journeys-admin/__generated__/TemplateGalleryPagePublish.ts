/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPagePublish
// ====================================================

export interface TemplateGalleryPagePublish_templateGalleryPagePublish {
  __typename: "TemplateGalleryPage";
  /**
   * Stable UUID identifier.
   */
  id: string;
  /**
   * `draft` hides the page from the public renderer; `published` exposes it via `templateGalleryPageBySlug`.
   */
  status: TemplateGalleryPageStatus;
  /**
   * Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the page has not yet been published.
   */
  publishedAt: any | null;
  updatedAt: any;
  /**
   * URL-safe identifier. The public page is reached at `/collections/<slug>`. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, and must not be in the reserved list. Mutable after publish — changing it breaks any external links to the old URL.
   */
  slug: string;
}

export interface TemplateGalleryPagePublish {
  /**
   * Transition a `draft` page to `published`, stamping `publishedAt` on the first publish only. Idempotent: calling on an already-published page is a no-op (no state change, no re-stamp of `publishedAt`).
   * 
   * Auth: caller must be a member of the page's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve, or the page was deleted between the auth-fetch and the canonical re-read.
   * - FORBIDDEN: caller is not in the page's team.
   */
  templateGalleryPagePublish: TemplateGalleryPagePublish_templateGalleryPagePublish;
}

export interface TemplateGalleryPagePublishVariables {
  id: string;
}
