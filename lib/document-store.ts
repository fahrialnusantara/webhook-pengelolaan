// Simple in-memory storage for document status
// In production, this should be replaced with a proper database

interface DocumentStatus {
  id: string
  status: "processing" | "completed" | "error"
  mainDocumentId?: string
  notaPengantarId?: string
  mainDownloadLink?: string
  notaPengantarLink?: string
  createdAt: string
  updatedAt?: string
}

// In-memory storage
const documentStore = new Map<string, DocumentStatus>()

export function updateDocumentStatus(documentId: string, updates: Partial<Omit<DocumentStatus, "id" | "createdAt">>) {
  const existing = documentStore.get(documentId)

  if (existing) {
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    documentStore.set(documentId, updated)
    console.log(`Updated document ${documentId}:`, updated)
  } else {
    // Create new document status if it doesn't exist
    const newDoc: DocumentStatus = {
      id: documentId,
      status: "processing",
      createdAt: new Date().toISOString(),
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    documentStore.set(documentId, newDoc)
    console.log(`Created document ${documentId}:`, newDoc)
  }
}

export function getDocumentStatus(documentId: string): DocumentStatus | null {
  return documentStore.get(documentId) || null
}

export function getAllDocuments(): DocumentStatus[] {
  return Array.from(documentStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
