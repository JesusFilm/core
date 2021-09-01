import { ReactElement } from 'react'
import { Conductor } from '../src/components/Conductor'
import Link from 'next/link'
import { BlockType } from '../src/types'
import { data1, data2, data3 } from '../src/data'
import transformer from '../src/libs/transformer'
import { useRouter } from 'next/dist/client/router'
import { Container, Typography } from '@material-ui/core'

const transformed1 = transformer<BlockType>(data1)
const transformed2 = transformer<BlockType>(data2)
const transformed3 = transformer<BlockType>(data3)

export function App (): ReactElement {
  const { query: { slug } } = useRouter()

  return (
        <Container>
          <Typography variant="h1">Block renderer and conductor samples</Typography>
          <Link href="/example-1">Example 1.</Link>
          <Link href="/example-2">Example 2.</Link>
          <Link href="/example-3">Example 3.</Link>
        <main>
          {slug === 'example-1' && <Conductor blocks={transformed1} />}
          {slug === 'example-2' && <Conductor blocks={transformed2} />}
          {slug === 'example-3' && <Conductor blocks={transformed3} />}
        </main>
        </Container>
  )
}

export default App
