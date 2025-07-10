// Shared document store that can be used across API routes
class DocumentStore {
  private static instance: DocumentStore
  private documents = new Map<string, any>()

  private constructor() {}

  static getInstance(): DocumentStore {
    if (!DocumentStore.instance) {
      DocumentStore.instance = new DocumentStore()
    }
    return DocumentStore.instance
  }

  setDocument(documentId: string, data: any) {
    console.log(`Setting document ${documentId}:`, data)
    this.documents.set(documentId, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  }

  getDocument(documentId: string) {
    const doc = this.documents.get(documentId)
    console.log(`Getting document ${documentId}:`, doc)
    return doc
  }

  getAllDocuments() {
    return Array.from(this.documents.entries()).map(([id, data]) => ({
      id,
      ...data,
    }))
  }

  deleteDocument(documentId: string) {
    return this.documents.delete(documentId)
  }

  // Update specific fields of a document
  updateDocument(documentId: string, updates: any) {
    const existing = this.documents.get(documentId) || {}
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.documents.set(documentId, updated)
    console.log(`Updated document ${documentId}:`, updated)
    return updated
  }
}

export const documentStore = DocumentStore.getInstance()
