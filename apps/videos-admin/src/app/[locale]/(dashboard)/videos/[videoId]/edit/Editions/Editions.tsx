import { CircularProgress, Stack } from '@mui/material'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'

import { Section } from '../../../../../../../components/Section'

const Container = styled(Box)({
  height: 240,
  display: 'grid',
  placeItems: 'center'
})

export function Editions({ loading, editions }): ReactElement {
  return (
    <Section title="Editions">
      {loading ? (
        <Container>
          <CircularProgress />
        </Container>
      ) : (
        <h1>Editions</h1>
      )}
    </Section>
  )
}
