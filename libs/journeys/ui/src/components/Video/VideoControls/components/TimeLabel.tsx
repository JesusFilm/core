import Typography from '@mui/material/Typography'

export function TimeLabel({
  displayTime,
  duration
}: {
  displayTime: string
  duration: string
}): JSX.Element {
  return (
    <Typography
      variant="caption"
      color="secondary.main"
      noWrap
      overflow="unset"
      sx={{ p: 2 }}
    >
      {displayTime} / {duration}
    </Typography>
  )
}
