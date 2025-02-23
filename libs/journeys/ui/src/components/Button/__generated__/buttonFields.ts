import * as Types from '../../../../__generated__/types';

export type ButtonFieldsFragment = { __typename?: 'ButtonBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, label: string, size?: Types.ButtonSize | null, startIconId?: string | null, endIconId?: string | null, buttonVariant?: Types.ButtonVariant | null, buttonColor?: Types.ButtonColor | null, action?: { __typename?: 'EmailAction', email: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'LinkAction', url: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName?: string | null } | null };
