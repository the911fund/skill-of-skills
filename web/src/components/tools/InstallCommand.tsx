'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface InstallCommandProps {
  command: string | null
}

export function InstallCommand({ command }: InstallCommandProps) {
  const [copied, setCopied] = useState(false)

  if (!command) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-3">
      <code className="flex-1 text-sm text-green-400 font-mono">{command}</code>
      <Button size="sm" variant="secondary" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  )
}
