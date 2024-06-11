/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceFromArrayInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ResourceFromArray
// ====================================================

export interface ResourceFromArray_resourceFromArray {
  __typename: "Resource";
  id: string;
}

export interface ResourceFromArray {
  resourceFromArray: (ResourceFromArray_resourceFromArray | null)[] | null;
}

export interface ResourceFromArrayVariables {
  input: ResourceFromArrayInput;
}
