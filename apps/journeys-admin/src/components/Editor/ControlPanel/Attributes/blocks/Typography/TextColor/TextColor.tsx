import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import capitalize from 'lodash/capitalize'
import Paper from '@mui/material/Paper'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { TypographyColor } from '../../../../../../../../__generated__/globalTypes'

interface TextColorProps {
  id: string
  color: TypographyColor | null
}

export function TextColor({ id, color }: TextColorProps): ReactElement {
  const [selected, setSelected] = useState(color ?? 'primary')

  function handleChange(
    event: React.MouseEvent<HTMLElement>,
    align: string
  ): void {
    if (align != null) {
      setSelected(align)
    }
  }

  const order = ['primary', 'secondary', 'error']
  const sorted = Object.values(TypographyColor).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  return (
    // <>
    //   <List
    //     sx={{
    //       '&& .Mui-selected, && .Mui-selected:hover': {
    //         bgcolor: 'background.default',
    //         '&, & .MuiListItemIcon-root': {
    //           color: 'primary.main'
    //         }
    //       }
    //     }}
    //   >
    //     {sorted.map((color) => {
    //       return (
    //         <ListItemButton
    //           key={`${id}-color-${color}`}
    //           onClick={() => handleClick(color)}
    //           selected={color === selected}
    //           sx={{
    //             borderRadius: 0,
    //             border: '1px solid',
    //             borderColor: 'divider',
    //             borderBottom: 'none',
    //             bgcolor: 'background.paper',
    //             '&:first-of-type': {
    //               borderTopLeftRadius: 12,
    //               borderTopRightRadius: 12
    //             },
    //             '&:last-of-type': {
    //               borderBottomLeftRadius: 12,
    //               borderBottomRightRadius: 12,
    //               borderBottom: '1px solid',
    //               borderColor: 'divider'
    //             }
    //           }}
    //         >
    //           <ListItemIcon>
    //             <Paper
    //               sx={{
    //                 borderRadius: 1000
    //               }}
    //             >
    //               <Box
    //                 data-testid="backgroundColorIcon"
    //                 sx={{
    //                   width: 20,
    //                   height: 20,
    //                   m: 1,
    //                   borderRadius: 1000,
    //                   backgroundColor: `${color ?? 'primary'}.main`
    //                 }}
    //               />
    //             </Paper>
    //           </ListItemIcon>
    //           <ListItemText>{capitalize(color)}</ListItemText>
    //         </ListItemButton>
    //       )
    //     })}
    //   </List>
    // </>
    <ToggleButtonGroup
      orientation="vertical"
      value={selected}
      exclusive
      onChange={handleChange}
      fullWidth
      sx={{
        display: 'flex',
        px: 6,
        pt: 4
      }}
    >
      {sorted.map((color) => {
        return (
          <ToggleButton
            value={color}
            key={`${id}-align-${color}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            {
              <Paper
                sx={{
                  borderRadius: 1000
                }}
              >
                <Box
                  data-testid="backgroundColorIcon"
                  sx={{
                    width: 20,
                    height: 20,
                    m: 1,
                    borderRadius: 1000,
                    backgroundColor: `${color ?? 'primary'}.main`
                  }}
                />
              </Paper>
            }
            <Typography variant="subtitle2">{capitalize(color)}</Typography>
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}
