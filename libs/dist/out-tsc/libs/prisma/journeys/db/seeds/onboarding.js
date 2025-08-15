"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboarding = onboarding;
const tslib_1 = require("tslib");
const graphql_1 = require("../../src/app/__generated__/graphql");
const client_1 = require("../../src/client");
const prisma = new client_1.PrismaClient();
function onboarding(action) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // reset should only be used for dev and stage, using it on production will overwrite the existing onboarding journey
        // id and slug should be the same as the real onboarding journey in production
        // duplicating the onboarding journey for new users relies on these values to be kept in sync
        const onboardingJourney = {
            id: '9d9ca229-9fb5-4d06-a18c-2d1a4ceba457',
            slug: 'onboarding-journey'
        };
        if (action === 'reset') {
            const existingJourney = yield prisma.journey.findUnique({
                where: { slug: onboardingJourney.slug }
            });
            if (existingJourney != null) {
                yield prisma.journey.delete({ where: { id: existingJourney.id } });
            }
        }
        const existingJourney = yield prisma.journey.findUnique({
            where: { slug: onboardingJourney.slug }
        });
        if (existingJourney != null)
            return;
        const journey = yield prisma.journey.create({
            data: {
                id: onboardingJourney.id,
                title: 'Dev Onboarding Journey',
                description: 'Only used for development and staging. Production should use actual onboarding journey.',
                languageId: '529',
                themeMode: graphql_1.ThemeMode.dark,
                themeName: graphql_1.ThemeName.base,
                slug: onboardingJourney.slug,
                status: graphql_1.JourneyStatus.published,
                template: true,
                createdAt: new Date(),
                publishedAt: new Date(),
                teamId: 'jfp-team'
            }
        });
        const primaryImageBlock = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'ImageBlock',
                src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
                alt: 'onboarding primary',
                width: 1152,
                height: 768,
                blurhash: 'UE9Qmr%MIpWCtmbH%Mxu_4xuWYoL-;oIWYt7',
                parentOrder: 1
            }
        });
        yield prisma.journey.update({
            where: { id: journey.id },
            data: { primaryImageBlockId: primaryImageBlock.id }
        });
        const step = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'StepBlock',
                locked: false,
                parentOrder: 0
            }
        });
        const card = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'CardBlock',
                parentBlockId: step.id,
                fullscreen: false,
                parentOrder: 0
            }
        });
        const coverBlock = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'ImageBlock',
                src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/ae95a856-1401-41e1-6f3e-7b4e6f707f00/public',
                alt: 'onboarding card 1 cover',
                width: 1152,
                height: 768,
                blurhash: 'UbLX6?~p9FtRkX.8ogD%IUj@M{adxaM_ofkW',
                parentBlockId: card.id
            }
        });
        yield prisma.block.update({
            where: { id: card.id },
            data: { coverBlockId: coverBlock.id }
        });
        yield prisma.block.createMany({
            data: [
                {
                    journeyId: journey.id,
                    typename: 'TypographyBlock',
                    parentBlockId: card.id,
                    content: 'The Journey Is On',
                    variant: 'h3',
                    parentOrder: 0
                },
                {
                    journeyId: journey.id,
                    typename: 'TypographyBlock',
                    parentBlockId: card.id,
                    content: '"Go, and lead the people on their way..."',
                    variant: 'body1',
                    parentOrder: 1
                },
                {
                    journeyId: journey.id,
                    typename: 'TypographyBlock',
                    parentBlockId: card.id,
                    content: 'Deuteronomy 10:11',
                    variant: 'caption',
                    parentOrder: 2
                }
            ]
        });
    });
}
//# sourceMappingURL=onboarding.js.map