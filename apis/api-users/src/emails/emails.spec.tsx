import { ReactElement } from 'react'
import { render } from 'react-email'

import { EmailVerifyJesusFilmOne, EmailVerifyNextSteps } from './templates'

const templates: Array<[string, ReactElement]> = [
  [
    'EmailVerifyJesusFilmOne',
    <EmailVerifyJesusFilmOne {...EmailVerifyJesusFilmOne.PreviewProps} />
  ],
  [
    'EmailVerifyNextSteps',
    <EmailVerifyNextSteps {...EmailVerifyNextSteps.PreviewProps} />
  ]
]

describe('email templates', () => {
  it.each(templates)(
    '%s renders every Tailwind class it uses',
    async (_name, template) => {
      // Tailwind throws on classes it cannot inline into an email
      await expect(render(template)).resolves.toContain('<body')
    }
  )

  it.each(templates)(
    '%s paints the page background on the body element',
    async (_name, template) => {
      // email clients size the message to its content, so the background has
      // to sit on <body> for it to fill the reading pane
      const html = await render(template)
      const body = html.match(/<body[^>]*>/)?.[0] ?? ''
      expect(body).toContain('background-color:rgb(239,239,239)')
    }
  )
})
