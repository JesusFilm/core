import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import { useTheme } from '@mui/material/styles'
import { TransitionProps } from '@mui/material/transitions'
import Typography from '@mui/material/Typography'
import { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Root
} from '@mui/x-tree-view/TreeItem2'
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon'
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider'
import {
  UseTreeItem2Parameters,
  unstable_useTreeItem2 as useTreeItem2
} from '@mui/x-tree-view/useTreeItem2'
import { animated, useSpring } from '@react-spring/web'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import { HTMLAttributes, ReactElement, ReactNode, Ref, forwardRef } from 'react'

type Color = 'blue' | 'green'

interface ExtendedTreeItemProps {
  color?: Color
  id: string
  label: string
}

const ITEMS: Array<TreeViewBaseItem<ExtendedTreeItemProps>> = [
  {
    id: '1',
    label: 'Website',
    children: [
      { id: '1.1', label: 'Home', color: 'green' },
      { id: '1.2', label: 'Pricing', color: 'green' },
      { id: '1.3', label: 'About us', color: 'green' },
      {
        id: '1.4',
        label: 'Blog',
        children: [
          { id: '1.1.1', label: 'Announcements', color: 'blue' },
          { id: '1.1.2', label: 'April lookahead', color: 'blue' },
          { id: '1.1.3', label: "What's new", color: 'blue' },
          { id: '1.1.4', label: 'Meet the team', color: 'blue' }
        ]
      }
    ]
  },
  {
    id: '2',
    label: 'Store',
    children: [
      { id: '2.1', label: 'All products', color: 'green' },
      {
        id: '2.2',
        label: 'Categories',
        children: [
          { id: '2.2.1', label: 'Gadgets', color: 'blue' },
          { id: '2.2.2', label: 'Phones', color: 'blue' },
          { id: '2.2.3', label: 'Wearables', color: 'blue' }
        ]
      },
      { id: '2.3', label: 'Bestsellers', color: 'green' },
      { id: '2.4', label: 'Sales', color: 'green' }
    ]
  },
  { id: '4', label: 'Contact', color: 'blue' },
  { id: '5', label: 'Help', color: 'blue' }
]

function DotIcon({ color }: { color: string }): ReactElement {
  return (
    <Box sx={{ marginRight: 1, display: 'flex', alignItems: 'center' }}>
      <svg width={6} height={6}>
        <circle cx={3} cy={3} r={3} fill={color} />
      </svg>
    </Box>
  )
}

const AnimatedCollapse = animated(Collapse)

function TransitionComponent(props: TransitionProps): ReactElement {
  const style = useSpring({
    to: {
      opacity: props.in === true ? 1 : 0,
      transform: `translate3d(0,${props.in === true ? 0 : 20}px,0)`
    }
  })

  return <AnimatedCollapse style={style} {...props} />
}

interface CustomLabelProps {
  children: ReactNode
  color?: Color
  expandable?: boolean
}

function CustomLabel({
  color,
  expandable,
  children,
  ...other
}: CustomLabelProps): ReactElement {
  const theme = useTheme()
  const colors = {
    blue: theme.palette.primary.main,
    green: theme.palette.success.main
  }

  const iconColor = color != null ? colors[color] : null
  return (
    <TreeItem2Label {...other} sx={{ display: 'flex', alignItems: 'center' }}>
      {iconColor != null && <DotIcon color={iconColor} />}
      <Typography
        className="labelText"
        variant="body2"
        sx={{ color: 'text.primary' }}
      >
        {children}
      </Typography>
    </TreeItem2Label>
  )
}

interface CustomTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const CustomTreeItem = forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: Ref<HTMLLIElement>
) {
  const { id, itemId, label, disabled, children, ...other } = props

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
    publicAPI
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref })

  const item = publicAPI.getItem(itemId)
  const color = item?.color
  return (
    <TreeItem2Provider itemId={itemId}>
      <TreeItem2Root {...getRootProps(other)}>
        <TreeItem2Content
          {...getContentProps({
            className: clsx('content', {
              expanded: status.expanded,
              selected: status.selected,
              focused: status.focused,
              disabled: status.disabled
            })
          })}
        >
          {status.expandable && (
            <TreeItem2IconContainer {...getIconContainerProps()}>
              <TreeItem2Icon status={status} />
            </TreeItem2IconContainer>
          )}

          <CustomLabel {...getLabelProps({ color })} />
        </TreeItem2Content>
        {children != null && (
          <TransitionComponent
            {...getGroupTransitionProps({ className: 'groupTransition' })}
          />
        )}
      </TreeItem2Root>
    </TreeItem2Provider>
  )
})

export function CustomizedTreeView(): ReactElement {
  const t = useTranslations()
  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          {t('Product tree')}
        </Typography>
        <RichTreeView
          items={ITEMS}
          aria-label="pages"
          multiSelect
          defaultExpandedItems={['1', '1.1']}
          defaultSelectedItems={['1.1', '1.1.1']}
          sx={{
            m: '0 -8px',
            pb: '8px',
            height: 'fit-content',
            flexGrow: 1,
            overflowY: 'auto'
          }}
          slots={{ item: CustomTreeItem }}
        />
      </CardContent>
    </Card>
  )
}
