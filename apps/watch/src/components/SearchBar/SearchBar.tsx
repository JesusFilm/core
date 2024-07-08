import { ReactElement } from 'react'

export function SearchBar(): ReactElement {
  return (
    <form>
      <input
        type="text"
        placeholder="Search by topic, occasion, or audience ..."
      />
    </form>
  )
}
