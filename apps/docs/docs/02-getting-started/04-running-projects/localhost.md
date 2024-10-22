---
title: Deploying a project on mobile/tablet
---

# Connecting to localhost on your phone/tablet

## journeys-admin

1. Find the IP address on your machine.

2. Go to `apps/journeys-admin/.env`, and find the `NEXT_PUBLIC_GATWAY_URL` variable.

- Change value to `http://[YOUR_IP_ADDRESS]:4000`. For example, if your IP address was `123.4.5.6`, then set the variable to `http:123.4.5.6:4000`

3. Start the server on your machine by running `nf start` & `nx serve journeys-admin`

4. On your phone/tablet, open a browser

- Navigate to `http://[YOUR_IP_ADDRESS]:4200`

## journeys

1. Find the IP address on your machine.

2. Go to `apps/journeys/.env`, and find the `NEXT_PUBLIC_ROOT_DOMAIN` variable.

- Change the to `http://[YOUR_IP_ADDRESS]:4100`. For example, if your IP address was `123.4.5.6`, then set the variable to `http:123.4.5.6:4100`

3. Start the server on your machine by running `nf start` & `nx serve journeys-admin`

- If you had these running already, restart them.

4. On your phone/tablet, open a browser

- Navigate to `http://[YOUR_IP_ADDRESS]:4100`
