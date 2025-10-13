import dynamic from 'next/dynamic'
import Head from 'next/head'

// we MUST load the editor dynamically, otherwise server-side rendering will fail
const Editor = dynamic(() => import('../src/components/editor'), {
  ssr: false,
});

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Studio | Jesus Film Project</title>
      </Head>
      <Editor />
    </>
  )
}
