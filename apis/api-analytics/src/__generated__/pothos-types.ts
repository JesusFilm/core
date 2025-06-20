/* eslint-disable */
import type { Prisma, api_keys, check_stats_emails, create_site_emails, email_activation_codes, enterprise_plans, feedback_emails, fun_with_flags_toggles, funnel_steps, funnels, goals, google_auth, intro_emails, invitations, monthly_reports, oban_jobs, oban_peers, plugins_api_tokens, salts, schema_migrations, sent_accept_traffic_until_notifications, sent_monthly_reports, sent_renewal_notifications, sent_weekly_reports, setup_help_emails, setup_success_emails, shared_links, shield_rules_country, shield_rules_hostname, shield_rules_ip, shield_rules_page, site_imports, site_memberships, site_user_preferences, sites, spike_notifications, subscriptions, totp_recovery_codes, users, weekly_reports } from ".prisma/api-analytics-client/index.js";
export default interface PrismaTypes {
    api_keys: {
        Name: "api_keys";
        Shape: api_keys;
        Include: Prisma.api_keysInclude;
        Select: Prisma.api_keysSelect;
        OrderBy: Prisma.api_keysOrderByWithRelationInput;
        WhereUnique: Prisma.api_keysWhereUniqueInput;
        Where: Prisma.api_keysWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    check_stats_emails: {
        Name: "check_stats_emails";
        Shape: check_stats_emails;
        Include: Prisma.check_stats_emailsInclude;
        Select: Prisma.check_stats_emailsSelect;
        OrderBy: Prisma.check_stats_emailsOrderByWithRelationInput;
        WhereUnique: Prisma.check_stats_emailsWhereUniqueInput;
        Where: Prisma.check_stats_emailsWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    create_site_emails: {
        Name: "create_site_emails";
        Shape: create_site_emails;
        Include: Prisma.create_site_emailsInclude;
        Select: Prisma.create_site_emailsSelect;
        OrderBy: Prisma.create_site_emailsOrderByWithRelationInput;
        WhereUnique: Prisma.create_site_emailsWhereUniqueInput;
        Where: Prisma.create_site_emailsWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    email_activation_codes: {
        Name: "email_activation_codes";
        Shape: email_activation_codes;
        Include: Prisma.email_activation_codesInclude;
        Select: Prisma.email_activation_codesSelect;
        OrderBy: Prisma.email_activation_codesOrderByWithRelationInput;
        WhereUnique: Prisma.email_activation_codesWhereUniqueInput;
        Where: Prisma.email_activation_codesWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    enterprise_plans: {
        Name: "enterprise_plans";
        Shape: enterprise_plans;
        Include: Prisma.enterprise_plansInclude;
        Select: Prisma.enterprise_plansSelect;
        OrderBy: Prisma.enterprise_plansOrderByWithRelationInput;
        WhereUnique: Prisma.enterprise_plansWhereUniqueInput;
        Where: Prisma.enterprise_plansWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    feedback_emails: {
        Name: "feedback_emails";
        Shape: feedback_emails;
        Include: Prisma.feedback_emailsInclude;
        Select: Prisma.feedback_emailsSelect;
        OrderBy: Prisma.feedback_emailsOrderByWithRelationInput;
        WhereUnique: Prisma.feedback_emailsWhereUniqueInput;
        Where: Prisma.feedback_emailsWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    fun_with_flags_toggles: {
        Name: "fun_with_flags_toggles";
        Shape: fun_with_flags_toggles;
        Include: never;
        Select: Prisma.fun_with_flags_togglesSelect;
        OrderBy: Prisma.fun_with_flags_togglesOrderByWithRelationInput;
        WhereUnique: Prisma.fun_with_flags_togglesWhereUniqueInput;
        Where: Prisma.fun_with_flags_togglesWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    funnel_steps: {
        Name: "funnel_steps";
        Shape: funnel_steps;
        Include: Prisma.funnel_stepsInclude;
        Select: Prisma.funnel_stepsSelect;
        OrderBy: Prisma.funnel_stepsOrderByWithRelationInput;
        WhereUnique: Prisma.funnel_stepsWhereUniqueInput;
        Where: Prisma.funnel_stepsWhereInput;
        Create: {};
        Update: {};
        RelationName: "funnels" | "goals";
        ListRelations: never;
        Relations: {
            funnels: {
                Shape: funnels;
                Name: "funnels";
                Nullable: false;
            };
            goals: {
                Shape: goals;
                Name: "goals";
                Nullable: false;
            };
        };
    };
    funnels: {
        Name: "funnels";
        Shape: funnels;
        Include: Prisma.funnelsInclude;
        Select: Prisma.funnelsSelect;
        OrderBy: Prisma.funnelsOrderByWithRelationInput;
        WhereUnique: Prisma.funnelsWhereUniqueInput;
        Where: Prisma.funnelsWhereInput;
        Create: {};
        Update: {};
        RelationName: "funnel_steps" | "sites";
        ListRelations: "funnel_steps";
        Relations: {
            funnel_steps: {
                Shape: funnel_steps[];
                Name: "funnel_steps";
                Nullable: false;
            };
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    goals: {
        Name: "goals";
        Shape: goals;
        Include: Prisma.goalsInclude;
        Select: Prisma.goalsSelect;
        OrderBy: Prisma.goalsOrderByWithRelationInput;
        WhereUnique: Prisma.goalsWhereUniqueInput;
        Where: Prisma.goalsWhereInput;
        Create: {};
        Update: {};
        RelationName: "funnel_steps" | "sites";
        ListRelations: "funnel_steps";
        Relations: {
            funnel_steps: {
                Shape: funnel_steps[];
                Name: "funnel_steps";
                Nullable: false;
            };
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    google_auth: {
        Name: "google_auth";
        Shape: google_auth;
        Include: Prisma.google_authInclude;
        Select: Prisma.google_authSelect;
        OrderBy: Prisma.google_authOrderByWithRelationInput;
        WhereUnique: Prisma.google_authWhereUniqueInput;
        Where: Prisma.google_authWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites" | "users";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    intro_emails: {
        Name: "intro_emails";
        Shape: intro_emails;
        Include: Prisma.intro_emailsInclude;
        Select: Prisma.intro_emailsSelect;
        OrderBy: Prisma.intro_emailsOrderByWithRelationInput;
        WhereUnique: Prisma.intro_emailsWhereUniqueInput;
        Where: Prisma.intro_emailsWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    invitations: {
        Name: "invitations";
        Shape: invitations;
        Include: Prisma.invitationsInclude;
        Select: Prisma.invitationsSelect;
        OrderBy: Prisma.invitationsOrderByWithRelationInput;
        WhereUnique: Prisma.invitationsWhereUniqueInput;
        Where: Prisma.invitationsWhereInput;
        Create: {};
        Update: {};
        RelationName: "users" | "sites";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    monthly_reports: {
        Name: "monthly_reports";
        Shape: monthly_reports;
        Include: Prisma.monthly_reportsInclude;
        Select: Prisma.monthly_reportsSelect;
        OrderBy: Prisma.monthly_reportsOrderByWithRelationInput;
        WhereUnique: Prisma.monthly_reportsWhereUniqueInput;
        Where: Prisma.monthly_reportsWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    oban_jobs: {
        Name: "oban_jobs";
        Shape: oban_jobs;
        Include: never;
        Select: Prisma.oban_jobsSelect;
        OrderBy: Prisma.oban_jobsOrderByWithRelationInput;
        WhereUnique: Prisma.oban_jobsWhereUniqueInput;
        Where: Prisma.oban_jobsWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    oban_peers: {
        Name: "oban_peers";
        Shape: oban_peers;
        Include: never;
        Select: Prisma.oban_peersSelect;
        OrderBy: Prisma.oban_peersOrderByWithRelationInput;
        WhereUnique: Prisma.oban_peersWhereUniqueInput;
        Where: Prisma.oban_peersWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    plugins_api_tokens: {
        Name: "plugins_api_tokens";
        Shape: plugins_api_tokens;
        Include: Prisma.plugins_api_tokensInclude;
        Select: Prisma.plugins_api_tokensSelect;
        OrderBy: Prisma.plugins_api_tokensOrderByWithRelationInput;
        WhereUnique: Prisma.plugins_api_tokensWhereUniqueInput;
        Where: Prisma.plugins_api_tokensWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    salts: {
        Name: "salts";
        Shape: salts;
        Include: never;
        Select: Prisma.saltsSelect;
        OrderBy: Prisma.saltsOrderByWithRelationInput;
        WhereUnique: Prisma.saltsWhereUniqueInput;
        Where: Prisma.saltsWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    schema_migrations: {
        Name: "schema_migrations";
        Shape: schema_migrations;
        Include: never;
        Select: Prisma.schema_migrationsSelect;
        OrderBy: Prisma.schema_migrationsOrderByWithRelationInput;
        WhereUnique: Prisma.schema_migrationsWhereUniqueInput;
        Where: Prisma.schema_migrationsWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    sent_accept_traffic_until_notifications: {
        Name: "sent_accept_traffic_until_notifications";
        Shape: sent_accept_traffic_until_notifications;
        Include: Prisma.sent_accept_traffic_until_notificationsInclude;
        Select: Prisma.sent_accept_traffic_until_notificationsSelect;
        OrderBy: Prisma.sent_accept_traffic_until_notificationsOrderByWithRelationInput;
        WhereUnique: Prisma.sent_accept_traffic_until_notificationsWhereUniqueInput;
        Where: Prisma.sent_accept_traffic_until_notificationsWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    sent_monthly_reports: {
        Name: "sent_monthly_reports";
        Shape: sent_monthly_reports;
        Include: Prisma.sent_monthly_reportsInclude;
        Select: Prisma.sent_monthly_reportsSelect;
        OrderBy: Prisma.sent_monthly_reportsOrderByWithRelationInput;
        WhereUnique: Prisma.sent_monthly_reportsWhereUniqueInput;
        Where: Prisma.sent_monthly_reportsWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    sent_renewal_notifications: {
        Name: "sent_renewal_notifications";
        Shape: sent_renewal_notifications;
        Include: Prisma.sent_renewal_notificationsInclude;
        Select: Prisma.sent_renewal_notificationsSelect;
        OrderBy: Prisma.sent_renewal_notificationsOrderByWithRelationInput;
        WhereUnique: Prisma.sent_renewal_notificationsWhereUniqueInput;
        Where: Prisma.sent_renewal_notificationsWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    sent_weekly_reports: {
        Name: "sent_weekly_reports";
        Shape: sent_weekly_reports;
        Include: Prisma.sent_weekly_reportsInclude;
        Select: Prisma.sent_weekly_reportsSelect;
        OrderBy: Prisma.sent_weekly_reportsOrderByWithRelationInput;
        WhereUnique: Prisma.sent_weekly_reportsWhereUniqueInput;
        Where: Prisma.sent_weekly_reportsWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    setup_help_emails: {
        Name: "setup_help_emails";
        Shape: setup_help_emails;
        Include: Prisma.setup_help_emailsInclude;
        Select: Prisma.setup_help_emailsSelect;
        OrderBy: Prisma.setup_help_emailsOrderByWithRelationInput;
        WhereUnique: Prisma.setup_help_emailsWhereUniqueInput;
        Where: Prisma.setup_help_emailsWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    setup_success_emails: {
        Name: "setup_success_emails";
        Shape: setup_success_emails;
        Include: Prisma.setup_success_emailsInclude;
        Select: Prisma.setup_success_emailsSelect;
        OrderBy: Prisma.setup_success_emailsOrderByWithRelationInput;
        WhereUnique: Prisma.setup_success_emailsWhereUniqueInput;
        Where: Prisma.setup_success_emailsWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    shared_links: {
        Name: "shared_links";
        Shape: shared_links;
        Include: Prisma.shared_linksInclude;
        Select: Prisma.shared_linksSelect;
        OrderBy: Prisma.shared_linksOrderByWithRelationInput;
        WhereUnique: Prisma.shared_linksWhereUniqueInput;
        Where: Prisma.shared_linksWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    shield_rules_country: {
        Name: "shield_rules_country";
        Shape: shield_rules_country;
        Include: Prisma.shield_rules_countryInclude;
        Select: Prisma.shield_rules_countrySelect;
        OrderBy: Prisma.shield_rules_countryOrderByWithRelationInput;
        WhereUnique: Prisma.shield_rules_countryWhereUniqueInput;
        Where: Prisma.shield_rules_countryWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    shield_rules_hostname: {
        Name: "shield_rules_hostname";
        Shape: shield_rules_hostname;
        Include: Prisma.shield_rules_hostnameInclude;
        Select: Prisma.shield_rules_hostnameSelect;
        OrderBy: Prisma.shield_rules_hostnameOrderByWithRelationInput;
        WhereUnique: Prisma.shield_rules_hostnameWhereUniqueInput;
        Where: Prisma.shield_rules_hostnameWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    shield_rules_ip: {
        Name: "shield_rules_ip";
        Shape: shield_rules_ip;
        Include: Prisma.shield_rules_ipInclude;
        Select: Prisma.shield_rules_ipSelect;
        OrderBy: Prisma.shield_rules_ipOrderByWithRelationInput;
        WhereUnique: Prisma.shield_rules_ipWhereUniqueInput;
        Where: Prisma.shield_rules_ipWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    shield_rules_page: {
        Name: "shield_rules_page";
        Shape: shield_rules_page;
        Include: Prisma.shield_rules_pageInclude;
        Select: Prisma.shield_rules_pageSelect;
        OrderBy: Prisma.shield_rules_pageOrderByWithRelationInput;
        WhereUnique: Prisma.shield_rules_pageWhereUniqueInput;
        Where: Prisma.shield_rules_pageWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    site_imports: {
        Name: "site_imports";
        Shape: site_imports;
        Include: Prisma.site_importsInclude;
        Select: Prisma.site_importsSelect;
        OrderBy: Prisma.site_importsOrderByWithRelationInput;
        WhereUnique: Prisma.site_importsWhereUniqueInput;
        Where: Prisma.site_importsWhereInput;
        Create: {};
        Update: {};
        RelationName: "users" | "sites";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users | null;
                Name: "users";
                Nullable: true;
            };
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    site_memberships: {
        Name: "site_memberships";
        Shape: site_memberships;
        Include: Prisma.site_membershipsInclude;
        Select: Prisma.site_membershipsSelect;
        OrderBy: Prisma.site_membershipsOrderByWithRelationInput;
        WhereUnique: Prisma.site_membershipsWhereUniqueInput;
        Where: Prisma.site_membershipsWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites" | "users";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    site_user_preferences: {
        Name: "site_user_preferences";
        Shape: site_user_preferences;
        Include: Prisma.site_user_preferencesInclude;
        Select: Prisma.site_user_preferencesSelect;
        OrderBy: Prisma.site_user_preferencesOrderByWithRelationInput;
        WhereUnique: Prisma.site_user_preferencesWhereUniqueInput;
        Where: Prisma.site_user_preferencesWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites" | "users";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    sites: {
        Name: "sites";
        Shape: sites;
        Include: Prisma.sitesInclude;
        Select: Prisma.sitesSelect;
        OrderBy: Prisma.sitesOrderByWithRelationInput;
        WhereUnique: Prisma.sitesWhereUniqueInput;
        Where: Prisma.sitesWhereInput;
        Create: {};
        Update: {};
        RelationName: "funnels" | "goals" | "google_auth" | "invitations" | "monthly_reports" | "plugins_api_tokens" | "sent_monthly_reports" | "sent_weekly_reports" | "setup_help_emails" | "setup_success_emails" | "shared_links" | "shield_rules_country" | "shield_rules_hostname" | "shield_rules_ip" | "shield_rules_page" | "site_imports" | "site_memberships" | "site_user_preferences" | "spike_notifications" | "weekly_reports";
        ListRelations: "funnels" | "goals" | "invitations" | "plugins_api_tokens" | "sent_monthly_reports" | "sent_weekly_reports" | "setup_help_emails" | "setup_success_emails" | "shared_links" | "shield_rules_country" | "shield_rules_hostname" | "shield_rules_ip" | "shield_rules_page" | "site_imports" | "site_memberships" | "site_user_preferences";
        Relations: {
            funnels: {
                Shape: funnels[];
                Name: "funnels";
                Nullable: false;
            };
            goals: {
                Shape: goals[];
                Name: "goals";
                Nullable: false;
            };
            google_auth: {
                Shape: google_auth | null;
                Name: "google_auth";
                Nullable: true;
            };
            invitations: {
                Shape: invitations[];
                Name: "invitations";
                Nullable: false;
            };
            monthly_reports: {
                Shape: monthly_reports | null;
                Name: "monthly_reports";
                Nullable: true;
            };
            plugins_api_tokens: {
                Shape: plugins_api_tokens[];
                Name: "plugins_api_tokens";
                Nullable: false;
            };
            sent_monthly_reports: {
                Shape: sent_monthly_reports[];
                Name: "sent_monthly_reports";
                Nullable: false;
            };
            sent_weekly_reports: {
                Shape: sent_weekly_reports[];
                Name: "sent_weekly_reports";
                Nullable: false;
            };
            setup_help_emails: {
                Shape: setup_help_emails[];
                Name: "setup_help_emails";
                Nullable: false;
            };
            setup_success_emails: {
                Shape: setup_success_emails[];
                Name: "setup_success_emails";
                Nullable: false;
            };
            shared_links: {
                Shape: shared_links[];
                Name: "shared_links";
                Nullable: false;
            };
            shield_rules_country: {
                Shape: shield_rules_country[];
                Name: "shield_rules_country";
                Nullable: false;
            };
            shield_rules_hostname: {
                Shape: shield_rules_hostname[];
                Name: "shield_rules_hostname";
                Nullable: false;
            };
            shield_rules_ip: {
                Shape: shield_rules_ip[];
                Name: "shield_rules_ip";
                Nullable: false;
            };
            shield_rules_page: {
                Shape: shield_rules_page[];
                Name: "shield_rules_page";
                Nullable: false;
            };
            site_imports: {
                Shape: site_imports[];
                Name: "site_imports";
                Nullable: false;
            };
            site_memberships: {
                Shape: site_memberships[];
                Name: "site_memberships";
                Nullable: false;
            };
            site_user_preferences: {
                Shape: site_user_preferences[];
                Name: "site_user_preferences";
                Nullable: false;
            };
            spike_notifications: {
                Shape: spike_notifications | null;
                Name: "spike_notifications";
                Nullable: true;
            };
            weekly_reports: {
                Shape: weekly_reports | null;
                Name: "weekly_reports";
                Nullable: true;
            };
        };
    };
    spike_notifications: {
        Name: "spike_notifications";
        Shape: spike_notifications;
        Include: Prisma.spike_notificationsInclude;
        Select: Prisma.spike_notificationsSelect;
        OrderBy: Prisma.spike_notificationsOrderByWithRelationInput;
        WhereUnique: Prisma.spike_notificationsWhereUniqueInput;
        Where: Prisma.spike_notificationsWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
    subscriptions: {
        Name: "subscriptions";
        Shape: subscriptions;
        Include: Prisma.subscriptionsInclude;
        Select: Prisma.subscriptionsSelect;
        OrderBy: Prisma.subscriptionsOrderByWithRelationInput;
        WhereUnique: Prisma.subscriptionsWhereUniqueInput;
        Where: Prisma.subscriptionsWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    totp_recovery_codes: {
        Name: "totp_recovery_codes";
        Shape: totp_recovery_codes;
        Include: Prisma.totp_recovery_codesInclude;
        Select: Prisma.totp_recovery_codesSelect;
        OrderBy: Prisma.totp_recovery_codesOrderByWithRelationInput;
        WhereUnique: Prisma.totp_recovery_codesWhereUniqueInput;
        Where: Prisma.totp_recovery_codesWhereInput;
        Create: {};
        Update: {};
        RelationName: "users";
        ListRelations: never;
        Relations: {
            users: {
                Shape: users;
                Name: "users";
                Nullable: false;
            };
        };
    };
    users: {
        Name: "users";
        Shape: users;
        Include: Prisma.usersInclude;
        Select: Prisma.usersSelect;
        OrderBy: Prisma.usersOrderByWithRelationInput;
        WhereUnique: Prisma.usersWhereUniqueInput;
        Where: Prisma.usersWhereInput;
        Create: {};
        Update: {};
        RelationName: "api_keys" | "check_stats_emails" | "create_site_emails" | "email_activation_codes" | "enterprise_plans" | "feedback_emails" | "google_auth" | "intro_emails" | "invitations" | "sent_accept_traffic_until_notifications" | "sent_renewal_notifications" | "site_imports" | "site_memberships" | "site_user_preferences" | "subscriptions" | "totp_recovery_codes";
        ListRelations: "api_keys" | "check_stats_emails" | "create_site_emails" | "enterprise_plans" | "feedback_emails" | "google_auth" | "intro_emails" | "invitations" | "sent_accept_traffic_until_notifications" | "sent_renewal_notifications" | "site_imports" | "site_memberships" | "site_user_preferences" | "subscriptions" | "totp_recovery_codes";
        Relations: {
            api_keys: {
                Shape: api_keys[];
                Name: "api_keys";
                Nullable: false;
            };
            check_stats_emails: {
                Shape: check_stats_emails[];
                Name: "check_stats_emails";
                Nullable: false;
            };
            create_site_emails: {
                Shape: create_site_emails[];
                Name: "create_site_emails";
                Nullable: false;
            };
            email_activation_codes: {
                Shape: email_activation_codes | null;
                Name: "email_activation_codes";
                Nullable: true;
            };
            enterprise_plans: {
                Shape: enterprise_plans[];
                Name: "enterprise_plans";
                Nullable: false;
            };
            feedback_emails: {
                Shape: feedback_emails[];
                Name: "feedback_emails";
                Nullable: false;
            };
            google_auth: {
                Shape: google_auth[];
                Name: "google_auth";
                Nullable: false;
            };
            intro_emails: {
                Shape: intro_emails[];
                Name: "intro_emails";
                Nullable: false;
            };
            invitations: {
                Shape: invitations[];
                Name: "invitations";
                Nullable: false;
            };
            sent_accept_traffic_until_notifications: {
                Shape: sent_accept_traffic_until_notifications[];
                Name: "sent_accept_traffic_until_notifications";
                Nullable: false;
            };
            sent_renewal_notifications: {
                Shape: sent_renewal_notifications[];
                Name: "sent_renewal_notifications";
                Nullable: false;
            };
            site_imports: {
                Shape: site_imports[];
                Name: "site_imports";
                Nullable: false;
            };
            site_memberships: {
                Shape: site_memberships[];
                Name: "site_memberships";
                Nullable: false;
            };
            site_user_preferences: {
                Shape: site_user_preferences[];
                Name: "site_user_preferences";
                Nullable: false;
            };
            subscriptions: {
                Shape: subscriptions[];
                Name: "subscriptions";
                Nullable: false;
            };
            totp_recovery_codes: {
                Shape: totp_recovery_codes[];
                Name: "totp_recovery_codes";
                Nullable: false;
            };
        };
    };
    weekly_reports: {
        Name: "weekly_reports";
        Shape: weekly_reports;
        Include: Prisma.weekly_reportsInclude;
        Select: Prisma.weekly_reportsSelect;
        OrderBy: Prisma.weekly_reportsOrderByWithRelationInput;
        WhereUnique: Prisma.weekly_reportsWhereUniqueInput;
        Where: Prisma.weekly_reportsWhereInput;
        Create: {};
        Update: {};
        RelationName: "sites";
        ListRelations: never;
        Relations: {
            sites: {
                Shape: sites;
                Name: "sites";
                Nullable: false;
            };
        };
    };
}