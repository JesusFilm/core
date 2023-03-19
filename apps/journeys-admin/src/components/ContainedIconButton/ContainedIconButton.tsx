import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import { ImageBlockThumbnail } from '../Editor/ImageBlockThumbnail'

interface ContainedIconProps {
  icon?: typeof SvgIcon
  label: string
  onClick: () => void
}

export function ContainedIconButton({
  icon,
  label,
  onClick
}: ContainedIconProps): ReactElement {
  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardActionArea onClick={onClick}>
          <Stack direction="row" alignItems="center" spacing={3} sx={{ p: 2 }}>
            <Box>
              <ImageBlockThumbnail Icon={icon} />
            </Box>
            <Box flexGrow={1} minWidth={0}>
              <Typography variant="subtitle2">{label}</Typography>
            </Box>
            <AddRoundedIcon color="primary" />
          </Stack>
        </CardActionArea>
      </Card>
    </>
  )
}
