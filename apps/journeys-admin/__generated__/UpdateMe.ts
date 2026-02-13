/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateMe
// ====================================================

export interface UpdateMe_updateMe {
  __typename: 'User'
  id: string
  firstName: string
  lastName: string | null
  email: string
}

export interface UpdateMe {
  updateMe: UpdateMe_updateMe
}

export interface UpdateMeInput {
  firstName: string
  lastName?: string | null
  email: string
}

export interface UpdateMeVariables {
  input: UpdateMeInput
}
