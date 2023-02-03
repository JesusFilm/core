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

export function FilterContainer(): ReactElement {
  const [openRow, setOpenRow] = useState<number>(0)

  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRow key={1}>
            <TableCell align="center" onClick={() => setOpenRow(1)}>
              <Stack direction="row" justifyContent="center" spacing={2}>
                <VolumeUp />
                <Typography>Languages</Typography>
                {openRow === 1 ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </Stack>
            </TableCell>
          </TableRow>
          {openRow === 1 ? (
            <TableRow key={1.5}>
              <TableCell align="center" onClick={() => setOpenRow(0)}>
                <Typography>Languages Component Here</Typography>
              </TableCell>
            </TableRow>
          ) : (
            <></>
          )}
          <TableRow key={2}>
            <TableCell align="center" onClick={() => setOpenRow(2)}>
              <Stack direction="row" justifyContent="center" spacing={2}>
                <Subtitles />
                <Typography>Subtitles</Typography>
                {openRow === 2 ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </Stack>
            </TableCell>
          </TableRow>
          {openRow === 2 ? (
            <TableRow key={1.5}>
              <TableCell align="center" onClick={() => setOpenRow(0)}>
                <Typography>Subtitles Component Here</Typography>
              </TableCell>
            </TableRow>
          ) : (
            <></>
          )}
          <TableRow key={3}>
            <TableCell align="center" onClick={() => setOpenRow(3)}>
              <Stack direction="row" justifyContent="center" spacing={2}>
                <Title />
                <Typography>Title</Typography>
                {openRow === 3 ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </Stack>
            </TableCell>
          </TableRow>
          {openRow === 3 ? (
            <TableRow key={1.5}>
              <TableCell align="center" onClick={() => setOpenRow(0)}>
                <Typography>Title Component Here</Typography>
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
