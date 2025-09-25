import { useTranslation } from 'next-i18next'
import {
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type ReactElement,
  useMemo,
  useState
} from 'react'

import { Button } from '../Button'

type AudienceOption = 'missionary' | 'organization' | 'private'

interface SelectOption {
  value: string
  label: string
}

export function SectionNewsletterSignup(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [email, setEmail] = useState('')
  const [audience, setAudience] = useState<AudienceOption>('missionary')
  const [interests, setInterests] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const audienceOptions: Array<{ value: AudienceOption; label: string }> = useMemo(
    () => [
      {
        value: 'missionary',
        label: t('newsletterSection.audience.missionary', {
          defaultValue: 'Missionary'
        })
      },
      {
        value: 'organization',
        label: t('newsletterSection.audience.organization', {
          defaultValue: 'Mission organization'
        })
      },
      {
        value: 'private',
        label: t('newsletterSection.audience.private', {
          defaultValue: 'Private person'
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
          defaultValue: 'New gospel videos'
        })
      },
      {
        value: 'newTranslations',
        label: t('newsletterSection.interests.newTranslations', {
          defaultValue: 'New translations'
        })
      },
      {
        value: 'newReleases',
        label: t('newsletterSection.interests.newReleases', {
          defaultValue: 'New releases'
        })
      },
      {
        value: 'newTools',
        label: t('newsletterSection.interests.newTools', {
          defaultValue: 'New tools'
        })
      }
    ],
    [t]
  )

  const languageOptions: SelectOption[] = useMemo(
    () => [
      {
        value: 'english',
        label: t('newsletterSection.languages.english', { defaultValue: 'English' })
      },
      {
        value: 'spanish',
        label: t('newsletterSection.languages.spanish', { defaultValue: 'Spanish' })
      },
      {
        value: 'french',
        label: t('newsletterSection.languages.french', { defaultValue: 'French' })
      },
      {
        value: 'portuguese',
        label: t('newsletterSection.languages.portuguese', {
          defaultValue: 'Portuguese'
        })
      },
      {
        value: 'chinese',
        label: t('newsletterSection.languages.chinese', { defaultValue: 'Chinese' })
      }
    ],
    [t]
  )

  function handleAudienceChange(event: ChangeEvent<HTMLInputElement>): void {
    setAudience(event.target.value as AudienceOption)
    setSubmitted(false)
  }

  function toggleValue(value: string, setState: Dispatch<React.SetStateAction<string[]>>): void {
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
        <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-[32px] p-8 md:p-12 lg:p-16 flex flex-col gap-10">
          <div className="space-y-4 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              {t('newsletterSection.kicker', { defaultValue: 'Stay connected' })}
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              {t('newsletterSection.title', {
                defaultValue: 'Subscribe to our newsletter'
              })}
            </h2>
            <p className="text-base md:text-lg text-white/80 max-w-3xl">
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
            <div className="flex flex-col gap-3">
              <label
                htmlFor="newsletter-email"
                className="text-sm font-semibold uppercase tracking-wide text-white/70"
              >
                {t('newsletterSection.emailLabel', { defaultValue: 'Email address' })}
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
                className="w-full rounded-2xl border border-white/30 bg-white/10 px-5 py-4 text-base text-white placeholder:text-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
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
                    defaultValue: 'Enter the email where you would like to receive Watch updates.'
                  })}
                </p>
              )}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <fieldset className="flex flex-col gap-4">
                <legend className="text-sm font-semibold uppercase tracking-wide text-white/70">
                  {t('newsletterSection.audienceLabel', {
                    defaultValue: 'I am'
                  })}
                </legend>
                <div className="flex flex-col gap-2 text-white/90">
                  {audienceOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 hover:border-white/40 transition-colors"
                    >
                      <input
                        type="radio"
                        name="audience"
                        value={option.value}
                        checked={audience === option.value}
                        onChange={handleAudienceChange}
                        className="size-4 accent-white"
                      />
                      <span className="text-sm md:text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="flex flex-col gap-4">
                <legend className="text-sm font-semibold uppercase tracking-wide text-white/70">
                  {t('newsletterSection.interestsLabel', {
                    defaultValue: 'Topics I am interested in'
                  })}
                </legend>
                <div className="flex flex-col gap-2 text-white/90">
                  {interestOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 hover:border-white/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="interests"
                        value={option.value}
                        checked={interests.includes(option.value)}
                        onChange={handleInterestsChange}
                        className="size-4 accent-white"
                      />
                      <span className="text-sm md:text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="flex flex-col gap-4">
                <legend className="text-sm font-semibold uppercase tracking-wide text-white/70">
                  {t('newsletterSection.languagesLabel', {
                    defaultValue: 'Languages I want updates in'
                  })}
                </legend>
                <div className="flex flex-col gap-2 text-white/90">
                  {languageOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 hover:border-white/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="languages"
                        value={option.value}
                        checked={languages.includes(option.value)}
                        onChange={handleLanguagesChange}
                        className="size-4 accent-white"
                      />
                      <span className="text-sm md:text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Button type="submit" className="h-12 rounded-2xl px-8 text-base font-semibold">
                {t('newsletterSection.cta', { defaultValue: 'Subscribe' })}
              </Button>
              {submitted && (
                <p className="text-sm text-emerald-300">
                  {t('newsletterSection.successMessage', {
                    defaultValue: 'Thanks for subscribing! We will keep you updated.'
                  })}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
