import { EmailDemo } from '../../src/components/EmailDemo'
import Head from 'next/head'

export default function EmailPage() {
  return (
    <>
      <Head>
        <title>Email - Your video has been viewed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <EmailDemo />
    </>
  )
}
