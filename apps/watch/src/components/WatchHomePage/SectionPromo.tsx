import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

export function SectionPromo(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const points = [
    {
      title: t('PromoPointMostTranslatedTitle', {
        defaultValue: 'The most translated film library in the world'
      }),
      description: t('PromoPointMostTranslatedDescription', {
        defaultValue:
          'Our catalog carries thousands of language tracks created alongside ministry partners so every person can encounter the story of Jesus in their heart language.'
      })
    },
    {
      title: t('PromoPointAIVideoTitle', {
        defaultValue: 'Pairing trusted voices with new visual stories'
      }),
      description: t('PromoPointAIVideoDescription', {
        defaultValue:
          'We are imagining fresh ways to combine our unique audio translations with newly generated AI visuals, crafting local expressions of the gospel without losing the authenticity of the narration people already trust.'
      })
    },
    {
      title: t('PromoPointCreativeTeamTitle', {
        defaultValue: 'More than movies—a team on mission'
      }),
      description: t('PromoPointCreativeTeamDescription', {
        defaultValue:
          'Jesus Film Project is a family of translators, media specialists, editors, and creators who have served missionaries for decades. We are turning that expertise into tools that empower mission and missionaries alike.'
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
      title: t('PromoHighlightCroppingTitle', {
        defaultValue: 'Video Cropping Tool'
      }),
      description: t('PromoHighlightCroppingDescription', {
        defaultValue:
          'Transform any landscape film into vertical, social-friendly clips in seconds with intelligent reframing built for ministry storytellers.'
      })
    },
    {
      title: t('PromoHighlightHostingTitle', {
        defaultValue: 'Christian Video Hosting'
      }),
      description: t('PromoHighlightHostingDescription', {
        defaultValue:
          'Think of it as the Vimeo for missions—sharing our experience delivering videos across a resilient global network so ministries can host and distribute their stories with confidence.'
      })
    }
  ]

  return (
    <section className="mt-16 lg:mt-24">
      <div className="responsive-container">
        <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-900/80 px-6 py-16 shadow-[0_45px_80px_-40px_rgba(15,23,42,0.8)] sm:px-10 sm:py-20 lg:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-[-10%] h-56 w-56 rounded-full bg-sky-500/40 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-80 w-80 rounded-full bg-emerald-400/30 blur-[120px]"
          />
          <div className="relative flex flex-col gap-14">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-100/70">
                {t('PromoEyebrow', { defaultValue: 'Future-ready for global missions' })}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t('PromoHeading', {
                  defaultValue: 'The media landscape is changing—so is Jesus Film Project.'
                })}
              </h2>
              <p className="text-lg text-white/80 lg:text-xl">
                {t('PromoIntro', {
                  defaultValue:
                    'We are designing the next chapter of Jesus Film Project, pairing decades of translation work with emerging formats so every disciple-maker can meet audiences where they already watch.'
                })}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {points.map((point, index) => (
                <div
                  key={`${point.title}-${index}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/70">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{point.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{point.description}</p>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  {t('PromoHighlightsLabel', { defaultValue: 'What we are building next' })}
                </p>
                <p className="mt-3 max-w-2xl text-sm text-white/70">
                  {t('PromoHighlightsIntro', {
                    defaultValue:
                      'The same team that serves missionaries with translation, media, and production is now shaping tools that activate ministry momentum around the world.'
                  })}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {highlights.map((highlight, index) => (
                  <div
                    key={`${highlight.title}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900/60"
                  >
                    <h3 className="text-lg font-semibold text-white">{highlight.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
