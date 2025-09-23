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


Here is a list of the webservers:

| App | Shell command | URL |
| --- | --- | --- |
| Gateway and Microservices | `nf start` |  |
| Journeys | `nx run journeys:serve:development --inspect-brk` | [http://localhost:4100](http://localhost:4100) |
| Journeys Admin | `nx run journeys:serve:development` | [http://localhost:4200](http://localhost:4200) |
| Watch | `nx run watch:serve:development --inspect-brk` |[http://localhost:4300](http://localhost:4300) | 
| Docs | `nx run docs:serve` | [http://localhost:3000](http://localhost:3000) |

In the above commands, the `--inspect-brk` parameters are optional; you need to use this parameter if you want to be able to use the debugger in your browser (Google Chrome).
(There are further steps to be done to set up debugging in your browser; they can be found in [the Wiki](https://docs.google.com/document/d/1PVgOARHEgtT6eYM7_DgfyJtdROSaRwvds9ZIm7Oakj8/edit?tab=t.0) under [How to setup debugging in React](https://docs.google.com/document/d/1YHxyeKl4ibiXTQHiFkioNTCExWqtBS2UbV_12_SioOE/edit?tab=t.0#heading=h.28eawu8dqvab).)