import { ReactElement, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import ArrowDropUp from '@mui/icons-material/ArrowDropUp'
import Typography from '@mui/material/Typography'




export function FilterContainer(): ReactElement {
  const [openRow, setOpenRow] = useState<number>(0)

  return (
    <TableContainer >
      <Table >
        <TableBody>
          <TableRow
            key={1}
          >
            <TableCell onClick={() => setOpenRow(1)}>
              <Typography >Languages</Typography>
              <ArrowDropDown/>
            </TableCell>
          </TableRow>
          {openRow === 1 ? 
            <TableRow
              key={1.5}
            >
              <TableCell onClick={() => setOpenRow(0)}>
                <Typography >Languages Open</Typography>
                <ArrowDropUp/>
              </TableCell>
            </TableRow> : <></>}
          <TableRow
            key={2}
          >
            <TableCell onClick={() => setOpenRow(2)}>
              <Typography >Subtitles</Typography>
              <ArrowDropDown/>
            </TableCell>
          </TableRow>
          {openRow === 2 ? 
            <TableRow
              key={1.5}
            >
              <TableCell onClick={() => setOpenRow(0)}>
                <Typography >Subtitles Open</Typography>
                <ArrowDropUp/>
              </TableCell>
            </TableRow> : <></>}
          <TableRow
            key={3}
          >
            <TableCell onClick={() => setOpenRow(3)}>
              <Typography >Title</Typography>
              <ArrowDropDown/>
            </TableCell>
          </TableRow>
          {openRow === 3 ? 
            <TableRow
              key={1.5}
            >
              <TableCell onClick={() => setOpenRow(0)}>
                <Typography >Title Open</Typography>
                <ArrowDropUp/>
              </TableCell>
            </TableRow> : <></>}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
