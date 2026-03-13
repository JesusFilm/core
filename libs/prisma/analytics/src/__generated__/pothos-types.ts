/* eslint-disable */
import type { Prisma, api_keys, check_stats_emails, create_site_emails, email_activation_codes, enterprise_plans, feedback_emails, fun_with_flags_toggles, funnel_steps, funnels, goals, google_auth, intro_emails, invitations, monthly_reports, oban_jobs, oban_peers, plugins_api_tokens, salts, schema_migrations, sent_accept_traffic_until_notifications, sent_monthly_reports, sent_renewal_notifications, sent_weekly_reports, setup_help_emails, setup_success_emails, shared_links, shield_rules_country, shield_rules_hostname, shield_rules_ip, shield_rules_page, site_imports, site_memberships, site_user_preferences, sites, spike_notifications, subscriptions, totp_recovery_codes, users, weekly_reports } from "./client/client.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
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
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"api_keys\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"key_prefix\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"key_hash\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"scopes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"hourly_request_limit\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"api_keysTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"check_stats_emails\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"check_stats_emailsTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"create_site_emails\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"create_site_emailsTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"email_activation_codes\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"issued_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"email_activation_codesTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"enterprise_plans\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"paddle_plan_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"billing_interval\",\"kind\":\"enum\",\"name\":\"billing_interval\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"monthly_pageview_limit\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"hourly_api_request_limit\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"site_limit\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"team_member_limit\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"features\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"enterprise_plansTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"feedback_emails\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"feedback_emailsTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"fun_with_flags_toggles\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"flag_name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"gate_type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"target\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"enabled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"flag_name\",\"gate_type\",\"target\"]}]},\"funnel_steps\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"goal_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"funnel_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"step_order\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"funnels\",\"kind\":\"object\",\"name\":\"funnels\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"funnel_stepsTofunnels\",\"relationFromFields\":[\"funnel_id\"],\"isUpdatedAt\":false},{\"type\":\"goals\",\"kind\":\"object\",\"name\":\"goals\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"funnel_stepsTogoals\",\"relationFromFields\":[\"goal_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"goal_id\",\"funnel_id\"]}]},\"funnels\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"funnel_steps\",\"kind\":\"object\",\"name\":\"funnel_steps\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"funnel_stepsTofunnels\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"funnelsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"name\",\"site_id\"]}]},\"goals\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"event_name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"page_path\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"currency\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"funnel_steps\",\"kind\":\"object\",\"name\":\"funnel_steps\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"funnel_stepsTogoals\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"goalsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"google_auth\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"refresh_token\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"access_token\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expires\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"property\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"google_authTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"google_authTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"intro_emails\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"intro_emailsTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"invitations\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"inviter_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"site_membership_role\",\"kind\":\"enum\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"invitation_id\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"invitationsTousers\",\"relationFromFields\":[\"inviter_id\"],\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"invitationsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"site_id\",\"email\"]}]},\"monthly_reports\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"recipients\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"monthly_reportsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"oban_jobs\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"oban_job_state\",\"kind\":\"enum\",\"name\":\"state\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"queue\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"worker\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"args\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"errors\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"attempt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"max_attempts\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"scheduled_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"attempted_at\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"completed_at\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"attempted_by\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"discarded_at\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"priority\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"tags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"meta\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"cancelled_at\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"oban_peers\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"node\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"started_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expires_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"plugins_api_tokens\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Bytes\",\"kind\":\"scalar\",\"name\":\"token_hash\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"hint\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"last_used_at\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"plugins_api_tokensTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"salts\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Bytes\",\"kind\":\"scalar\",\"name\":\"salt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"schema_migrations\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"version\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"sent_accept_traffic_until_notifications\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"sent_on\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sent_accept_traffic_until_notificationsTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"user_id\",\"sent_on\"]}]},\"sent_monthly_reports\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"year\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"month\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sent_monthly_reportsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"sent_renewal_notifications\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sent_renewal_notificationsTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"sent_weekly_reports\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"year\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"week\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sent_weekly_reportsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"setup_help_emails\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"setup_help_emailsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"setup_success_emails\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"setup_success_emailsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"shared_links\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"password_hash\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shared_linksTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"site_id\",\"name\"]}]},\"shield_rules_country\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"country_code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"action\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"added_by\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shield_rules_countryTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"site_id\",\"country_code\"]}]},\"shield_rules_hostname\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"hostname\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"hostname_pattern\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"action\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"added_by\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shield_rules_hostnameTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"site_id\",\"hostname_pattern\"]}]},\"shield_rules_ip\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"inet\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"action\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"added_by\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shield_rules_ipTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"site_id\",\"inet\"]}]},\"shield_rules_page\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"page_path\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"page_path_pattern\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"action\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"added_by\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shield_rules_pageTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"site_id\",\"page_path_pattern\"]}]},\"site_imports\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"start_date\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"end_date\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"source\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"imported_by_id\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"legacy\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"label\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_importsTousers\",\"relationFromFields\":[\"imported_by_id\"],\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_importsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"site_memberships\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"site_membership_role\",\"kind\":\"enum\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_membershipsTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_membershipsTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"site_id\",\"user_id\"]}]},\"site_user_preferences\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"pinned_at\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_user_preferencesTosites\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_user_preferencesTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"user_id\",\"site_id\"]}]},\"sites\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"domain\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"timezone\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"public\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"locked\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"has_stats\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"imported_data\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"stats_start_date\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ingest_rate_limit_scale_seconds\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ingest_rate_limit_threshold\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"native_stats_start_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"domain_changed_from\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"domain_changed_at\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"allowed_event_props\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"conversions_enabled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"funnels_enabled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"props_enabled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"accept_traffic_until\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"funnels\",\"kind\":\"object\",\"name\":\"funnels\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"funnelsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"goals\",\"kind\":\"object\",\"name\":\"goals\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"goalsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"google_auth\",\"kind\":\"object\",\"name\":\"google_auth\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"google_authTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"invitations\",\"kind\":\"object\",\"name\":\"invitations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"invitationsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"monthly_reports\",\"kind\":\"object\",\"name\":\"monthly_reports\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"monthly_reportsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"plugins_api_tokens\",\"kind\":\"object\",\"name\":\"plugins_api_tokens\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"plugins_api_tokensTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"sent_monthly_reports\",\"kind\":\"object\",\"name\":\"sent_monthly_reports\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sent_monthly_reportsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"sent_weekly_reports\",\"kind\":\"object\",\"name\":\"sent_weekly_reports\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sent_weekly_reportsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"setup_help_emails\",\"kind\":\"object\",\"name\":\"setup_help_emails\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"setup_help_emailsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"setup_success_emails\",\"kind\":\"object\",\"name\":\"setup_success_emails\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"setup_success_emailsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"shared_links\",\"kind\":\"object\",\"name\":\"shared_links\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shared_linksTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"shield_rules_country\",\"kind\":\"object\",\"name\":\"shield_rules_country\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shield_rules_countryTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"shield_rules_hostname\",\"kind\":\"object\",\"name\":\"shield_rules_hostname\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shield_rules_hostnameTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"shield_rules_ip\",\"kind\":\"object\",\"name\":\"shield_rules_ip\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shield_rules_ipTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"shield_rules_page\",\"kind\":\"object\",\"name\":\"shield_rules_page\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"shield_rules_pageTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"site_imports\",\"kind\":\"object\",\"name\":\"site_imports\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_importsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"site_memberships\",\"kind\":\"object\",\"name\":\"site_memberships\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_membershipsTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"site_user_preferences\",\"kind\":\"object\",\"name\":\"site_user_preferences\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_user_preferencesTosites\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"spike_notifications\",\"kind\":\"object\",\"name\":\"spike_notifications\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sitesTospike_notifications\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"weekly_reports\",\"kind\":\"object\",\"name\":\"weekly_reports\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sitesToweekly_reports\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"spike_notifications\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"threshold\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"last_sent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"recipients\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sitesTospike_notifications\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"subscriptions\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"paddle_subscription_id\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"paddle_plan_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"update_url\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"cancel_url\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"next_bill_amount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"next_bill_date\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"last_bill_date\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"currency_code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"subscriptionsTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"totp_recovery_codes\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Bytes\",\"kind\":\"scalar\",\"name\":\"code_digest\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"user_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"users\",\"kind\":\"object\",\"name\":\"users\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"totp_recovery_codesTousers\",\"relationFromFields\":[\"user_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"users\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"last_seen\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"password_hash\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"trial_expiry_date\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"email_verified\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"theme\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"grace_period\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"previous_email\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Bytes\",\"kind\":\"scalar\",\"name\":\"totp_secret\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"totp_enabled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"totp_last_used_at\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"allow_next_upgrade_override\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"totp_token\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"accept_traffic_until\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"api_keys\",\"kind\":\"object\",\"name\":\"api_keys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"api_keysTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"check_stats_emails\",\"kind\":\"object\",\"name\":\"check_stats_emails\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"check_stats_emailsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"create_site_emails\",\"kind\":\"object\",\"name\":\"create_site_emails\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"create_site_emailsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"email_activation_codes\",\"kind\":\"object\",\"name\":\"email_activation_codes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"email_activation_codesTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"enterprise_plans\",\"kind\":\"object\",\"name\":\"enterprise_plans\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"enterprise_plansTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"feedback_emails\",\"kind\":\"object\",\"name\":\"feedback_emails\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"feedback_emailsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"google_auth\",\"kind\":\"object\",\"name\":\"google_auth\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"google_authTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"intro_emails\",\"kind\":\"object\",\"name\":\"intro_emails\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"intro_emailsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"invitations\",\"kind\":\"object\",\"name\":\"invitations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"invitationsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"sent_accept_traffic_until_notifications\",\"kind\":\"object\",\"name\":\"sent_accept_traffic_until_notifications\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sent_accept_traffic_until_notificationsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"sent_renewal_notifications\",\"kind\":\"object\",\"name\":\"sent_renewal_notifications\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sent_renewal_notificationsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"site_imports\",\"kind\":\"object\",\"name\":\"site_imports\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_importsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"site_memberships\",\"kind\":\"object\",\"name\":\"site_memberships\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_membershipsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"site_user_preferences\",\"kind\":\"object\",\"name\":\"site_user_preferences\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"site_user_preferencesTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"subscriptions\",\"kind\":\"object\",\"name\":\"subscriptions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"subscriptionsTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"totp_recovery_codes\",\"kind\":\"object\",\"name\":\"totp_recovery_codes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"totp_recovery_codesTousers\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"weekly_reports\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"site_id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"inserted_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updated_at\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"recipients\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"sites\",\"kind\":\"object\",\"name\":\"sites\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"sitesToweekly_reports\",\"relationFromFields\":[\"site_id\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]}}}}"); }