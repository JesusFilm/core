/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GridSpacing, GridDirection, GridJustifyContent, GridAlignItems, GridSize } from "./globalTypes";

// ====================================================
// GraphQL fragment: GridFields
// ====================================================

export interface GridFields_container {
  __typename: "Container";
  spacing: GridSpacing;
  direction: GridDirection;
  justifyContent: GridJustifyContent;
  alignItems: GridAlignItems;
}

export interface GridFields_item {
  __typename: "Item";
  lg: GridSize;
}

export interface GridFields {
  __typename: "GridBlock";
  id: string;
  parentBlockId: string | null;
  container: GridFields_container | null;
  item: GridFields_item | null;
}
