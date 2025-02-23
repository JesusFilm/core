import * as Types from '../../../../__generated__/types';

export type UpdateLastActiveTeamIdMutationVariables = Types.Exact<{
  input: Types.JourneyProfileUpdateInput;
}>;


export type UpdateLastActiveTeamIdMutation = { __typename?: 'Mutation', journeyProfileUpdate: { __typename?: 'JourneyProfile', id: string } };
