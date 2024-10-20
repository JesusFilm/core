import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import UserProfile2Icon from '@core/shared/ui/icons/UserProfile2'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { useHostUpdateMutation } from '../../../../../../../../../libs/useHostUpdateMutation'

const ImageLibrary = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ImageLibrary/ImageLibrary" */ '../../../../../Drawer/ImageLibrary'
    ).then((mod) => mod.ImageLibrary),
  { ssr: false }
)

export function HostAvatarsButton(): ReactElement {
  const [open, setOpen] = useState<boolean | undefined>()
  const { journey } = useJourney()
  const { updateHost } = useHostUpdateMutation()
  const [avatarNumber, setAvatarNumber] = useState<number>(1)

  function handleOpen(avatar: 1 | 2): void {
    if (journey?.host != null) {
      setOpen(true)
      setAvatarNumber(avatar)
    }
  }

  async function handleClose(): Promise<void> {
    setOpen(false)
  }

  async function handleChange(avatarImage: ImageBlock): Promise<void> {
    if (journey?.host != null) {
      const { id, teamId } = journey.host
      await updateHost({
        id,
        teamId,
        input: { [`src${avatarNumber}`]: avatarImage.src }
      })
    }
  }

  async function handleDelete(): Promise<void> {
    if (journey?.host != null) {
      const { id, teamId, src2 } = journey.host
      const input =
        avatarNumber === 1 ? { src1: src2, src2: null } : { src2: null }

      await updateHost({ id, teamId, input })
    }
  }

  const hasAvatar1 = journey?.host?.src1 != null || journey?.host?.src2 != null
  const hasAvatar2 = journey?.host?.src1 != null && journey?.host?.src2 != null
  const noAvatarStyles = {
    width: '52px',
    height: '52px'
  }
  const avatarStyles = {
    width: '56px',
    height: '56px'
  }

  return (
    <Stack direction="row" data-testid="HostAvatarsButton">
      <AvatarGroup
        sx={{
          alignItems: 'center',
          '.MuiAvatar-root': {
            cursor: 'pointer',
            borderColor: 'background.paper',
            ml: -4,
            color: (theme) => theme.palette.divider,
            bgcolor: 'background.paper',
            '&:last-child': {
              ml: 0
            }
          }
        }}
      >
        <Avatar
          data-testid="avatar1"
          alt="avatar1"
          onClick={() => handleOpen(1)}
          src={journey?.host?.src1 ?? journey?.host?.src2 ?? undefined}
          sx={
            !hasAvatar1
              ? {
                  ...noAvatarStyles,
                  outline: (theme) => `2px solid ${theme.palette.divider}`
                }
              : avatarStyles
          }
        >
          {journey?.host?.src1 == null && journey?.host?.src2 == null && (
            <UserProfile2Icon />
          )}
        </Avatar>
        <Avatar
          data-testid="avatar2"
          alt="avatar2"
          onClick={() => handleOpen(2)}
          src={hasAvatar2 ? (journey?.host?.src2 ?? undefined) : undefined}
          sx={
            !hasAvatar2
              ? {
                  ...noAvatarStyles,
                  outline: (theme) => `2px solid ${theme.palette.divider}`
                }
              : avatarStyles
          }
        >
          {(journey?.host?.src1 == null || journey?.host?.src2 == null) && (
            <Plus2Icon />
          )}
        </Avatar>
      </AvatarGroup>
      {open != null && (
        <ImageLibrary
          open={open}
          onClose={handleClose}
          onChange={handleChange}
          onDelete={handleDelete}
          selectedBlock={
            journey?.host != null
              ? {
                  id: `avatar${avatarNumber}`,
                  __typename: 'ImageBlock',
                  src: journey.host[`src${avatarNumber}`],
                  alt: `host avatar ${avatarNumber}`,
                  width: 52,
                  height: 52,
                  blurhash: '',
                  parentBlockId: null,
                  parentOrder: 0,
                  scale: null
                }
              : null
          }
        />
      )}
    </Stack>
  )
}
