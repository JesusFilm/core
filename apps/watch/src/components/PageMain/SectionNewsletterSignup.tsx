import { useTranslation } from 'next-i18next'
import {
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type ReactElement,
  useMemo,
  useState
} from 'react'

import { ExtendedButton as Button } from '@core/shared/uimodern/components'

type AudienceOption = 'missionary' | 'organization' | 'private'

interface SelectOption {
  value: string
  label: string
}

export function SectionNewsletterSignup(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [audience, setAudience] = useState<AudienceOption>('missionary')
  const [interests, setInterests] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const audienceOptions: Array<{ value: AudienceOption; label: string }> =
    useMemo(
      () => [
        {
          value: 'missionary',
          label: t('newsletterSection.audience.missionary', {
            defaultValue: 'A missionary'
          })
        },
        {
          value: 'organization',
          label: t('newsletterSection.audience.organization', {
            defaultValue: 'Part of a mission organization'
          })
        },
        {
          value: 'private',
          label: t('newsletterSection.audience.private', {
            defaultValue: 'An individual believer'
          })
        }
      ],
      [t]
    )

  const interestOptions: SelectOption[] = useMemo(
    () => [
      {
        value: 'newVideos',
        label: t('newsletterSection.interests.newVideos', {
          defaultValue: 'Gospel video updates'
        })
      },
      {
        value: 'newTranslations',
        label: t('newsletterSection.interests.newTranslations', {
          defaultValue: 'New translations available'
        })
      },
      {
        value: 'newReleases',
        label: t('newsletterSection.interests.newReleases', {
          defaultValue: 'Latest releases'
        })
      },
      {
        value: 'newTools',
        label: t('newsletterSection.interests.newTools', {
          defaultValue: 'New tools and resources'
        })
      }
    ],
    [t]
  )

  const languageOptions: SelectOption[] = useMemo(
    () => [
      {
        value: 'english',
        label: t('newsletterSection.languages.english', {
          defaultValue: 'English'
        })
      },
      {
        value: 'spanish',
        label: t('newsletterSection.languages.spanish', {
          defaultValue: 'Spanish'
        })
      },
      {
        value: 'french',
        label: t('newsletterSection.languages.french', {
          defaultValue: 'French'
        })
      },
      {
        value: 'portuguese',
        label: t('newsletterSection.languages.portuguese', {
          defaultValue: 'Portuguese'
        })
      },
      {
        value: 'chinese',
        label: t('newsletterSection.languages.chinese', {
          defaultValue: 'Chinese'
        })
      },
      {
        value: 'other',
        label: t('newsletterSection.languages.other', { defaultValue: 'Other' })
      }
    ],
    [t]
  )

  function handleAudienceChange(event: ChangeEvent<HTMLInputElement>): void {
    setAudience(event.target.value as AudienceOption)
    setSubmitted(false)
  }

  function toggleValue(
    value: string,
    setState: Dispatch<React.SetStateAction<string[]>>
  ): void {
    setState((previous) =>
      previous.includes(value)
        ? previous.filter((currentValue) => currentValue !== value)
        : [...previous, value]
    )
  }

  function handleInterestsChange(event: ChangeEvent<HTMLInputElement>): void {
    toggleValue(event.target.value, setInterests)
    setSubmitted(false)
  }

  function handleLanguagesChange(event: ChangeEvent<HTMLInputElement>): void {
    toggleValue(event.target.value, setLanguages)
    setSubmitted(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="mt-20">
      <div className="responsive-container">
        <div className="flex flex-col gap-10 rounded-[32px] border border-white/15 bg-black/50 p-8 backdrop-blur-md md:p-12 lg:p-16">
          <div className="space-y-4 text-white">
            <p className="text-sm tracking-[0.3em] text-white/60 uppercase">
              {t('newsletterSection.kicker', {
                defaultValue: 'Stay connected'
              })}
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              {t('newsletterSection.title', {
                defaultValue: 'Subscribe to our newsletter'
              })}
            </h2>
            <p className="max-w-3xl text-base text-white/80 md:text-lg">
              {t('newsletterSection.description', {
                defaultValue:
                  'Every month we add new gospel videos to our library, new translations, releases, and tools. Subscribe to our email to be notified about new tools and new media available for you.'
              })}
            </p>
          </div>
          <form
            className="flex flex-col gap-8"
            onSubmit={handleSubmit}
            noValidate
            aria-label={t('newsletterSection.formLabel', {
              defaultValue: 'Subscribe to Watch newsletter'
            })}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="newsletter-name"
                  className="text-sm font-semibold tracking-wide text-white/70 uppercase"
                >
                  {t('newsletterSection.nameLabel', { defaultValue: 'Name' })}
                </label>
                <input
                  id="newsletter-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setSubmitted(false)
                  }}
                  placeholder={t('newsletterSection.namePlaceholder', {
                    defaultValue: 'Your name'
                  })}
                  className="w-full rounded-2xl border border-white/30 bg-white/10 px-5 py-4 text-base text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)] placeholder:text-white/40 focus:border-white focus:ring-2 focus:ring-white/40 focus:outline-none"
                />
                <p className="text-xs text-white/50">
                  {t('newsletterSection.nameHelper', {
                    defaultValue:
                      "We'll use this to personalize your subscription."
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="newsletter-email"
                  className="text-sm font-semibold tracking-wide text-white/70 uppercase"
                >
                  {t('newsletterSection.emailLabel', {
                    defaultValue: 'Email address'
                  })}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setSubmitted(false)
                  }}
                  placeholder={t('newsletterSection.emailPlaceholder', {
                    defaultValue: 'name@example.com'
                  })}
                  className="w-full rounded-2xl border border-white/30 bg-white/10 px-5 py-4 text-base text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)] placeholder:text-white/40 focus:border-white focus:ring-2 focus:ring-white/40 focus:outline-none"
                />
                {email !== '' ? (
                  <p className="text-xs text-white/60">
                    {t('newsletterSection.emailPreview', {
                      defaultValue: 'We will send updates to {{email}}.',
                      email
                    })}
                  </p>
                ) : (
                  <p className="text-xs text-white/50">
                    {t('newsletterSection.emailHelper', {
                      defaultValue:
                        "We'll send updates and resources to this address."
                    })}
                  </p>
                )}
              </div>
            </div>
            {email && (
              <>
                <div className="grid gap-6 lg:grid-cols-3">
                  <fieldset className="flex flex-col gap-4">
                    <legend className="mb-2 text-sm font-semibold tracking-wide text-white/70 uppercase">
                      {t('newsletterSection.audienceLabel', {
                        defaultValue: 'I am'
                      })}
                    </legend>
                    <div className="flex flex-col gap-2 text-white/90">
                      {audienceOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3"
                        >
                          <input
                            type="radio"
                            name="audience"
                            value={option.value}
                            checked={audience === option.value}
                            onChange={handleAudienceChange}
                            className="size-4 accent-white"
                          />
                          <span className="text-sm md:text-base">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="flex flex-col gap-4">
                    <legend className="mb-2 text-sm font-semibold tracking-wide text-white/70 uppercase">
                      {t('newsletterSection.interestsLabel', {
                        defaultValue: 'Topics I am interested in'
                      })}
                    </legend>
                    <div className="flex flex-col gap-2 text-white/90">
                      {interestOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            name="interests"
                            value={option.value}
                            checked={interests.includes(option.value)}
                            onChange={handleInterestsChange}
                            className="size-4 accent-white"
                          />
                          <span className="text-sm md:text-base">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="flex flex-col gap-4">
                    <legend className="mb-2 text-sm font-semibold tracking-wide text-white/70 uppercase">
                      {t('newsletterSection.languagesLabel', {
                        defaultValue: 'Preferred Languages'
                      })}
                    </legend>
                    <div className="flex flex-col gap-2 text-white/90">
                      {languageOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            name="languages"
                            value={option.value}
                            checked={languages.includes(option.value)}
                            onChange={handleLanguagesChange}
                            className="size-4 accent-white"
                          />
                          <span className="text-sm md:text-base">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <Button
                    type="submit"
                    className="h-12 rounded-2xl px-8 text-base font-semibold"
                  >
                    {t('newsletterSection.cta', { defaultValue: 'Sign Up' })}
                  </Button>
                  {submitted && (
                    <p className="text-sm text-emerald-300">
                      {t('newsletterSection.successMessage', {
                        defaultValue:
                          'Thanks for subscribing! We will keep you updated.'
                      })}
                    </p>
                  )}
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
