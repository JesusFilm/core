import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

import GlobeIcon from '@core/shared/ui/icons/Globe'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

export function SectionPromo(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const points = [
    {
      icon: GlobeIcon,
      title: t('PromoPointMostTranslatedTitle', {
        defaultValue: 'The most translated film library in the world'
      }),
      description: t('PromoPointMostTranslatedDescription', {
        defaultValue:
          'Decades of translation work, carried by trusted ministry partners, have built a library with thousands of language tracks so people can encounter the story of Jesus in the language that reaches them deepest.'
      })
    },
    {
      icon: VideoOnIcon,
      title: t('PromoPointAIVideoTitle', {
        defaultValue: 'Carrying trusted voices into new formats'
      }),
      description: t('PromoPointAIVideoDescription', {
        defaultValue:
          'We are rebuilding how gospel stories are told visually, pairing trusted translations with modern formats so the message can move freely across platforms, cultures, and screen.'
      })
    },
    {
      icon: UsersProfiles2Icon,
      title: t('PromoPointCreativeTeamTitle', {
        defaultValue: 'More than a library. A mission-driven team.'
      }),
      description: t('PromoPointCreativeTeamDescription', {
        defaultValue:
          'Jesus Film Project is a global team of translators, media specialists, editors, and creators who have served missionaries for decades. We\'re turning that experience into tools that equip disciple-makers everywhere.'
      })
    }
  ]

  const highlights = [
    {
      title: t('PromoHighlightNextStepsTitle', {
        defaultValue: 'Next Steps Platform'
      }),
      description: t('PromoHighlightNextStepsDescription', {
        defaultValue:
          'Connect every viewer with tangible opportunities on their spiritual journey, helping them take a next step into community, Scripture, or mission.'
      })
    },
    {
      title: t('PromoHighlightMediaLibraryTitle', {
        defaultValue: 'Evangelistic Media Library'
      }),
      description: t('PromoHighlightMediaLibraryDescription', {
        defaultValue:
          'We have an extensive Christian media library with thousands of videos, films, and resources available in multiple languages for ministry and evangelism worldwide.'
      })
    },
    {
      title: t('PromoHighlightToolsetTitle', {
        defaultValue: 'Digital Tools for Ministries'
      }),
      description: t('PromoHighlightToolsetDescription', {
        defaultValue:
          'Comprehensive digital tools designed specifically for ministry needs, including video management, content distribution, audience engagement, and analytics to help ministries reach more people effectively.'
      })
    }
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-950/60 via-purple-950/20 to-orange-600/10 py-18">
      <div className="">
        <div className="responsive-container isolate shadow-[0_45px_80px_-40px_rgba(15,23,42,0.8)]">
          <div
            aria-hidden
            className="pointer-events-none absolute top-[-10%] -left-24 h-56 w-56 rounded-full bg-red-600/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-[-10%] bottom-[-20%] h-80 w-80 rounded-full bg-amber-600/25 blur-[120px]"
          />
          <div className="relative flex flex-col gap-14">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold tracking-[0.3em] text-red-100/70 uppercase">
                {t('PromoEyebrow', {
                  defaultValue: 'Built for global missions'
                })}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t('PromoHeading', {
                  defaultValue:
                    'The message doesn\'t change. The way people watch does.'
                })}
              </h2>
              <p className="text-lg text-white/80 lg:text-xl">
                {t('PromoIntro', {
                  defaultValue:
                    'We are rebuilding our video library and tools from the ground up, committing decades of translation work to the platforms where people already gather, watch, and share.'
                })}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {points.map((point, index) => (
                <div
                  key={`${point.title}-${index}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10"
                >
                  <div className="mb-6">
                    <point.icon
                      style={{
                        fontSize: '80px',
                        width: '80px',
                        height: '80px',
                        opacity: 0.2,
                        mixBlendMode: 'overlay'
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-lg text-white/80 lg:text-xl">
                  {t('PromoHighlightsLabel', {
                    defaultValue: 'What we are building next'
                  })}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {highlights.map((highlight, index) => (
                  <div
                    key={`${highlight.title}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-stone-950/20 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-stone-900/60"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {highlight.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-12 text-center mb-16">
              <p className="text-xs font-semibold tracking-[0.3em] text-red-100/70 uppercase mb-4">
                YOU'RE INVITED
              </p>
              <h3 className="text-3xl font-semibold text-white mb-4">
                Help build{' '}
                <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                  the next generation
                </span>{' '}
                of mission tools
              </h3>
              <p className="text-lg text-white/80 lg:text-xl max-w-2xl mx-auto mb-8">
                We're inviting practitioners, creators, and partners into early access. Test new tools first, give feedback, and help shape products designed for real mission work.
              </p>
              <a
                href="https://mailchi.mp/jesusfilm/beta"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center justify-center rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black hover:bg-gray-100 h-12 px-10 py-3"
              >
                Become a beta tester
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
