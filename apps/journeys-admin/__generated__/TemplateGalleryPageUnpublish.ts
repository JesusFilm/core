/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageUnpublish
// ====================================================

export interface TemplateGalleryPageUnpublish_templateGalleryPageUnpublish {
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
}

export interface TemplateGalleryPageUnpublish {
  /**
   * Transition a `published` page back to `draft`. `publishedAt` is intentionally NOT cleared — the historical first-publish timestamp is preserved across unpublish/republish cycles. Idempotent: calling on an already-draft page is a no-op.
   * 
   * Auth: caller must be a member of the page's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve, or the page was deleted between the auth-fetch and the canonical re-read.
   * - FORBIDDEN: caller is not in the page's team.
   */
  templateGalleryPageUnpublish: TemplateGalleryPageUnpublish_templateGalleryPageUnpublish;
}

export interface TemplateGalleryPageUnpublishVariables {
  id: string;
}
