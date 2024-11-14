# Visual Testing

Testing visual components is done via 2 methods:

- [Snapshot testing](https://kentcdodds.com/blog/effective-snapshot-testing) - compares the rendered HTML code for a component to some reference component HTML.
- Visual regression testing - compares a screenshot of the component to some reference screenshot

Visual regression testing alone is sufficient for our project. Using [Chromatic](https://www.chromatic.com/docs/) with [stories](../storybook/#what-is-a-story) we are able to flag code changes which produce undesired visual effects before releasing to production.

Currently, we have an 80k snapshot limit per month for visual regression testing. To manage this limit effectively and avoid exceeding it, we’ve introduced a GitHub label called `chromatic`. Assign this label to Pull Requests only when they require visual testing.

Visual testing is a required GitHub Action check. This means you won’t be able to merge to production until you apply this label to your PR if it includes any visual changes.

![ChromaticLabel](./chromatic-label.png)

## UI Review

Used by UX to review our storybook components.

# UI Change Requests

You do not have to wait for Design's approval before pushing in UI changes. If the change looks right to you (i.e. match the designs), push in the change and let the Designer know.
If there are areas they are not happy with, they will create another ticket for it or ask for the change to be reverted.
However, if:

- Your code changes touch other feature/s
- You haven't been with us for very long and don't feel comfortable
- Or you are a Junior Product Engineer

Submit it for QA approval before pushing in the change.
Some UX changes would also fit in this category (of no design review), especially smaller, isolated changes. But all UX changes will need to be QA approved.

## UI Tests

Used by devs to update the component snapshots in our unified chromatic snapshot library.

## TurboSnap

This feature enables Chromatic to only snap images for the affected stories.

You can check if snapshots are correctly being skipped via the Turbosnap status on the UI Test page for a PR.

![Turbosnap](./turbosnap.png)
