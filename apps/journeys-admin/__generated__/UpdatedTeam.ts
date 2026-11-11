/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: UpdatedTeam
// ====================================================

export interface UpdatedTeam_customDomains {
  __typename: "CustomDomain";
  id: string;
}

export interface UpdatedTeam {
  __typename: "Team";
  id: string;
  /**
   * The team's own domains; a Campaign Domain belongs to its campaign and is left out.
   */
  customDomains: UpdatedTeam_customDomains[];
}
