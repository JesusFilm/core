/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Service } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTags
// ====================================================

export interface GetTags_tags_name_language {
  __typename: "Language";
  id: string;
}

export interface GetTags_tags_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
  language: GetTags_tags_name_language;
}

export interface GetTags_tags {
  __typename: "Tag";
  id: string;
  service: Service | null;
  parentId: string | null;
  name: GetTags_tags_name[];
}

export interface GetTags {
  tags: GetTags_tags[];
}
