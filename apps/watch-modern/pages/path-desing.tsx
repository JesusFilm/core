import Head from 'next/head'

import { ConversationPathOverview } from '../src/components/newPage/ConversationPathOverview'

const conversationSequence = [
  'Acknowledge struggle',
  'Express empathy',
  'Share comforting truth',
  'Point to hope',
  'Invite prayer'
]

const conversationRationale = `This flow gently validates the person's pain, builds connection through empathy, introduces biblical comfort, directs toward gospel hope, and ends with prayer to foster spiritual support and openness.`

export default function ConversationPathDesignPreview(): JSX.Element {
  return (
    <>
      <Head>
        <title>Conversation Path Design Preview</title>
      </Head>
      <main className="min-h-screen bg-muted/40 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-3xl font-semibold text-foreground">
            Conversation Path
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Preview page for validating the updated Conversation Path component
            styling.
          </p>
          <div className="mt-8">
            <ConversationPathOverview
              sequence={conversationSequence}
              rationale={conversationRationale}
            />
          </div>
        </div>
      </main>
    </>
  )
}
