import { Box, Text, useInput } from 'ink'
import { type ReactElement, useState } from 'react'

import { PROVIDER_METAS } from '../../agents/registry'
import type { ProviderMeta } from '../../agents/types'
import {
  type ApiProviderId,
  type ProviderId,
  loadProviderCredential
} from '../../config/providers'

export interface ProviderCredentialInput {
  apiKey: string
  baseUrl?: string
}

interface ProviderPickerProps {
  activeProvider: ProviderId
  onSelect: (id: ProviderId) => void
  onConfigure: (id: ApiProviderId, credential: ProviderCredentialInput) => void
  onCancel: () => void
}

type Phase =
  | { kind: 'choose' }
  | { kind: 'configure-key'; provider: ProviderMeta; baseUrl: string }
  | {
      kind: 'configure-base-url'
      provider: ProviderMeta
      apiKey: string
      baseUrl: string
    }

export function ProviderPicker({
  activeProvider,
  onSelect,
  onConfigure,
  onCancel
}: ProviderPickerProps): ReactElement {
  const initialIndex = Math.max(
    0,
    PROVIDER_METAS.findIndex((p) => p.id === activeProvider)
  )
  const [index, setIndex] = useState(initialIndex)
  const [phase, setPhase] = useState<Phase>({ kind: 'choose' })
  const [textBuffer, setTextBuffer] = useState('')

  useInput((input, key) => {
    if (phase.kind === 'choose') {
      if (key.escape) {
        onCancel()
        return
      }
      if (key.upArrow) {
        setIndex((i) => (i - 1 + PROVIDER_METAS.length) % PROVIDER_METAS.length)
        return
      }
      if (key.downArrow) {
        setIndex((i) => (i + 1) % PROVIDER_METAS.length)
        return
      }
      if (key.return) {
        const chosen = PROVIDER_METAS[index]
        if (!chosen.needsCredential) {
          onSelect(chosen.id)
          return
        }
        // Pre-fill the configure flow from any stored credential so the user
        // can re-confirm or only update one field.
        const apiProviderId = chosen.id as ApiProviderId
        const existing = loadProviderCredential(apiProviderId)
        if (chosen.needsBaseUrl) {
          // Seed the input with the stored URL or the provider default so the
          // user only has to hit Enter when they're happy with localhost.
          const seedBaseUrl = existing?.baseUrl ?? chosen.defaultBaseUrl ?? ''
          setPhase({
            kind: 'configure-base-url',
            provider: chosen,
            apiKey: existing?.apiKey ?? '',
            baseUrl: seedBaseUrl
          })
          setTextBuffer(seedBaseUrl)
          return
        }
        setPhase({
          kind: 'configure-key',
          provider: chosen,
          baseUrl: existing?.baseUrl ?? chosen.defaultBaseUrl ?? ''
        })
        setTextBuffer(existing?.apiKey ?? '')
      }
      return
    }
    if (key.escape) {
      setPhase({ kind: 'choose' })
      setTextBuffer('')
      return
    }
    if (key.return) {
      const trimmed = textBuffer.trim()
      if (phase.kind === 'configure-base-url') {
        if (trimmed.length === 0) return
        // Always advance to the API key step. For providers like LM Studio
        // where the key is optional, the next prompt makes the "optional"
        // affordance explicit instead of silently skipping it.
        setPhase({
          kind: 'configure-key',
          provider: phase.provider,
          baseUrl: trimmed
        })
        setTextBuffer(phase.apiKey)
        return
      }
      // For required-key providers an empty value is rejected; for optional
      // ones (LM Studio) it means "no key" and we save with apiKey: ''.
      if (phase.provider.needsApiKey && trimmed.length === 0) return
      const apiProviderId = phase.provider.id as ApiProviderId
      onConfigure(apiProviderId, {
        apiKey: trimmed,
        baseUrl: phase.baseUrl.length > 0 ? phase.baseUrl : undefined
      })
      setTextBuffer('')
      setPhase({ kind: 'choose' })
      return
    }
    if (key.backspace || key.delete) {
      setTextBuffer((t) => t.slice(0, -1))
      return
    }
    if (key.ctrl || key.meta) return
    if (input.length === 0) return
    setTextBuffer((t) => t + input)
  })

  if (phase.kind === 'configure-base-url') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold>{phase.provider.label} — base URL</Text>
        <Text color="gray">
          Endpoint root for /chat/completions (no trailing path).
        </Text>
        <Box>
          <Text color="cyan">› </Text>
          <Text>{textBuffer.length === 0 ? <Text color="gray">https://…</Text> : textBuffer}</Text>
          <Text>█</Text>
        </Box>
        <Text color="gray">Enter to continue · Esc to go back</Text>
      </Box>
    )
  }

  if (phase.kind === 'configure-key') {
    const masked = '•'.repeat(Math.min(textBuffer.length, 40))
    const optional = !phase.provider.needsApiKey
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold>
          {phase.provider.label} — API key{optional ? ' (optional)' : ''}
        </Text>
        <Text color="gray">
          {optional
            ? 'Leave blank if your LM Studio server has no auth. Stored at ~/.config/scribe/providers.json (mode 0600).'
            : 'Stored at ~/.config/scribe/providers.json (mode 0600).'}
        </Text>
        <Box>
          <Text color="cyan">› </Text>
          <Text>{textBuffer.length === 0 ? <Text color="gray">sk-…</Text> : masked}</Text>
          <Text>█</Text>
        </Box>
        <Text color="gray">
          {optional
            ? 'Enter to save (blank = no key) · Esc to go back'
            : 'Enter to save · Esc to go back'}
        </Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Text bold>Select an agent provider</Text>
      {PROVIDER_METAS.map((meta, i) => (
        <ProviderRow
          key={meta.id}
          meta={meta}
          selected={i === index}
          isActive={meta.id === activeProvider}
          isConfigured={isConfigured(meta)}
        />
      ))}
      <Text color="gray">
        ↑/↓ to move · Enter to select · Esc to cancel
      </Text>
    </Box>
  )
}

interface ProviderRowProps {
  meta: ProviderMeta
  selected: boolean
  isActive: boolean
  isConfigured: boolean
}

function ProviderRow({
  meta,
  selected,
  isActive,
  isConfigured
}: ProviderRowProps): ReactElement {
  return (
    <Box>
      <Text color={selected ? 'cyan' : 'gray'}>{selected ? '› ' : '  '}</Text>
      <Text bold={selected}>{meta.label}</Text>
      {isActive ? <Text color="green"> (active)</Text> : null}
      {meta.needsCredential && !isConfigured ? (
        <Text color="yellow"> (not configured)</Text>
      ) : null}
      <Text color="gray"> · {meta.description}</Text>
    </Box>
  )
}

function isConfigured(meta: ProviderMeta): boolean {
  if (!meta.needsCredential) return true
  const cred = loadProviderCredential(meta.id as ApiProviderId)
  if (meta.needsApiKey && (cred == null || cred.apiKey.length === 0)) {
    return false
  }
  if (meta.needsBaseUrl) {
    const hasStoredBaseUrl =
      cred?.baseUrl != null && cred.baseUrl.length > 0
    const hasDefault =
      meta.defaultBaseUrl != null && meta.defaultBaseUrl.length > 0
    if (!hasStoredBaseUrl && !hasDefault) return false
  }
  return true
}
