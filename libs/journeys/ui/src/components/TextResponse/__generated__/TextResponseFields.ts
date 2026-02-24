/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseType } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: TextResponseFields
// ====================================================

export interface TextResponseFields {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
  hideLabel: boolean | null;
}
