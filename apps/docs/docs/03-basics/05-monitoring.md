# Monitoring

## Checkly Alert Management

When Checkly detects issues with our automated tests, it's important to respond quickly and systematically. Here's our standard workflow for monitoring and troubleshooting Checkly alerts.

## Alert Response Workflow

### 1. **Initial Alert Notification**
When there's an alert in Checkly, it automatically fires a message to the DS emergency channel. This provides immediate visibility into any failing tests or monitors.

### 2. **Quick Investigation Process**
- Click on **"see more"** in the alert message
- Select **"view failing result"** to access the detailed failure information
- This is the quickest way to get to the root cause of the issue

### 3. **Analyzing with Traces**
- Once in Checkly, look at the **traces** section for the failed test run
- Traces show the exact step-by-step actions that were performed
- You can see what the user journey looked like: clicks, form inputs, navigation steps
- Look for timeout errors or elements that couldn't be found (e.g., "waited for 60 seconds but couldn't see left nav")

### 4. **Manual Verification**
- When a test fails, manually verify the issue by reproducing the same steps
- Check if the expected elements (like navigation items, dashboards, or specific UI components) are actually loading
- This helps confirm whether it's a real issue or a temporary glitch
- Document your findings in the emergency channel for team visibility

## Additional Debugging Options

- **AI Analysis**: For complex test scenarios with many steps, you can use Checkly's "analyze with AI" feature to get automated insights
- **Video Playback**: Review the video recording of the failed test to see exactly what happened visually
- **Before/After Screenshots**: Compare the state before and after failed actions to identify UI changes or loading issues