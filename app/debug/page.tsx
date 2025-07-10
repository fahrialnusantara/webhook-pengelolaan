"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, TestTube, Eye, FileText, Mail } from "lucide-react"

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Failed to fetch debug info:", error)
    } finally {
      setLoading(false)
    }
  }

  const testCallback = async () => {
    try {
      const response = await fetch("/api/test-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: "debug_test_doc" }),
      })
      const result = await response.json()
      console.log("Test callback result:", result)
      // Refresh debug info after test
      setTimeout(fetchDebugInfo, 1000)
    } catch (error) {
      console.error("Test callback failed:", error)
    }
  }

  const checkCallbackEndpoint = async () => {
    try {
      const response = await fetch("/api/webhook/callback")
      const result = await response.json()
      console.log("Callback endpoint check:", result)
    } catch (error) {
      console.error("Callback endpoint check failed:", error)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Debug BMN Tools</h1>
        <p className="text-muted-foreground">Debug information dan testing tools</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
            <CardDescription>Tools untuk debugging dan testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={fetchDebugInfo} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Debug Info
              </Button>
              <Button onClick={testCallback} variant="outline">
                <TestTube className="w-4 h-4 mr-2" />
                Test Callback
              </Button>
              <Button onClick={checkCallbackEndpoint} variant="secondary">
                <Eye className="w-4 h-4 mr-2" />
                Check Callback Endpoint
              </Button>
            </div>
          </CardContent>
        </Card>

        {debugInfo && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(debugInfo.environment || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-medium">{key}:</span>
                      <Badge variant={typeof value === "string" && value.includes("✅") ? "default" : "secondary"}>
                        {String(value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents ({debugInfo.documentCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.documents && debugInfo.documents.length > 0 ? (
                  <div className="space-y-4">
                    {debugInfo.documents.map((doc: any) => (
                      <div key={doc.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{doc.id}</span>
                          <Badge
                            variant={
                              doc.status === "completed"
                                ? "default"
                                : doc.status === "error"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        {doc.mainDocumentId && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <FileText className="w-4 h-4" />
                            <span>Main Doc ID: {doc.mainDocumentId}</span>
                          </div>
                        )}
                        {doc.notaPengantarId && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Mail className="w-4 h-4" />
                            <span>Nota Pengantar ID: {doc.notaPengantarId}</span>
                          </div>
                        )}
                        {doc.mainDownloadLink && (
                          <p className="text-sm text-muted-foreground">Main Download: {doc.mainDownloadLink}</p>
                        )}
                        {doc.notaPengantarLink && (
                          <p className="text-sm text-muted-foreground">Nota Download: {doc.notaPengantarLink}</p>
                        )}
                        {doc.updatedAt && <p className="text-xs text-muted-foreground">Updated: {doc.updatedAt}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents found</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
