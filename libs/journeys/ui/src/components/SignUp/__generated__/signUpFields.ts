import * as Types from '../../../../__generated__/types';

export type SignUpFieldsFragment = { __typename?: 'SignUpBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, submitLabel?: string | null, submitIconId?: string | null, action?: { __typename?: 'EmailAction', email: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'LinkAction', url: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName?: string | null } | null };
