import Language from '@mui/icons-material/Language'
import Button from '@mui/material/Button'
import MuiListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { sharedUiConfig } from '../../libs/sharedUiConfig'

import { Dialog } from './Dialog'

const DialogStory: Meta<typeof Dialog> = {
  ...sharedUiConfig,
  component: Dialog,
  title: 'Shared-ui/Dialog',
  parameters: {
    theme: 'light'
  }
}

const Template: StoryObj<typeof Dialog> = {
  render: ({ ...args }) => {
    return <Dialog {...args} />
  }
}

export const Basic = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    dialogTitle: { title: 'Simple Dialog' },
    dialogAction: {
      onSubmit: noop,
      submitLabel: t('Ok')
    },
    children: <Typography>This is the content</Typography>
  }
}

export const Loading = {
  ...Template,
  args: {
    loading: true,
    open: true,
    onClose: noop,
    dialogTitle: { title: 'Simple Dialog' },
    dialogAction: {
      onSubmit: noop,
      submitLabel: t('Ok')
    },
    children: <Typography>This is the content</Typography>
  }
}

export const IconTitle = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    dialogTitle: { icon: <Language sx={{ mr: 3 }} />, title: 'Simple Dialog' },
    children: <Typography>This is the content</Typography>
  }
}

export const Form = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    dialogTitle: {
      title: 'Edit Form',
      closeButton: true
    },
    dialogAction: {
      onSubmit: noop,
      closeLabel: 'Cancel'
    },
    // text field as first child has label cut off, see issue: https://github.com/mui/material-ui/issues/29892#issuecomment-979745849
    children: <TextField fullWidth label="Label" value="Value" margin="dense" />
  }
}

export const MinHeight = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    dialogTitle: {
      title: 'Minimum Height Dialog',
      closeButton: true
    },
    children: <Typography>This is the content</Typography>
  }
}

export const ActionComponent = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    dialogTitle: {
      title: 'Custom Action Component Dialog',
      closeButton: true
    },
    dialogActionChildren: (
      <>
        <TextField
          fullWidth
          label="Dialog Action Field"
          value="Value"
          sx={{ ml: 4 }}
          margin="dense"
        />
        <Button sx={{ mx: 2 }}>Add</Button>
      </>
    ),
    children: <Typography>This is the content</Typography>
  }
}

export const Info = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    dialogTitle: {
      title: 'Info Dialog',
      closeButton: true
    },
    divider: true,
    children: (
      <>
        <Typography>This is the content for the information</Typography>
        {[0, 1, 2].map((i) => (
          <MuiListItem sx={{ px: 0 }} key={i}>
            <ListItemAvatar>
              <Skeleton
                animation={false}
                variant="circular"
                width={40}
                height={40}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Skeleton animation={false} variant="text" width="60%" />
              }
              secondary={
                <Skeleton animation={false} variant="text" width="30%" />
              }
            />
          </MuiListItem>
        ))}
      </>
    )
  }
}

export const ExcessText = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    dialogTitle: {
      title: t('Excess text'),
      closeButton: true
    },
    dialogAction: {
      onSubmit: noop,
      submitLabel: t('Accept'),
      closeLabel: t('Cancel')
    },
    divider: true,
    children: (
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean suscipit
        magna a lectus rhoncus, quis molestie velit pellentesque. Phasellus
        semper vestibulum arcu non egestas. Quisque erat massa, semper quis
        purus vitae, commodo rhoncus velit. Vivamus consequat bibendum euismod.
        Morbi vel enim pharetra, vehicula eros ullamcorper, consectetur metus.
        Phasellus vel tincidunt nibh. Cras sit amet ornare quam, non mattis
        eros. Pellentesque habitant morbi tristique senectus et netus et
        malesuada fames ac turpis egestas. In hac habitasse platea dictumst.
        Cras non vestibulum urna. Aenean interdum finibus magna sed luctus.
        Nullam semper efficitur viverra. In hac habitasse platea dictumst. Nunc
        aliquet suscipit lectus, at volutpat ligula auctor egestas. Nulla a
        velit id nisi pharetra euismod. Nulla laoreet velit in neque ultrices
        maximus. Vivamus ullamcorper magna ex. Etiam malesuada scelerisque
        condimentum. Vestibulum ac erat felis. Quisque id aliquet sapien, quis
        commodo turpis. Curabitur eu vestibulum orci, nec luctus odio. Quisque
        dapibus elit ac eros rhoncus finibus. Sed quis sagittis justo. Donec
        justo ipsum, varius a varius eget, ultrices et est. Donec eros dolor,
        auctor id neque at, dignissim mattis ipsum. Sed dignissim nibh ut elit
        sodales, quis suscipit dolor consequat. Vestibulum a felis quis metus
        placerat feugiat. Sed molestie, magna id elementum tincidunt, ex sapien
        sodales sapien, hendrerit aliquam nibh lorem eget mi. Donec vel nibh
        sollicitudin enim convallis varius. Aenean nec malesuada ipsum.
        Suspendisse in diam ac metus pretium pharetra id vel tortor. Integer
        venenatis metus quis augue feugiat, in dictum velit ultrices. In dictum
        ligula enim, vehicula pellentesque enim tempus nec. Duis viverra diam
        sed libero tincidunt fringilla. Integer tincidunt pulvinar venenatis.
        Aenean quam velit, porta sed purus nec, euismod cursus risus. Curabitur
        at vehicula quam. In hac habitasse platea dictumst. Sed ut augue nulla.
        Nam a semper nibh. Aliquam pharetra pellentesque lectus vitae ultricies.
        Praesent ornare, lectus quis mollis convallis, nibh erat sagittis nibh,
        euismod tempor elit nisl a purus. Sed dignissim ultricies dictum. Ut et
        venenatis leo. Morbi pulvinar felis mi.
      </Typography>
    )
  }
}

export const FullScreen = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    dialogTitle: {
      title: 'Full Screen Dialog',
      closeButton: true
    },
    fullscreen: true,
    divider: true,
    children: (
      <>
        <Typography>This is the content for the information</Typography>
        {[0, 1, 2].map((i) => (
          <MuiListItem sx={{ px: 0 }} key={i}>
            <ListItemAvatar>
              <Skeleton
                animation={false}
                variant="circular"
                width={40}
                height={40}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Skeleton animation={false} variant="text" width="100%" />
              }
              secondary={
                <Skeleton animation={false} variant="text" width="60%" />
              }
            />
          </MuiListItem>
        ))}
      </>
    )
  }
}

export default DialogStory
