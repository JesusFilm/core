/* eslint-disable */
import type { Prisma, Language, LanguageName } from ".prisma/api-languages-client";
export default interface PrismaTypes {
    Language: {
        Name: "Language";
        Shape: Language;
        Include: Prisma.LanguageInclude;
        Select: Prisma.LanguageSelect;
        OrderBy: Prisma.LanguageOrderByWithRelationInput;
        WhereUnique: Prisma.LanguageWhereUniqueInput;
        Where: Prisma.LanguageWhereInput;
        Create: {};
        Update: {};
        RelationName: "name" | "nameLanguage";
        ListRelations: "name" | "nameLanguage";
        Relations: {
            name: {
                Shape: LanguageName[];
                Name: "LanguageName";
                Nullable: false;
            };
            nameLanguage: {
                Shape: LanguageName[];
                Name: "LanguageName";
                Nullable: false;
            };
        };
    };
    LanguageName: {
        Name: "LanguageName";
        Shape: LanguageName;
        Include: Prisma.LanguageNameInclude;
        Select: Prisma.LanguageNameSelect;
        OrderBy: Prisma.LanguageNameOrderByWithRelationInput;
        WhereUnique: Prisma.LanguageNameWhereUniqueInput;
        Where: Prisma.LanguageNameWhereInput;
        Create: {};
        Update: {};
        RelationName: "language" | "parent";
        ListRelations: never;
        Relations: {
            language: {
                Shape: Language;
                Name: "Language";
                Nullable: false;
            };
            parent: {
                Shape: Language;
                Name: "Language";
                Nullable: false;
            };
        };
    };
}