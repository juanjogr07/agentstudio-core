'use client'

import { useState, useEffect } from 'react'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core'
import { ComponentRegistry } from '@/contracts/registry'
import type { AgentDecision } from '@/contracts/types'

async function loadModules() {
  const registry = ComponentRegistry.getInstance()
  const [board, actions] = await Promise.all([
    import('@agentstudio/board'),
    import('@agentstudio/actions'),
  ])
  registry.registerAll(board.boardComponents)
  registry.registerAll(actions.actionComponents)
}

function AgentWarRoom() {
  const registry = ComponentRegistry.getInstance()
  const [activeComponents, setActiveComponents] = useState<AgentDecision['components']>([])
  const [modulesLoaded, setModulesLoaded] = useState(false)

  useEffect(() => {
    loadModules().then(() => setModulesLoaded(true))
  }, [])

  useCopilotReadable({
    description: 'Available UI components the agent can render. Select the most relevant based on the user query.',
    value: modulesLoaded ? registry.getDescriptions() : 'Loading components...',
  })

  useCopilotAction({
    name: 'renderComponents',
    description: 'Render one or more UI components to answer the user query. ALWAYS prefer rendering components over plain text responses.',
    parameters: [
      {
        name: 'components',
        type: 'object[]',
        description: 'Components to render with their data payloads',
        attributes: [
          { name: 'name', type: 'string', description: 'Component name from the available list' },
          { name: 'data', type: 'object', description: 'Data object matching the component requiredData fields' },
        ],
      },
    ],
    handler: async ({ components }) => {
      setActiveComponents(components as AgentDecision['components'])
      return `Rendered: ${(components as Array<{ name: string }>).map(c => c.name).join(', ')}`
    },
  })

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <span className="text-red-500 text-xl">&#9888;</span>
        <h1 className="text-lg font-bold tracking-tight">AgentWarRoom</h1>
        <span className="ml-auto text-xs text-gray-600">Engineering Command Center · Generative UI</span>
      </header>

      <main className="p-6">
        {activeComponents.length === 0 ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Ask the agent about an incident, sprint, or request an action.</p>
              <p className="text-xs text-gray-700 font-mono">
                Try: "hay un incidente en auth-service, muéstrame qué está pasando"
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 max-w-4xl">
            {activeComponents.map((item, i) => {
              const registered = registry.get(item.name)
              if (!registered) {
                return <div key={i} className="text-red-500 text-sm">Unknown component: {item.name}</div>
              }
              const Component = registered.component
              return (
                <Component
                  key={i}
                  data={item.data}
                  onAction={(action) => {
                    console.log('Agent action:', action)
                    // Future: pipe back to agent for follow-up rendering
                  }}
                />
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar
        defaultOpen
        labels={{
          title: 'WarRoom Agent',
          placeholder: 'Pregunta sobre el estado del sistema...',
        }}
      >
        <AgentWarRoom />
      </CopilotSidebar>
    </CopilotKit>
  )
}
