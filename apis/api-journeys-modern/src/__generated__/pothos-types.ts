/* eslint-disable */
import type { Prisma, ChatButton, Event, Visitor, Host, JourneyVisitor, Team, Integration, UserTeam, UserTeamInvite, UserJourney, JourneyTag, Journey, UserRole, JourneyProfile, UserInvite, Block, Action, JourneysEmailPreference, JourneyNotification, CustomDomain, JourneyCollection, JourneyCollectionJourneys, QrCode, JourneyEventsExportLog, JourneyTheme, JourneyCustomizationField } from ".prisma/api-journeys-modern-client/index.js";
export default interface PrismaTypes {
    ChatButton: {
        Name: "ChatButton";
        Shape: ChatButton;
        Include: Prisma.ChatButtonInclude;
        Select: Prisma.ChatButtonSelect;
        OrderBy: Prisma.ChatButtonOrderByWithRelationInput;
        WhereUnique: Prisma.ChatButtonWhereUniqueInput;
        Where: Prisma.ChatButtonWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    Event: {
        Name: "Event";
        Shape: Event;
        Include: Prisma.EventInclude;
        Select: Prisma.EventSelect;
        OrderBy: Prisma.EventOrderByWithRelationInput;
        WhereUnique: Prisma.EventWhereUniqueInput;
        Where: Prisma.EventWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey" | "journeyVisitor" | "visitor";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
            journeyVisitor: {
                Shape: JourneyVisitor | null;
                Name: "JourneyVisitor";
                Nullable: true;
            };
            visitor: {
                Shape: Visitor;
                Name: "Visitor";
                Nullable: false;
            };
        };
    };
    Visitor: {
        Name: "Visitor";
        Shape: Visitor;
        Include: Prisma.VisitorInclude;
        Select: Prisma.VisitorSelect;
        OrderBy: Prisma.VisitorOrderByWithRelationInput;
        WhereUnique: Prisma.VisitorWhereUniqueInput;
        Where: Prisma.VisitorWhereInput;
        Create: {};
        Update: {};
        RelationName: "events" | "journeyVisitors" | "team";
        ListRelations: "events" | "journeyVisitors";
        Relations: {
            events: {
                Shape: Event[];
                Name: "Event";
                Nullable: false;
            };
            journeyVisitors: {
                Shape: JourneyVisitor[];
                Name: "JourneyVisitor";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    Host: {
        Name: "Host";
        Shape: Host;
        Include: Prisma.HostInclude;
        Select: Prisma.HostSelect;
        OrderBy: Prisma.HostOrderByWithRelationInput;
        WhereUnique: Prisma.HostWhereUniqueInput;
        Where: Prisma.HostWhereInput;
        Create: {};
        Update: {};
        RelationName: "team" | "journeys";
        ListRelations: "journeys";
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            journeys: {
                Shape: Journey[];
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    JourneyVisitor: {
        Name: "JourneyVisitor";
        Shape: JourneyVisitor;
        Include: Prisma.JourneyVisitorInclude;
        Select: Prisma.JourneyVisitorSelect;
        OrderBy: Prisma.JourneyVisitorOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyVisitorWhereUniqueInput;
        Where: Prisma.JourneyVisitorWhereInput;
        Create: {};
        Update: {};
        RelationName: "events" | "journey" | "visitor";
        ListRelations: "events";
        Relations: {
            events: {
                Shape: Event[];
                Name: "Event";
                Nullable: false;
            };
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
            visitor: {
                Shape: Visitor;
                Name: "Visitor";
                Nullable: false;
            };
        };
    };
    Team: {
        Name: "Team";
        Shape: Team;
        Include: Prisma.TeamInclude;
        Select: Prisma.TeamSelect;
        OrderBy: Prisma.TeamOrderByWithRelationInput;
        WhereUnique: Prisma.TeamWhereUniqueInput;
        Where: Prisma.TeamWhereInput;
        Create: {};
        Update: {};
        RelationName: "customDomains" | "hosts" | "integrations" | "journeys" | "journeyCollections" | "qrCodes" | "userTeams" | "UserTeamInvites" | "visitors";
        ListRelations: "customDomains" | "hosts" | "integrations" | "journeys" | "journeyCollections" | "qrCodes" | "userTeams" | "UserTeamInvites" | "visitors";
        Relations: {
            customDomains: {
                Shape: CustomDomain[];
                Name: "CustomDomain";
                Nullable: false;
            };
            hosts: {
                Shape: Host[];
                Name: "Host";
                Nullable: false;
            };
            integrations: {
                Shape: Integration[];
                Name: "Integration";
                Nullable: false;
            };
            journeys: {
                Shape: Journey[];
                Name: "Journey";
                Nullable: false;
            };
            journeyCollections: {
                Shape: JourneyCollection[];
                Name: "JourneyCollection";
                Nullable: false;
            };
            qrCodes: {
                Shape: QrCode[];
                Name: "QrCode";
                Nullable: false;
            };
            userTeams: {
                Shape: UserTeam[];
                Name: "UserTeam";
                Nullable: false;
            };
            UserTeamInvites: {
                Shape: UserTeamInvite[];
                Name: "UserTeamInvite";
                Nullable: false;
            };
            visitors: {
                Shape: Visitor[];
                Name: "Visitor";
                Nullable: false;
            };
        };
    };
    Integration: {
        Name: "Integration";
        Shape: Integration;
        Include: Prisma.IntegrationInclude;
        Select: Prisma.IntegrationSelect;
        OrderBy: Prisma.IntegrationOrderByWithRelationInput;
        WhereUnique: Prisma.IntegrationWhereUniqueInput;
        Where: Prisma.IntegrationWhereInput;
        Create: {};
        Update: {};
        RelationName: "team";
        ListRelations: never;
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    UserTeam: {
        Name: "UserTeam";
        Shape: UserTeam;
        Include: Prisma.UserTeamInclude;
        Select: Prisma.UserTeamSelect;
        OrderBy: Prisma.UserTeamOrderByWithRelationInput;
        WhereUnique: Prisma.UserTeamWhereUniqueInput;
        Where: Prisma.UserTeamWhereInput;
        Create: {};
        Update: {};
        RelationName: "journeyNotifications" | "team";
        ListRelations: "journeyNotifications";
        Relations: {
            journeyNotifications: {
                Shape: JourneyNotification[];
                Name: "JourneyNotification";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    UserTeamInvite: {
        Name: "UserTeamInvite";
        Shape: UserTeamInvite;
        Include: Prisma.UserTeamInviteInclude;
        Select: Prisma.UserTeamInviteSelect;
        OrderBy: Prisma.UserTeamInviteOrderByWithRelationInput;
        WhereUnique: Prisma.UserTeamInviteWhereUniqueInput;
        Where: Prisma.UserTeamInviteWhereInput;
        Create: {};
        Update: {};
        RelationName: "team";
        ListRelations: never;
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    UserJourney: {
        Name: "UserJourney";
        Shape: UserJourney;
        Include: Prisma.UserJourneyInclude;
        Select: Prisma.UserJourneySelect;
        OrderBy: Prisma.UserJourneyOrderByWithRelationInput;
        WhereUnique: Prisma.UserJourneyWhereUniqueInput;
        Where: Prisma.UserJourneyWhereInput;
        Create: {};
        Update: {};
        RelationName: "journeyNotification" | "journey";
        ListRelations: never;
        Relations: {
            journeyNotification: {
                Shape: JourneyNotification | null;
                Name: "JourneyNotification";
                Nullable: true;
            };
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    JourneyTag: {
        Name: "JourneyTag";
        Shape: JourneyTag;
        Include: Prisma.JourneyTagInclude;
        Select: Prisma.JourneyTagSelect;
        OrderBy: Prisma.JourneyTagOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyTagWhereUniqueInput;
        Where: Prisma.JourneyTagWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    Journey: {
        Name: "Journey";
        Shape: Journey;
        Include: Prisma.JourneyInclude;
        Select: Prisma.JourneySelect;
        OrderBy: Prisma.JourneyOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyWhereUniqueInput;
        Where: Prisma.JourneyWhereInput;
        Create: {};
        Update: {};
        RelationName: "actions" | "blocks" | "chatButtons" | "Event" | "creatorImageBlock" | "host" | "logoImageBlock" | "menuStepBlock" | "primaryImageBlock" | "team" | "journeyCollectionJourneys" | "JourneyCustomizationField" | "journeyEventsExportLogs" | "journeyNotifications" | "journeyTags" | "journeyTheme" | "journeyVisitors" | "qrCode" | "userInvites" | "userJourneys";
        ListRelations: "actions" | "blocks" | "chatButtons" | "Event" | "journeyCollectionJourneys" | "JourneyCustomizationField" | "journeyEventsExportLogs" | "journeyNotifications" | "journeyTags" | "journeyVisitors" | "qrCode" | "userInvites" | "userJourneys";
        Relations: {
            actions: {
                Shape: Action[];
                Name: "Action";
                Nullable: false;
            };
            blocks: {
                Shape: Block[];
                Name: "Block";
                Nullable: false;
            };
            chatButtons: {
                Shape: ChatButton[];
                Name: "ChatButton";
                Nullable: false;
            };
            Event: {
                Shape: Event[];
                Name: "Event";
                Nullable: false;
            };
            creatorImageBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            host: {
                Shape: Host | null;
                Name: "Host";
                Nullable: true;
            };
            logoImageBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            menuStepBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            primaryImageBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            journeyCollectionJourneys: {
                Shape: JourneyCollectionJourneys[];
                Name: "JourneyCollectionJourneys";
                Nullable: false;
            };
            JourneyCustomizationField: {
                Shape: JourneyCustomizationField[];
                Name: "JourneyCustomizationField";
                Nullable: false;
            };
            journeyEventsExportLogs: {
                Shape: JourneyEventsExportLog[];
                Name: "JourneyEventsExportLog";
                Nullable: false;
            };
            journeyNotifications: {
                Shape: JourneyNotification[];
                Name: "JourneyNotification";
                Nullable: false;
            };
            journeyTags: {
                Shape: JourneyTag[];
                Name: "JourneyTag";
                Nullable: false;
            };
            journeyTheme: {
                Shape: JourneyTheme | null;
                Name: "JourneyTheme";
                Nullable: true;
            };
            journeyVisitors: {
                Shape: JourneyVisitor[];
                Name: "JourneyVisitor";
                Nullable: false;
            };
            qrCode: {
                Shape: QrCode[];
                Name: "QrCode";
                Nullable: false;
            };
            userInvites: {
                Shape: UserInvite[];
                Name: "UserInvite";
                Nullable: false;
            };
            userJourneys: {
                Shape: UserJourney[];
                Name: "UserJourney";
                Nullable: false;
            };
        };
    };
    UserRole: {
        Name: "UserRole";
        Shape: UserRole;
        Include: never;
        Select: Prisma.UserRoleSelect;
        OrderBy: Prisma.UserRoleOrderByWithRelationInput;
        WhereUnique: Prisma.UserRoleWhereUniqueInput;
        Where: Prisma.UserRoleWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    JourneyProfile: {
        Name: "JourneyProfile";
        Shape: JourneyProfile;
        Include: never;
        Select: Prisma.JourneyProfileSelect;
        OrderBy: Prisma.JourneyProfileOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyProfileWhereUniqueInput;
        Where: Prisma.JourneyProfileWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    UserInvite: {
        Name: "UserInvite";
        Shape: UserInvite;
        Include: Prisma.UserInviteInclude;
        Select: Prisma.UserInviteSelect;
        OrderBy: Prisma.UserInviteOrderByWithRelationInput;
        WhereUnique: Prisma.UserInviteWhereUniqueInput;
        Where: Prisma.UserInviteWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    Block: {
        Name: "Block";
        Shape: Block;
        Include: Prisma.BlockInclude;
        Select: Prisma.BlockSelect;
        OrderBy: Prisma.BlockOrderByWithRelationInput;
        WhereUnique: Prisma.BlockWhereUniqueInput;
        Where: Prisma.BlockWhereInput;
        Create: {};
        Update: {};
        RelationName: "targetActions" | "action" | "coverBlock" | "coverBlockParent" | "journey" | "nextBlock" | "nextBlockParents" | "parentBlock" | "childBlocks" | "pollOptionImageBlock" | "pollOptionImageBlockParent" | "posterBlock" | "posterBlockParent" | "creatorImageBlockParent" | "logoImageBlockParent" | "menuStepBlockParent" | "primaryImageBlockParent";
        ListRelations: "targetActions" | "nextBlockParents" | "childBlocks";
        Relations: {
            targetActions: {
                Shape: Action[];
                Name: "Action";
                Nullable: false;
            };
            action: {
                Shape: Action | null;
                Name: "Action";
                Nullable: true;
            };
            coverBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            coverBlockParent: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
            nextBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            nextBlockParents: {
                Shape: Block[];
                Name: "Block";
                Nullable: false;
            };
            parentBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            childBlocks: {
                Shape: Block[];
                Name: "Block";
                Nullable: false;
            };
            pollOptionImageBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            pollOptionImageBlockParent: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            posterBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            posterBlockParent: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            creatorImageBlockParent: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
            logoImageBlockParent: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
            menuStepBlockParent: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
            primaryImageBlockParent: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
        };
    };
    Action: {
        Name: "Action";
        Shape: Action;
        Include: Prisma.ActionInclude;
        Select: Prisma.ActionSelect;
        OrderBy: Prisma.ActionOrderByWithRelationInput;
        WhereUnique: Prisma.ActionWhereUniqueInput;
        Where: Prisma.ActionWhereInput;
        Create: {};
        Update: {};
        RelationName: "block" | "journey" | "parentBlock";
        ListRelations: never;
        Relations: {
            block: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            journey: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
            parentBlock: {
                Shape: Block;
                Name: "Block";
                Nullable: false;
            };
        };
    };
    JourneysEmailPreference: {
        Name: "JourneysEmailPreference";
        Shape: JourneysEmailPreference;
        Include: never;
        Select: Prisma.JourneysEmailPreferenceSelect;
        OrderBy: Prisma.JourneysEmailPreferenceOrderByWithRelationInput;
        WhereUnique: Prisma.JourneysEmailPreferenceWhereUniqueInput;
        Where: Prisma.JourneysEmailPreferenceWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    JourneyNotification: {
        Name: "JourneyNotification";
        Shape: JourneyNotification;
        Include: Prisma.JourneyNotificationInclude;
        Select: Prisma.JourneyNotificationSelect;
        OrderBy: Prisma.JourneyNotificationOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyNotificationWhereUniqueInput;
        Where: Prisma.JourneyNotificationWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey" | "userJourney" | "userTeam";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
            userJourney: {
                Shape: UserJourney | null;
                Name: "UserJourney";
                Nullable: true;
            };
            userTeam: {
                Shape: UserTeam | null;
                Name: "UserTeam";
                Nullable: true;
            };
        };
    };
    CustomDomain: {
        Name: "CustomDomain";
        Shape: CustomDomain;
        Include: Prisma.CustomDomainInclude;
        Select: Prisma.CustomDomainSelect;
        OrderBy: Prisma.CustomDomainOrderByWithRelationInput;
        WhereUnique: Prisma.CustomDomainWhereUniqueInput;
        Where: Prisma.CustomDomainWhereInput;
        Create: {};
        Update: {};
        RelationName: "journeyCollection" | "team";
        ListRelations: never;
        Relations: {
            journeyCollection: {
                Shape: JourneyCollection | null;
                Name: "JourneyCollection";
                Nullable: true;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    JourneyCollection: {
        Name: "JourneyCollection";
        Shape: JourneyCollection;
        Include: Prisma.JourneyCollectionInclude;
        Select: Prisma.JourneyCollectionSelect;
        OrderBy: Prisma.JourneyCollectionOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyCollectionWhereUniqueInput;
        Where: Prisma.JourneyCollectionWhereInput;
        Create: {};
        Update: {};
        RelationName: "customDomains" | "team" | "journeyCollectionJourneys";
        ListRelations: "customDomains" | "journeyCollectionJourneys";
        Relations: {
            customDomains: {
                Shape: CustomDomain[];
                Name: "CustomDomain";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            journeyCollectionJourneys: {
                Shape: JourneyCollectionJourneys[];
                Name: "JourneyCollectionJourneys";
                Nullable: false;
            };
        };
    };
    JourneyCollectionJourneys: {
        Name: "JourneyCollectionJourneys";
        Shape: JourneyCollectionJourneys;
        Include: Prisma.JourneyCollectionJourneysInclude;
        Select: Prisma.JourneyCollectionJourneysSelect;
        OrderBy: Prisma.JourneyCollectionJourneysOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyCollectionJourneysWhereUniqueInput;
        Where: Prisma.JourneyCollectionJourneysWhereInput;
        Create: {};
        Update: {};
        RelationName: "journeyCollection" | "journey";
        ListRelations: never;
        Relations: {
            journeyCollection: {
                Shape: JourneyCollection;
                Name: "JourneyCollection";
                Nullable: false;
            };
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    QrCode: {
        Name: "QrCode";
        Shape: QrCode;
        Include: Prisma.QrCodeInclude;
        Select: Prisma.QrCodeSelect;
        OrderBy: Prisma.QrCodeOrderByWithRelationInput;
        WhereUnique: Prisma.QrCodeWhereUniqueInput;
        Where: Prisma.QrCodeWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey" | "team";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    JourneyEventsExportLog: {
        Name: "JourneyEventsExportLog";
        Shape: JourneyEventsExportLog;
        Include: Prisma.JourneyEventsExportLogInclude;
        Select: Prisma.JourneyEventsExportLogSelect;
        OrderBy: Prisma.JourneyEventsExportLogOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyEventsExportLogWhereUniqueInput;
        Where: Prisma.JourneyEventsExportLogWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    JourneyTheme: {
        Name: "JourneyTheme";
        Shape: JourneyTheme;
        Include: Prisma.JourneyThemeInclude;
        Select: Prisma.JourneyThemeSelect;
        OrderBy: Prisma.JourneyThemeOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyThemeWhereUniqueInput;
        Where: Prisma.JourneyThemeWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    JourneyCustomizationField: {
        Name: "JourneyCustomizationField";
        Shape: JourneyCustomizationField;
        Include: Prisma.JourneyCustomizationFieldInclude;
        Select: Prisma.JourneyCustomizationFieldSelect;
        OrderBy: Prisma.JourneyCustomizationFieldOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyCustomizationFieldWhereUniqueInput;
        Where: Prisma.JourneyCustomizationFieldWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
}