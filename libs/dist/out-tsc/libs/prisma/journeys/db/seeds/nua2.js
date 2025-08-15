"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nua2 = nua2;
const tslib_1 = require("tslib");
const graphql_1 = require("../../src/app/__generated__/graphql");
const client_1 = require("../../src/client");
const prisma = new client_1.PrismaClient();
function nua2() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const slug = 'what-about-the-resurrection';
        const existingJourney = yield prisma.journey.findUnique({ where: { slug } });
        if (existingJourney != null) {
            yield prisma.action.deleteMany({
                where: { parentBlock: { journeyId: existingJourney.id } }
            });
            yield prisma.block.deleteMany({ where: { journeyId: existingJourney.id } });
        }
        const journeyData = {
            id: '2',
            title: 'What About The Resurrection?',
            languageId: '529',
            themeMode: graphql_1.ThemeMode.light,
            themeName: graphql_1.ThemeName.base,
            slug,
            status: graphql_1.JourneyStatus.published,
            createdAt: new Date(),
            publishedAt: new Date(),
            featuredAt: new Date(),
            teamId: 'jfp-team'
        };
        const journey = yield prisma.journey.upsert({
            where: { id: journeyData.id },
            create: journeyData,
            update: journeyData
        });
        const step7 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'StepBlock',
                locked: false,
                parentOrder: 6
            }
        });
        const step6 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'StepBlock',
                locked: false,
                parentOrder: 5,
                nextBlockId: step7.id
            }
        });
        const step5 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'StepBlock',
                locked: false,
                parentOrder: 4,
                nextBlockId: step6.id
            }
        });
        const step4 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'StepBlock',
                locked: false,
                parentOrder: 3,
                nextBlockId: step5.id
            }
        });
        const step3 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'StepBlock',
                locked: false,
                parentOrder: 2,
                nextBlockId: step4.id
            }
        });
        const step2 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'StepBlock',
                locked: false,
                parentOrder: 1,
                nextBlockId: step3.id
            }
        });
        // first step
        const step1 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'StepBlock',
                locked: false,
                parentOrder: 0,
                nextBlockId: step2.id
            }
        });
        const card1 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'CardBlock',
                parentBlockId: step1.id,
                themeMode: graphql_1.ThemeMode.dark,
                themeName: graphql_1.ThemeName.base,
                fullscreen: false,
                parentOrder: 0
            }
        });
        const coverblock = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'VideoBlock',
                parentBlockId: card1.id,
                videoId: '7_0-nfs0301',
                videoVariantLanguageId: '529',
                muted: true,
                autoplay: true,
                startAt: 11,
                title: 'What about the resurrection'
            }
        });
        yield prisma.block.update({
            where: { id: card1.id },
            data: { coverBlockId: coverblock.id }
        });
        const poster = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'ImageBlock',
                parentBlockId: coverblock.id,
                src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                alt: 'Can we trust the story of Jesus?',
                width: 1920,
                height: 1080,
                blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
                parentOrder: 0
            }
        });
        yield prisma.block.update({
            where: { id: coverblock.id },
            data: { posterBlockId: poster.id }
        });
        yield prisma.block.createMany({
            data: [
                {
                    journeyId: journey.id,
                    typename: 'TypographyBlock',
                    parentBlockId: card1.id,
                    content: 'The Resurection',
                    variant: 'h6',
                    color: 'primary',
                    align: 'left',
                    parentOrder: 0
                },
                {
                    journeyId: journey.id,
                    typename: 'TypographyBlock',
                    parentBlockId: card1.id,
                    content: 'What About It?',
                    variant: 'h2',
                    color: 'primary',
                    align: 'left',
                    parentOrder: 1
                },
                {
                    journeyId: journey.id,
                    typename: 'TypographyBlock',
                    parentBlockId: card1.id,
                    content: 'Jesus’ tomb was found empty three days after his death-what could have happened to the body?',
                    variant: 'body1',
                    color: 'primary',
                    align: 'left',
                    parentOrder: 2
                }
            ]
        });
        // second step
        const button1 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'ButtonBlock',
                parentBlockId: card1.id,
                label: 'Find Out',
                variant: 'contained',
                color: 'primary',
                size: 'large',
                action: {
                    create: {
                        gtmEventName: 'click',
                        blockId: step2.id
                    }
                },
                parentOrder: 3
            }
        });
        const icon1a = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'IconBlock',
                parentBlockId: button1.id,
                name: 'PlayArrowRounded',
                size: 'lg',
                parentOrder: 0
            }
        });
        const icon1b = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'IconBlock',
                parentBlockId: button1.id,
                name: null
            }
        });
        yield prisma.block.update({
            where: { id: button1.id },
            data: { startIconId: icon1a.id, endIconId: icon1b.id }
        });
        const videoCard = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'CardBlock',
                parentBlockId: step2.id,
                themeMode: graphql_1.ThemeMode.dark,
                themeName: graphql_1.ThemeName.base,
                fullscreen: false,
                parentOrder: 0
            }
        });
        // third step
        const video = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'VideoBlock',
                parentBlockId: videoCard.id,
                videoId: '7_0-nfs0301',
                videoVariantLanguageId: '529',
                autoplay: true,
                title: 'What About The Ressurection?',
                fullsize: true,
                parentOrder: 0,
                action: {
                    create: {
                        gtmEventName: 'NavigateToBlockAction',
                        blockId: step3.id
                    }
                }
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'VideoTriggerBlock',
                parentBlockId: video.id,
                triggerStart: 108,
                action: {
                    create: {
                        gtmEventName: 'trigger',
                        blockId: step3.id
                    }
                },
                parentOrder: 0
            }
        });
        const card3 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'CardBlock',
                parentBlockId: step3.id,
                themeMode: graphql_1.ThemeMode.dark,
                themeName: graphql_1.ThemeName.base,
                fullscreen: false,
                parentOrder: 0
            }
        });
        const image = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'ImageBlock',
                parentBlockId: card3.id,
                src: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                alt: 'Where did his body go?',
                width: 1920,
                height: 1080,
                blurhash: 'LFC$sANy00xF_NWF8_af9[n,xtR-'
            }
        });
        yield prisma.block.update({
            where: { id: card3.id },
            data: { coverBlockId: image.id }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'TypographyBlock',
                parentBlockId: card3.id,
                content: 'HOW DO YOU THINK?',
                variant: 'h6',
                color: 'primary',
                align: 'left',
                parentOrder: 0
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'TypographyBlock',
                parentBlockId: card3.id,
                content: 'Where did his body go?',
                variant: 'h3',
                color: 'primary',
                align: 'left',
                parentOrder: 1
            }
        });
        const question2 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'RadioQuestionBlock',
                parentBlockId: card3.id,
                parentOrder: 2
            }
        });
        // fourth step
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'RadioOptionBlock',
                parentBlockId: question2.id,
                label: 'Someone stole it from the tomb',
                action: {
                    create: {
                        gtmEventName: 'click',
                        blockId: step4.id
                    }
                },
                parentOrder: 1
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'RadioOptionBlock',
                parentBlockId: question2.id,
                label: "He didn't really die",
                action: {
                    create: {
                        gtmEventName: 'click',
                        blockId: step4.id
                    }
                },
                parentOrder: 2
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'RadioOptionBlock',
                parentBlockId: question2.id,
                label: 'He actually rose from the dead',
                action: {
                    create: {
                        gtmEventName: 'click',
                        blockId: step4.id
                    }
                },
                parentOrder: 3
            }
        });
        const videoCard1 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'CardBlock',
                parentBlockId: step4.id,
                themeMode: graphql_1.ThemeMode.dark,
                themeName: graphql_1.ThemeName.base,
                fullscreen: false,
                parentOrder: 0
            }
        });
        // fifth step
        const video1 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'VideoBlock',
                parentBlockId: videoCard1.id,
                videoId: '7_0-nfs0301',
                videoVariantLanguageId: '529',
                autoplay: true,
                title: 'What About The Ressurection?',
                startAt: 109,
                fullsize: true,
                parentOrder: 0,
                action: {
                    create: {
                        gtmEventName: 'NavigateToBlockAction',
                        blockId: step5.id
                    }
                }
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'VideoTriggerBlock',
                parentBlockId: video1.id,
                triggerStart: 272,
                action: {
                    create: {
                        gtmEventName: 'trigger',
                        blockId: step5.id
                    }
                },
                parentOrder: 0
            }
        });
        const card5 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'CardBlock',
                parentBlockId: step5.id,
                themeMode: graphql_1.ThemeMode.dark,
                themeName: graphql_1.ThemeName.base,
                fullscreen: false,
                parentOrder: 0
            }
        });
        yield prisma.block.createMany({
            data: [
                {
                    journeyId: journey.id,
                    typename: 'TypographyBlock',
                    parentBlockId: card5.id,
                    content: 'A QUOTE',
                    variant: 'h6',
                    color: 'primary',
                    align: 'left',
                    parentOrder: 0
                },
                {
                    journeyId: journey.id,
                    typename: 'TypographyBlock',
                    parentBlockId: card5.id,
                    content: "...one of the soldiers pierced Jesus' side with a spear, bringing a sudden flow of blood and water.",
                    variant: 'subtitle1',
                    color: 'primary',
                    align: 'left',
                    parentOrder: 1
                },
                {
                    journeyId: journey.id,
                    typename: 'TypographyBlock',
                    parentBlockId: card5.id,
                    content: '- The Bible, John 19:34',
                    variant: 'body1',
                    color: 'primary',
                    align: 'left',
                    parentOrder: 2
                }
            ]
        });
        const image2 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'ImageBlock',
                parentBlockId: card5.id,
                src: 'https://images.unsplash.com/photo-1616977545092-f4a423c3f22e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=765&q=80',
                alt: 'quote',
                width: 1920,
                height: 1080,
                blurhash: 'L9Db$mOt008_}?oz58M{.8o#rqIU'
            }
        });
        yield prisma.block.update({
            where: { id: card5.id },
            data: { coverBlockId: image2.id }
        });
        // sixth step
        const button2 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'ButtonBlock',
                parentBlockId: card5.id,
                label: 'What does it mean?',
                variant: 'contained',
                color: 'primary',
                size: 'medium',
                action: {
                    create: {
                        gtmEventName: 'click',
                        blockId: step6.id
                    }
                },
                parentOrder: 4
            }
        });
        const icon2a = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'IconBlock',
                parentBlockId: button2.id,
                name: 'ContactSupportRounded',
                size: 'md',
                parentOrder: 4
            }
        });
        const icon2b = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'IconBlock',
                parentBlockId: button2.id,
                name: null
            }
        });
        yield prisma.block.update({
            where: { id: button2.id },
            data: { startIconId: icon2a.id, endIconId: icon2b.id }
        });
        const videoCard2 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'CardBlock',
                parentBlockId: step6.id,
                themeMode: graphql_1.ThemeMode.dark,
                themeName: graphql_1.ThemeName.base,
                fullscreen: false,
                parentOrder: 0
            }
        });
        // seventh step
        const video2 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'VideoBlock',
                parentBlockId: videoCard2.id,
                videoId: '7_0-nfs0301',
                videoVariantLanguageId: '529',
                autoplay: true,
                title: 'What About The Ressurection?',
                startAt: 272,
                fullsize: true,
                parentOrder: 0,
                action: {
                    create: {
                        gtmEventName: 'NavigateToBlockAction',
                        blockId: step7.id
                    }
                }
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'VideoTriggerBlock',
                parentBlockId: video2.id,
                triggerStart: 348,
                action: {
                    create: {
                        gtmEventName: 'trigger',
                        blockId: step7.id
                    }
                },
                parentOrder: 0
            }
        });
        const card7 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'CardBlock',
                parentBlockId: step7.id,
                themeMode: graphql_1.ThemeMode.dark,
                themeName: graphql_1.ThemeName.base,
                fullscreen: false,
                parentOrder: 0
            }
        });
        const image3 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'ImageBlock',
                parentBlockId: card7.id,
                src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1136&q=80',
                alt: 'Who was this Jesus?',
                width: 1920,
                height: 1080,
                blurhash: 'L;KH$$-Rs-kA}ot4bZj@S3R,WWj@'
            }
        });
        yield prisma.block.update({
            where: { id: card7.id },
            data: { coverBlockId: image3.id }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'TypographyBlock',
                parentBlockId: card7.id,
                content: "IF IT'S TRUE...",
                variant: 'h6',
                color: 'primary',
                align: 'left',
                parentOrder: 0
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'TypographyBlock',
                parentBlockId: card7.id,
                content: 'What is Christianity to you?',
                variant: 'h3',
                color: 'primary',
                align: 'left',
                parentOrder: 1
            }
        });
        const question5 = yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'RadioQuestionBlock',
                parentBlockId: card7.id,
                parentOrder: 2
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'RadioOptionBlock',
                parentBlockId: question5.id,
                label: 'One of many ways to God',
                action: {
                    create: {
                        gtmEventName: 'LinkAction',
                        url: '/whats-jesus-got-to-do-with-me'
                    }
                },
                parentOrder: 0
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'RadioOptionBlock',
                parentBlockId: question5.id,
                label: 'One great lie...',
                action: {
                    create: {
                        gtmEventName: 'LinkAction',
                        url: '/whats-jesus-got-to-do-with-me'
                    }
                },
                parentOrder: 1
            }
        });
        yield prisma.block.create({
            data: {
                journeyId: journey.id,
                typename: 'RadioOptionBlock',
                parentBlockId: question5.id,
                label: 'One true way to God',
                action: {
                    create: {
                        gtmEventName: 'LinkAction',
                        url: '/whats-jesus-got-to-do-with-me'
                    }
                },
                parentOrder: 2
            }
        });
    });
}
//# sourceMappingURL=nua2.js.map