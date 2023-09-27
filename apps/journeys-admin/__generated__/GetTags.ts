/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTags
// ====================================================

export interface GetTags_tags_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetTags_tags {
  __typename: "Tag";
  id: string;
  name: GetTags_tags_name[];
}

export interface GetTags {
  tags: GetTags_tags[];
}
