"use client"

import { useEffect } from "react"

interface DocumentPollingProps {
  documentId: string
  onStatusUpdate: (status: any) => void
  interval?: number
}

export function DocumentPolling({ documentId, onStatusUpdate, interval = 5000 }: DocumentPollingProps) {
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/documents/status/${documentId}`)
        const data = await response.json()

        if (data.success) {
          onStatusUpdate(data)

          // Stop polling if document is completed or errored
          if (data.status === "completed" || data.status === "error") {
            clearInterval(intervalId)
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }

    // Start polling
    const intervalId = setInterval(pollStatus, interval)

    // Initial poll
    pollStatus()

    // Cleanup
    return () => clearInterval(intervalId)
  }, [documentId, onStatusUpdate, interval])

  return null
}
