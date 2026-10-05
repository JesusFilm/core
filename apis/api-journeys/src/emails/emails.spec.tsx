import { ReactElement } from 'react'

import { JourneyAccessRequestEmail } from './templates/JourneyAccessRequest'
import { JourneySharedEmail } from './templates/JourneyShared'
import { JourneySharedNoAccountEmail } from './templates/JourneyShared/JourneySharedNoAccount'
import { TeamInviteEmail } from './templates/TeamInvite'
import { TeamInviteNoAccountEmail } from './templates/TeamInvite/TeamInviteNoAccount'
import { TeamInviteAcceptedEmail } from './templates/TeamInviteAccepted'
import { TeamRemovedEmail } from './templates/TeamRemoved'
import { VisitorInteraction } from './templates/VisitorInteraction'

const templates: Array<[string, ReactElement]> = [
  [
    'JourneyAccessRequest',
    <JourneyAccessRequestEmail {...JourneyAccessRequestEmail.PreviewProps} />
  ],
  [
    'JourneyShared',
    <JourneySharedEmail {...JourneySharedEmail.PreviewProps} />
  ],
  [
    'JourneySharedNoAccount',
    <JourneySharedNoAccountEmail
      {...JourneySharedNoAccountEmail.PreviewProps}
    />
  ],
  ['TeamInvite', <TeamInviteEmail {...TeamInviteEmail.PreviewProps} />],
  [
    'TeamInviteNoAccount',
    <TeamInviteNoAccountEmail {...TeamInviteNoAccountEmail.PreviewProps} />
  ],
  [
    'TeamInviteAccepted',
    <TeamInviteAcceptedEmail {...TeamInviteAcceptedEmail.PreviewProps} />
  ],
  ['TeamRemoved', <TeamRemovedEmail {...TeamRemovedEmail.PreviewProps} />],
  [
    'VisitorInteraction',
    <VisitorInteraction {...VisitorInteraction.PreviewProps} />
  ]
]

// the suite-wide setup file stubs render(), but these tests need the real
// renderer to exercise Tailwind class inlining
async function renderTemplate(template: ReactElement): Promise<string> {
  const { render } = await vi.importActual<{
    render: (node: ReactElement) => Promise<string>
  }>('react-email')
  return await render(template)
}

describe('email templates', () => {
  it.each(templates)(
    '%s renders every Tailwind class it uses',
    async (_name, template) => {
      // Tailwind throws on classes it cannot inline into an email
      await expect(renderTemplate(template)).resolves.toContain('<body')
    }
  )

  it.each(templates)(
    '%s paints the page background on the body element',
    async (_name, template) => {
      // email clients size the message to its content, so the background has
      // to sit on <body> for it to fill the reading pane
      const html = await renderTemplate(template)
      const body = html.match(/<body[^>]*>/)?.[0] ?? ''
      expect(body).toContain('background-color:rgb(239,239,239)')
    }
  )
})
