import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useEffect, useState } from 'react'
import MuiDrawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Close } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { gql, useQuery } from '@apollo/client'
import { GetLanguages } from '../../../../../../__generated__/GetLanguages'

export const DRAWER_WIDTH = 328

interface DrawerProps {
  open?: boolean
  onClose: () => void
  onChange: (selectedIds: string[]) => void
  selectedIds: string[]
  currentLanguageId: string
}

export const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID) {
    languages {
      id
      name(languageId: $languageId, primary: true) {
        value
        primary
      }
    }
  }
`

export function Drawer({
  open,
  onClose: handleClose,
  onChange: handleChange,
  selectedIds: initialSelectedIds,
  currentLanguageId
}: DrawerProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)
  const { data } = useQuery<GetLanguages>(GET_LANGUAGES, {
    variables: { languageId: currentLanguageId }
  })

  useEffect(() => {
    setSelectedIds(initialSelectedIds)
  }, [initialSelectedIds])

  const handleToggle = (id: string) => () => {
    const currentIndex = selectedIds.indexOf(id)
    const newSelectedIds = [...selectedIds]

    if (currentIndex === -1) {
      newSelectedIds.push(id)
    } else {
      newSelectedIds.splice(currentIndex, 1)
    }

    setSelectedIds(newSelectedIds)
  }

  const handleClear = (): void => {
    setSelectedIds([])
  }

  const handleApply = (): void => {
    handleChange(selectedIds)
    handleClose()
  }

  return (
    <MuiDrawer
      anchor={smUp ? 'right' : 'bottom'}
      variant="temporary"
      open={open}
      onClose={handleClose}
      elevation={smUp ? 1 : undefined}
      hideBackdrop={smUp}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: { sm: 'border-box' },
          width: { sm: DRAWER_WIDTH }
        }
      }}
    >
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Language
          </Typography>
          <IconButton onClick={handleClose} edge="end" aria-label="Close">
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {data?.languages?.map(({ id, name }) => (
          <ListItem disablePadding key={id}>
            <ListItemButton role={undefined} onClick={handleToggle(id)} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selectedIds.includes(id)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': id }}
                />
              </ListItemIcon>
              <ListItemText
                id={id}
                primary={
                  name.find(({ primary }) => !primary)?.value ??
                  name.find(({ primary }) => primary)?.value
                }
                secondary={name.find(({ primary }) => primary)?.value}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3 }}>
        <Button onClick={handleClear} disabled={selectedIds.length === 0}>
          Clear
        </Button>
        <Button onClick={handleApply}>Apply</Button>
      </Box>
    </MuiDrawer>
  )
}
