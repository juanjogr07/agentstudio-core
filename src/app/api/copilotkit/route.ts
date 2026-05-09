import { CopilotRuntime, AnthropicAdapter, copilotRuntimeNextJSAppRouterHandler } from '@copilotkit/runtime'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const POST = copilotRuntimeNextJSAppRouterHandler({
  runtime: new CopilotRuntime(),
  serviceAdapter: new AnthropicAdapter({ anthropic }),
  endpoint: '/api/copilotkit',
})
