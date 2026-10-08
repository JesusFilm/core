import type { Journey } from './journeySchema'

/** A short journey: three cards, buttons only. */
export const shortJourney: Journey = {
  title: 'Who is Jesus?',
  description: 'A short introduction to Jesus.',
  steps: [
    {
      name: 'welcome',
      card: {
        name: 'welcome-card',
        theme: 'dark',
        content: [
          {
            type: 'text',
            name: 'welcome-title',
            content: 'Who is Jesus?',
            style: 'title'
          },
          {
            type: 'text',
            name: 'welcome-body',
            content: 'Millions follow him. Take two minutes to find out why.',
            style: 'body'
          },
          {
            type: 'button',
            name: 'welcome-start',
            label: 'Start',
            style: 'primary',
            icon: 'ArrowForwardRounded',
            action: { goTo: 'claims' }
          }
        ]
      }
    },
    {
      name: 'claims',
      card: {
        name: 'claims-card',
        theme: 'dark',
        content: [
          {
            type: 'text',
            name: 'claims-heading',
            content: 'He said he was the way to God',
            style: 'heading'
          },
          {
            type: 'text',
            name: 'claims-body',
            content: '"I am the way, the truth and the life." (John 14:6)',
            style: 'body'
          },
          {
            type: 'button',
            name: 'claims-next',
            label: 'What now?',
            style: 'primary',
            action: { goTo: 'close' }
          }
        ]
      }
    },
    {
      name: 'close',
      card: {
        name: 'close-card',
        theme: 'light',
        content: [
          {
            type: 'text',
            name: 'close-heading',
            content: 'Keep exploring',
            style: 'heading'
          },
          {
            type: 'button',
            name: 'close-link',
            label: 'Read the Gospel of John',
            style: 'secondary',
            icon: 'MenuBookRounded',
            action: { url: 'https://www.bible.com/bible/111/JHN.1.NIV' }
          }
        ]
      }
    }
  ]
}

/** A typical journey with a poll, a multiselect and a text response. */
export const typicalJourney: Journey = {
  title: 'Prayer check-in',
  description: 'Helps people think about prayer and ask for prayer.',
  steps: [
    {
      name: 'intro',
      card: {
        name: 'intro-card',
        theme: 'dark',
        backgroundColor: '#1F2A44',
        content: [
          {
            type: 'text',
            name: 'intro-title',
            content: 'Let’s talk about prayer',
            style: 'title',
            align: 'center'
          },
          {
            type: 'button',
            name: 'intro-start',
            label: 'Begin',
            style: 'primary',
            action: { goTo: 'how-often' }
          }
        ]
      }
    },
    {
      name: 'how-often',
      card: {
        name: 'how-often-card',
        theme: 'dark',
        content: [
          {
            type: 'text',
            name: 'how-often-question',
            content: 'How often do you pray?',
            style: 'heading'
          },
          {
            type: 'poll',
            name: 'how-often-poll',
            options: [
              {
                name: 'how-often-daily',
                label: 'Every day',
                action: { goTo: 'topics' }
              },
              {
                name: 'how-often-sometimes',
                label: 'Sometimes',
                action: { goTo: 'topics' }
              },
              {
                name: 'how-often-never',
                label: 'Never',
                action: { goTo: 'topics' }
              }
            ]
          }
        ]
      }
    },
    {
      name: 'topics',
      card: {
        name: 'topics-card',
        theme: 'dark',
        content: [
          {
            type: 'text',
            name: 'topics-question',
            content: 'What would you like prayer for?',
            style: 'heading'
          },
          {
            type: 'multiselect',
            name: 'topics-select',
            options: [
              { name: 'topics-family', label: 'Family' },
              { name: 'topics-health', label: 'Health' },
              { name: 'topics-work', label: 'Work' },
              { name: 'topics-faith', label: 'Faith' }
            ],
            min: 1
          },
          { type: 'spacer', name: 'topics-gap', size: 'small' },
          {
            type: 'button',
            name: 'topics-next',
            label: 'Next',
            style: 'primary',
            action: { goTo: 'request' }
          }
        ]
      }
    },
    {
      name: 'request',
      card: {
        name: 'request-card',
        theme: 'light',
        content: [
          {
            type: 'text',
            name: 'request-heading',
            content: 'Anything else we can pray for?',
            style: 'heading'
          },
          {
            type: 'textResponse',
            name: 'request-text',
            label: 'Your prayer request',
            placeholder: 'Type here…',
            kind: 'freeForm'
          },
          {
            type: 'textResponse',
            name: 'request-email',
            label: 'Email (optional)',
            kind: 'email'
          },
          {
            type: 'button',
            name: 'request-send',
            label: 'Send',
            style: 'primary',
            icon: 'SendRounded',
            action: { goTo: 'thanks' }
          }
        ]
      }
    },
    {
      name: 'thanks',
      card: {
        name: 'thanks-card',
        theme: 'light',
        content: [
          {
            type: 'text',
            name: 'thanks-heading',
            content: 'Thank you. We’re praying with you.',
            style: 'heading',
            align: 'center'
          }
        ]
      }
    }
  ]
}

/** A journey with a YouTube video, a background image and an inline image. */
export const mediaJourney: Journey = {
  title: 'The Christmas story',
  description: 'Watch the Christmas story and reflect on it.',
  steps: [
    {
      name: 'cover',
      card: {
        name: 'cover-card',
        theme: 'dark',
        fullscreen: true,
        backgroundImage: {
          search: 'starry night over a small village',
          alt: 'A starry night sky over a quiet village'
        },
        content: [
          {
            type: 'text',
            name: 'cover-title',
            content: 'The night everything changed',
            style: 'title'
          },
          {
            type: 'button',
            name: 'cover-watch',
            label: 'Watch',
            style: 'primary',
            icon: 'PlayArrowRounded',
            action: { goTo: 'watch' }
          }
        ]
      }
    },
    {
      name: 'watch',
      next: 'reflect',
      card: {
        name: 'watch-card',
        content: [
          {
            type: 'video',
            name: 'watch-video',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            startAt: 0,
            endAt: 120
          }
        ]
      }
    },
    {
      name: 'reflect',
      card: {
        name: 'reflect-card',
        theme: 'light',
        content: [
          {
            type: 'image',
            name: 'reflect-image',
            image: {
              search: 'candle light warm',
              alt: 'A lit candle'
            }
          },
          {
            type: 'text',
            name: 'reflect-heading',
            content: 'What stood out to you?',
            style: 'heading'
          },
          {
            type: 'textResponse',
            name: 'reflect-answer',
            label: 'Your thoughts',
            kind: 'freeForm'
          },
          {
            type: 'button',
            name: 'reflect-send',
            label: 'Share',
            style: 'primary',
            action: { url: 'https://www.jesusfilm.org' }
          }
        ]
      }
    }
  ]
}

export const exampleJourneys = [shortJourney, typicalJourney, mediaJourney]
