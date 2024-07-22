import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useHits, useRefinementList } from 'react-instantsearch'

export function CategoriesFilter(): ReactElement {
  const hits = useHits()

  const { items, refine } = useRefinementList({ attribute: 'tags.Felt Needs' })
  console.log(items)
  return (
    <>
      <Typography variant="h4">Categories</Typography>
      <List>
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemText primary={item.label} />
            <Checkbox
              checked={item.isRefined}
              onChange={() => refine(item.value)}
            />
          </ListItem>
        ))}
      </List>
    </>
  )
}
