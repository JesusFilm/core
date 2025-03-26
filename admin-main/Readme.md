1. Open the project in VS code
2. Open a terminal at the project root folder and execute the following command -
   ```
     //To install required dependencies from the package.json
     npm install
   ```
3. After successfully installed playwright, execute the following command
   ```
    //To install playwright supported browser
    npx playwright install
   ```
4. To execute the assessment.spec.ts test, execute the following command
   ```
   npx playwright test assessment.spec.ts  --headed
   ```
5. Once completed the execution the report will be generated in html format in 'playwright-report' folder in
   project root directory
