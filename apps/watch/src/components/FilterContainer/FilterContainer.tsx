import { ReactElement, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import VolumeUp from '@mui/icons-material/VolumeUp'
import Subtitles from '@mui/icons-material/Subtitles'
import Title from '@mui/icons-material/Title'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { LanguageAutocompleteProps } from '@core/shared/ui/LanguageAutocomplete'
import { OutlinedTextFieldProps } from '@mui/material/TextField'

interface FilterContainerProps {
  subtitleSwitcher: ReactElement<LanguageAutocompleteProps>
  audioSwitcher: ReactElement<LanguageAutocompleteProps>
  titleSearch: ReactElement<OutlinedTextFieldProps>
}

export function FilterContainer({
  subtitleSwitcher,
  audioSwitcher,
  titleSearch
}: FilterContainerProps): ReactElement {
  const [openRow, setOpenRow] = useState<number>(1)
  return (
    <TableContainer
      sx={{ border: 1, borderColor: '#AAACBB', borderRadius: '8px' }}
    >
      <Table>
        <TableBody>
          <TableRow key={1}>
            <TableCell
              sx={{ borderBottom: 1, borderColor: '#AAACBB' }}
              align="center"
              onClick={() => setOpenRow(1)}
            >
              <Stack direction="row" spacing={2}>
                <VolumeUp />
                <Typography>Languages</Typography>
                {openRow === 1 ? (
                  <KeyboardArrowUp style={{ marginLeft: 'auto' }} />
                ) : (
                  <KeyboardArrowDown style={{ marginLeft: 'auto' }} />
                )}
              </Stack>
            </TableCell>
          </TableRow>
          {openRow === 1 ? (
            <TableRow key={1.5}>
              <TableCell
                align="center"
                sx={{
                  backgroundColor: '#DCDDE5',
                  borderBottom: 1,
                  borderColor: '#AAACBB'
                }}
              >
                {audioSwitcher}
              </TableCell>
            </TableRow>
          ) : (
            <></>
          )}
          <TableRow key={2}>
            <TableCell
              data-testid="subtitleContainer"
              align="center"
              sx={{ borderBottom: 1, borderColor: '#AAACBB' }}
              onClick={() => setOpenRow(2)}
            >
              <Stack direction="row" spacing={2}>
                <Subtitles />
                <Typography>Subtitles</Typography>
                {openRow === 2 ? (
                  <KeyboardArrowUp style={{ marginLeft: 'auto' }} />
                ) : (
                  <KeyboardArrowDown style={{ marginLeft: 'auto' }} />
                )}
              </Stack>
            </TableCell>
          </TableRow>
          {openRow === 2 ? (
            <TableRow key={2.5}>
              <TableCell
                align="center"
                sx={{
                  backgroundColor: '#DCDDE5',
                  borderBottom: 1,
                  borderColor: '#AAACBB'
                }}
              >
                {subtitleSwitcher}
              </TableCell>
            </TableRow>
          ) : (
            <></>
          )}
          <TableRow key={3}>
            <TableCell
              align="center"
              sx={{
                borderBottom: openRow === 3 ? 1 : 0,
                borderColor: '#AAACBB'
              }}
              onClick={() => setOpenRow(3)}
            >
              <Stack direction="row" spacing={2}>
                <Title />
                <Typography>Title</Typography>
                {openRow === 3 ? (
                  <KeyboardArrowUp style={{ marginLeft: 'auto' }} />
                ) : (
                  <KeyboardArrowDown style={{ marginLeft: 'auto' }} />
                )}
              </Stack>
            </TableCell>
          </TableRow>
          {openRow === 3 ? (
            <TableRow key={3.5}>
              <TableCell align="center" sx={{ backgroundColor: '#DCDDE5' }}>
                {titleSearch}
              </TableCell>
            </TableRow>
          ) : (
            <></>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
