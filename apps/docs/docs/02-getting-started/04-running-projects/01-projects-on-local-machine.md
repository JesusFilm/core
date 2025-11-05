# On Local Machine

<div
  style={{
    position: 'relative',
    paddingBottom: '64.63195691202873%',
    marginBottom: '20px',
    height: 0
  }}
>
  <iframe
    src="https://www.loom.com/embed/4c9ba39d325e4be38b3d1b9e17ce01f8"
    frameborder="0"
    allowFullScreen="true"
    webkitallowfullscreen="true"
    mozallowfullscreen="true"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    }}
  />
</div>

As an example we are going to run through the steps to get the Next Steps Journey project running in your web browser.

1. Start the gateway and microservices

```shell
nf start
```

2. Start a webserver e.g journeys

```shell
nx run journeys:serve
```

3. In your local browser navigate to [http://localhost:4100](http://localhost:4100)
