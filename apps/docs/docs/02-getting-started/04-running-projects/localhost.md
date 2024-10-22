---
title: Deploying a project on mobile/tablet
---

# Connecting to localhost on your phone/tablet

## journeys-admin

1. Find the IP address on your machine.

2. Go to `apps/journeys-admin/.env`, and find the `NEXT_PUBLIC_GATWAY_URL` variable.

- Change value to `http://[YOUR_IP_ADDRESS]:4000`. For example, if your IP address was `123.4.5.6`, then send the variable to `http:123.4.5.6:4000`

3. Start the serve on your machine by running `nf start` & `nx serve journeys-admin`
