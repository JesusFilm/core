import {
  ECSClient,
  RunTaskCommand,
  RunTaskCommandInput
} from '@aws-sdk/client-ecs'

export interface TranscodeVideoParams {
  videoId: string
  format: string
  resolution: string
  bitrate?: number
  outputBucket?: string
  outputKey?: string
}

export class ECSService {
  private client: ECSClient

  constructor() {
    if (!process.env.AWS_REGION) {
      throw new Error('AWS_REGION environment variable is required')
    }

    this.client = new ECSClient({
      region: process.env.AWS_REGION
    })
  }

  async launchTranscodeTask(params: TranscodeVideoParams): Promise<string> {
    if (!process.env.ECS_CLUSTER) {
      throw new Error('ECS_CLUSTER environment variable is required')
    }

    if (!process.env.ECS_TASK_DEFINITION) {
      throw new Error('ECS_TASK_DEFINITION environment variable is required')
    }

    if (!process.env.ECS_CONTAINER_NAME) {
      throw new Error('ECS_CONTAINER_NAME environment variable is required')
    }

    if (!process.env.ECS_SUBNET_ID) {
      throw new Error('ECS_SUBNET_ID environment variable is required')
    }

    const environment = [
      { name: 'VIDEO_ID', value: params.videoId },
      { name: 'FORMAT', value: params.format },
      { name: 'RESOLUTION', value: params.resolution }
    ]

    const input: RunTaskCommandInput = {
      cluster: process.env.ECS_CLUSTER,
      taskDefinition: process.env.ECS_TASK_DEFINITION,
      count: 1,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [process.env.ECS_SUBNET_ID],
          assignPublicIp: 'ENABLED'
        }
      },
      overrides: {
        containerOverrides: [
          {
            name: process.env.ECS_CONTAINER_NAME,
            environment
          }
        ]
      }
    }

    try {
      const command = new RunTaskCommand(input)
      const response = await this.client.send(command)

      if (!response.tasks || response.tasks.length === 0) {
        throw new Error('Failed to launch ECS task')
      }

      const taskArn = response.tasks[0].taskArn
      if (!taskArn) {
        throw new Error('Task ARN is undefined')
      }

      return taskArn
    } catch (error: unknown) {
      console.error('Error launching ECS task:', error)
      throw new Error(
        `Failed to launch transcoding task: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
