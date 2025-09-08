# On a Phone/Tablet

## journeys-admin

1. Find the IP address on your machine.
   - On Mac, go to Settings -> Network -> Wifi. Next to the network you're connected to, click "Details". You should see your IP address at the bottom.

   - On Windows, go to Settings -> Network and Internet -> Wifi. Scroll down to see your IPv4 Address, which is your IP address.

2. Go to `apps/journeys-admin/.env`, and find the `NEXT_PUBLIC_GATEWAY_URL` variable.
   - Change the value to `http://[YOUR_IP_ADDRESS]:4000/`. For example, if your IP address was `123.4.5.6`, then set the variable to `http://123.4.5.6:4000/`

3. Start the server on your machine by running `nf start` & `nx serve journeys-admin`

4. On your phone/tablet, open a browser
   - Navigate to `http://[YOUR_IP_ADDRESS]:4200`

## journeys

1. Find the IP address on your machine(same steps as above).

2. Go to `apps/journeys/.env`, and find the `NEXT_PUBLIC_ROOT_DOMAIN` variable.
   - Change the value to `[YOUR_IP_ADDRESS]:4100`. For example, if your IP address was `123.4.5.6`, then set the variable to `123.4.5.6:4100`

3. Start the server on your machine by running `nf start` & `nx serve journeys`
   - If you had these running already, restart them.

4. On your phone/tablet, open a browser
   - Navigate to `http://[YOUR_IP_ADDRESS]:4100`

## Inspecting on iPhone or iPad (Mac only)

1. Enable inspecting on your device by following [these steps](https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios)

2. Plug your device into your Mac

3. On your Mac, open Safari

4. Go to develop -> your iPhone/iPad -> localhost link

## Common issues

Sometimes, errors similar to these may appear when trying to run the server:

`ApolloError: connect ECONNREFUSED...`
`ApolloError: cannot connect to server...`

In most situations, cancelling and re-running `nf start` and `nx serve [PROJECT-NAME]` should fix the issue. If it does not, try the following:

- Run `npm i`, then restart the server.
- If that doesn't work, re-run the commands at [3. Microservice Databases](../03-microservice-databases.mdx). Then restart the server.
