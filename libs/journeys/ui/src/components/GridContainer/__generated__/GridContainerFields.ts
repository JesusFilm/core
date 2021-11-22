/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GridDirection, GridJustifyContent, GridAlignItems } from "../../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: GridContainerFields
// ====================================================

export interface GridContainerFields {
  __typename: "GridContainerBlock";
  id: string;
  parentBlockId: string | null;
  spacing: number;
  direction: GridDirection;
  justifyContent: GridJustifyContent;
  alignItems: GridAlignItems;
}
