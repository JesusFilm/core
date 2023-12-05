
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class ChannelCreateInput {
    id?: Nullable<string>;
    nexusId: string;
    name: string;
    platform: string;
}

export class ChannelUpdateInput {
    name?: Nullable<string>;
    nexusId?: Nullable<string>;
    platform?: Nullable<string>;
}

export class ChannelFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    nexusId?: Nullable<string>;
    limit?: Nullable<number>;
}

export class NexusCreateInput {
    name: string;
    description?: Nullable<string>;
}

export class NexusUpdateInput {
    name?: Nullable<string>;
    description?: Nullable<string>;
}

export class NexusFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    description?: Nullable<string>;
    createdAt?: Nullable<DateTime>;
    limit?: Nullable<number>;
    orderByRecent?: Nullable<boolean>;
}

export class Channel {
    __typename?: 'Channel';
    id: string;
    nexusId?: Nullable<string>;
    name: string;
    platform?: Nullable<string>;
}

export class Nexus {
    __typename?: 'Nexus';
    id: string;
    name: string;
    description?: Nullable<string>;
    createdAt: DateTime;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract nexuses(where?: Nullable<NexusFilter>): Nexus[] | Promise<Nexus[]>;

    abstract nexus(id: string): Nexus | Promise<Nexus>;
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

export abstract class IMutation {
    abstract nexusCreate(input: NexusCreateInput): Nexus | Promise<Nexus>;

    abstract nexusUpdate(id: string, input: NexusUpdateInput): Nexus | Promise<Nexus>;
}

export class Language {
    id: string;
}

export type DateTime = String;
type Nullable<T> = T | null;
