import * as Types from '../../../../__generated__/globalTypes';

export type GetLastActiveTeamIdAndTeamsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetLastActiveTeamIdAndTeamsQuery = { getJourneyProfile: { __typename: 'JourneyProfile', id: string, lastActiveTeamId: string | null } | null, teams: Array<{ __typename: 'Team', id: string, title: string, publicTitle: string | null, userTeams: Array<{ __typename: 'UserTeam', id: string, role: Types.UserTeamRole, user: { __typename: 'User', id: string, firstName: string, lastName: string | null, imageUrl: string | null, email: string } }>, customDomains: Array<{ __typename: 'CustomDomain', id: string, name: string }> }> };
