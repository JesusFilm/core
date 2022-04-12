import { ReactElement, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useJourney } from '../../../../../libs/context'
import { Dialog } from '../../../../Dialog'
import { ImageBlockEditor } from '../../../ImageBlockEditor'

export function ImageEdit(): ReactElement {
  const { primaryImageBlock } = useJourney()
  const [open, setOpen] = useState(false)

  function handleOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  async function handleChange(): Promise<void> {
    console.log('change')
  }

  async function handleDelete(): Promise<void> {
    console.log('delete')
  }

  return (
    <>
      <Box
        sx={{
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          borderRadius: 2,
          width: '100%',
          height: 194,
          mb: 6,
          backgroundColor: '#EFEFEF'
        }}
      >
        {primaryImageBlock?.src != null ? (
          <Box
            component="img"
            src={primaryImageBlock.src}
            sx={{
              width: '100%',
              height: '194px',
              objectFit: 'cover'
            }}
          />
        ) : (
          <ImageIcon fontSize="large" />
        )}
        <Button
          variant="contained"
          size="small"
          color="secondary"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 10,
            borderRadius: 4
          }}
          startIcon={<ImageIcon fontSize="small" />}
          onClick={handleOpen}
        >
          <Typography variant="caption">Change</Typography>
        </Button>
      </Box>
      <Dialog
        open={open}
        handleClose={handleClose}
        dialogTitle={{ title: 'Social media image', closeButton: true }}
      >
        <ImageBlockEditor
          selectedBlock={primaryImageBlock}
          onChange={handleChange}
          onDelete={handleDelete}
        />
      </Dialog>
    </>
  )
}
