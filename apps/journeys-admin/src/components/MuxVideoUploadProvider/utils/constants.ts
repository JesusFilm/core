export const POLL_INTERVAL = 5000 // 5 seconds (reduced API calls)
export const MAX_POLL_TIME = 15 * 60 * 1000 // 15 minutes - Mux processing can take time
export const TASK_CLEANUP_DELAY = 1000 // Delay before removing completed/errored tasks from pollingTasks
