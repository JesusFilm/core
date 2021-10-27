/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GridDirection, GridJustifyContent, GridAlignItems } from "./globalTypes";

// ====================================================
// GraphQL fragment: GridFields
// ====================================================

export interface GridFields_container {
  __typename: "Container";
  spacing: number;
  direction: GridDirection;
  justifyContent: GridJustifyContent;
  alignItems: GridAlignItems;
}

export interface GridFields_item {
  __typename: "Item";
  xl: number;
  lg: number;
  sm: number;
}

export interface GridFields {
  __typename: "GridBlock";
  id: string;
  parentBlockId: string | null;
  container: GridFields_container | null;
  item: GridFields_item | null;
}
