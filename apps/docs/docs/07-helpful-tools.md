# Helpful Tools

A good developer should consider what tools they can incorporate to assist their work. The right tools, in the hands of the right developer, can yield much. Below are recommended tools you should consider adding to your workflow:

## Testing

### Wallaby.js

Wallaby.js is a powerful continuous testing tool that runs your unit tests in real-time as you write code. It provides instant visual feedback directly in your editor, showing which lines of code are covered by tests, which tests are passing or failing, and highlighting any errors immediately. A quick feedback loop can lead to higher levels of productivity.

#### Installation and Setup

1. Install the 'Wallaby.js' extension in your IDE
2. As Wallaby.js is free for open-source projects such as core, activate your OSS license by opening Wallaby.js settings -> 'Manage License Key' -> Submit your organization email
3. Open the command palette (F1) and run '>Wallaby.js: Smart Start'
4. Wallaby.js will now run the unit tests within any unit test file that is opened and focused. For more information on using Wallaby.js, please read the [documentation on their official website](https://wallabyjs.com/docs/).

#### Common Issues

_Wallaby.js fails to verify the open-source state of core_

1. Try running '>Wallaby.js: Smart Start' again
2. (If persisting) uninstall Wallaby.js from your IDE, open Docker Desktop -> click 'app-1' -> 'Files' -> home/node/ -> delete the .wallaby folder, then restart from step 1 again.

_Wallaby.js hangs at 'Discovering Testing Framework' after running 'Smart Start'_

1. Stop Wallaby.js by running '>Wallaby.js: Stop'
2. Run '>Wallaby.js: Select Configuration'
3. Select 'wallaby.js' from the drop-down of configuration options.
4. IMPORTANT: Wallaby.js will attempt to run ALL tests inside the core monorepo. Run '>Wallaby.js: Stop', then run '>Wallaby.js: Smart Start'.
