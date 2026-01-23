'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    repoUrl: '',
    name: '',
    description: '',
    toolType: 'skill',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/v1/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Tool submitted successfully! It will be reviewed shortly.')
        setFormData({ repoUrl: '', name: '', description: '', toolType: 'skill' })
      } else {
        setMessage(data.error || 'Submission failed')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Submit a Tool</h1>
      <p className="text-gray-600 mb-8">
        Know a great Claude Code skill, plugin, or MCP server? Submit it here!
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">GitHub Repository URL *</label>
            <Input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={formData.repoUrl}
              onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tool Name *</label>
            <Input
              placeholder="My Awesome Skill"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              placeholder="Brief description of what it does"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tool Type *</label>
            <Select
              value={formData.toolType}
              onChange={(e) => setFormData({ ...formData, toolType: e.target.value })}
            >
              <option value="skill">Skill</option>
              <option value="plugin">Plugin</option>
              <option value="collection">Collection</option>
              <option value="cli_tool">CLI Tool</option>
              <option value="mcp_server">MCP Server</option>
              <option value="prompt_pack">Prompt Pack</option>
              <option value="workflow">Workflow</option>
              <option value="extension">Extension</option>
              <option value="resource">Resource</option>
            </Select>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Tool'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
