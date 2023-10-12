/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AddTagsScriptGetTags
// ====================================================

export interface AddTagsScriptGetTags_tags_name {
  __typename: "Translation";
  value: string;
}

export interface AddTagsScriptGetTags_tags {
  __typename: "Tag";
  id: string;
  name: AddTagsScriptGetTags_tags_name[];
}

export interface AddTagsScriptGetTags {
  tags: AddTagsScriptGetTags_tags[];
}
