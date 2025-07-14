# Core Concepts

We use [playwright](https://playwright.dev/) to achieve automation testing.

We primarily use it for functional automation testing & visual regression testing. How they are structured and written is explained in the next section.

## Test Runs

Tests automatically run upon PR creation against dynamically created vercel environment. Note that, what tests gets run is decided by NX's affected strategy. For e.g. when code in journeys app is changed it will deploy journeys code and runs journeys-e2e tests. Also it is understood that, if libs related code is changed and it impacts journeys-admin & journeys it will deploy both the apps and run e2e tests related to it.

## Waits

We don't want to use wait unless necessary. We add a comment to explain why, if at all we have to use it then add //eslint-disable-next-line to it.

## Videos Testing

At the moment there doesn't seem to be an event for when video started or ended. So, we've used a wait for the video to complete. These waits can be removed once videos are integrated with events.
