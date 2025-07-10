"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, CheckCircle, Clock, AlertCircle, FileText, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  jenisPengelolaan: string
  kodeSatker: string
  satker: string
  pimpinanSatker?: string
  alamatKantorSatker?: string
  suratDari: string
  nomor: string
  tanggal: string
  hal: string
  alamatObjekSewa?: string
  jangkaWaktuSewa?: string
  jenisBMN: string
  periodesitas?: string
  nilaiWajar?: string
  nilaiPerolehan?: string
  nilaiPersetujuan?: string
  beritaAcara?: string
  kodeMAP?: string
  pic: string
}

interface DocumentStatus {
  id: string
  status: "processing" | "completed" | "error"
  mainDocumentId?: string
  notaPengantarId?: string
  mainDownloadLink?: string
  notaPengantarLink?: string
  createdAt: string
}

export default function BMNTools() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    jenisPengelolaan: "",
    kodeSatker: "",
    satker: "",
    suratDari: "",
    nomor: "",
    tanggal: "",
    hal: "",
    jenisBMN: "",
    pic: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documents, setDocuments] = useState<DocumentStatus[]>([])

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem("bmn-documents")
    if (savedDocs) {
      const docs = JSON.parse(savedDocs)
      setDocuments(docs)
    }
  }, [])

  // Save documents to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bmn-documents", JSON.stringify(documents))
  }, [documents])

  // Poll for document status updates every 5 seconds
  useEffect(() => {
    const pollDocuments = async () => {
      const processingDocs = documents.filter((doc) => doc.status === "processing")

      for (const doc of processingDocs) {
        try {
          const response = await fetch(`/api/documents/status/${doc.id}`)
          const result = await response.json()

          if (result.success && result.status !== "processing") {
            setDocuments((prev) =>
              prev.map((d) =>
                d.id === doc.id
                  ? {
                      ...d,
                      status: result.status,
                      mainDocumentId: result.mainDocumentId,
                      notaPengantarId: result.notaPengantarId,
                      mainDownloadLink: result.mainDownloadLink,
                      notaPengantarLink: result.notaPengantarLink,
                    }
                  : d,
              ),
            )

            // Show toast notification
            if (result.status === "completed") {
              toast({
                title: "✅ Dokumen Selesai",
                description: `Dokumen ${doc.id} berhasil diproses`,
              })
            } else if (result.status === "error") {
              toast({
                title: "❌ Dokumen Gagal",
                description: `Dokumen ${doc.id} gagal diproses`,
                variant: "destructive",
              })
            }
          }
        } catch (error) {
          console.error("Error polling document status:", error)
        }
      }
    }

    const interval = setInterval(pollDocuments, 5000)
    return () => clearInterval(interval)
  }, [documents, toast])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateDocumentId = (jenisPengelolaan: string) => {
    const randomNumber = Math.floor(Math.random() * 900000) + 100000 // 6 digit random number
    return `${jenisPengelolaan}_${randomNumber}`
  }

  const validateForm = () => {
    const { jenisPengelolaan, kodeSatker } = formData

    // Validate kode satker (must be exactly 20 characters - alphanumeric)
    if (kodeSatker && kodeSatker.length !== 20) {
      toast({
        title: "⚠️ Kode Satker Tidak Valid",
        description: "Kode Satker harus terdiri dari 20 karakter (huruf dan angka)",
        variant: "destructive",
      })
      return false
    }

    const requiredFields = [
      "jenisPengelolaan",
      "kodeSatker",
      "satker",
      "suratDari",
      "nomor",
      "tanggal",
      "hal",
      "jenisBMN",
      "pic",
    ]

    // Add conditional required fields
    if (jenisPengelolaan === "psp") {
      requiredFields.push("nilaiPerolehan")
    }

    if (jenisPengelolaan === "penjualan") {
      requiredFields.push("nilaiPerolehan", "nilaiPersetujuan", "beritaAcara", "kodeMAP")
    }

    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "⚠️ Form Tidak Lengkap",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const documentId = generateDocumentId(formData.jenisPengelolaan)

      // Add document to processing state
      const newDoc: DocumentStatus = {
        id: documentId,
        status: "processing",
        createdAt: new Date().toISOString(),
      }
      setDocuments((prev) => [newDoc, ...prev.slice(0, 4)]) // Keep max 5 documents

      // Send to webhook
      const response = await fetch("/api/webhook/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          formData,
        }),
      })

      if (response.ok) {
        toast({
          title: "🚀 Data Berhasil Dikirim",
          description: "Dokumen sedang diproses, silakan tunggu...",
        })

        // Reset form
        setFormData({
          jenisPengelolaan: "",
          kodeSatker: "",
          satker: "",
          suratDari: "",
          nomor: "",
          tanggal: "",
          hal: "",
          jenisBMN: "",
          pic: "",
        })
      } else {
        throw new Error("Failed to send data")
      }
    } catch (error) {
      toast({
        title: "❌ Gagal Mengirim Data",
        description: "Terjadi kesalahan saat mengirim data",
        variant: "destructive",
      })

      // Remove the failed document from the list
      setDocuments((prev) => prev.filter((doc) => doc.id !== generateDocumentId(formData.jenisPengelolaan)))
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadDocument = (documentId: string, type: "main" | "nota") => {
    const downloadLink = `https://docs.google.com/document/d/${documentId}/export?format=doc`
    window.open(downloadLink, "_blank")
  }

  const renderConditionalFields = () => {
    const { jenisPengelolaan } = formData

    if (jenisPengelolaan === "psp") {
      return (
        <div>
          <Label htmlFor="nilaiPerolehan" className="text-green-700 font-medium">
            Nilai Perolehan <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nilaiPerolehan"
            type="number"
            value={formData.nilaiPerolehan || ""}
            onChange={(e) => handleInputChange("nilaiPerolehan", e.target.value)}
            placeholder="Rp"
            className="border-green-200 focus:border-green-400"
            required
          />
        </div>
      )
    }

    if (jenisPengelolaan === "penjualan") {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nilaiPerolehan" className="text-purple-700 font-medium">
                Nilai Perolehan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nilaiPerolehan"
                type="number"
                value={formData.nilaiPerolehan || ""}
                onChange={(e) => handleInputChange("nilaiPerolehan", e.target.value)}
                placeholder="Rp"
                className="border-purple-200 focus:border-purple-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="nilaiPersetujuan" className="text-purple-700 font-medium">
                Nilai Persetujuan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nilaiPersetujuan"
                type="number"
                value={formData.nilaiPersetujuan || ""}
                onChange={(e) => handleInputChange("nilaiPersetujuan", e.target.value)}
                placeholder="Rp"
                className="border-purple-200 focus:border-purple-400"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="beritaAcara" className="text-purple-700 font-medium">
              Berita Acara <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="beritaAcara"
              value={formData.beritaAcara || ""}
              onChange={(e) => handleInputChange("beritaAcara", e.target.value)}
              placeholder="Berita Acara Penelitian/Pemeriksaan Panitia Penghapusan Barang Milik Negara Nomor xxxx tanggal 1 Juli 2025"
              className="border-purple-200 focus:border-purple-400"
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="kodeMAP" className="text-purple-700 font-medium">
              Kode MAP <span className="text-red-500">*</span>
            </Label>
            <Input
              id="kodeMAP"
              value={formData.kodeMAP || ""}
              onChange={(e) => handleInputChange("kodeMAP", e.target.value)}
              className="border-purple-200 focus:border-purple-400"
              required
            />
          </div>
        </>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Taeno
          </h1>
          <p className="text-xl text-gray-700 font-medium mb-1">Tools Automasi Pengelolaan BMN</p>
          <p className="text-gray-600">Sistem otomatis untuk generate dokumen pengelolaan Barang Milik Negara</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Input */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
                <CardTitle className="text-xl">📝 Input Data Pengelolaan BMN</CardTitle>
                <CardDescription className="text-blue-100">
                  Isi form berikut untuk generate dokumen pengelolaan BMN
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Jenis Pengelolaan */}
                  <div>
                    <Label htmlFor="jenisPengelolaan" className="text-gray-700 font-medium">
                      Jenis Pengelolaan <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.jenisPengelolaan}
                      onValueChange={(value) => handleInputChange("jenisPengelolaan", value)}
                      required
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-400">
                        <SelectValue placeholder="Pilih jenis pengelolaan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="psp">🤝 PSP (Penetapan Status Penggunaan)</SelectItem>
                        <SelectItem value="penjualan">💰 Penjualan</SelectItem>
                        <SelectItem value="sewa" disabled>
                          🏢 Sewa (Dalam Pengembangan)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Basic Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="kodeSatker" className="text-gray-700 font-medium">
                        Kode Satker <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="kodeSatker"
                        value={formData.kodeSatker}
                        onChange={(e) => {
                          // Allow alphanumeric characters and limit to 20 characters
                          const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
                          handleInputChange("kodeSatker", value)
                        }}
                        placeholder="20 karakter (huruf/angka, contoh: ABC12345678901234567)"
                        className="border-gray-200 focus:border-blue-400"
                        maxLength={20}
                        required
                      />
                      {formData.kodeSatker && formData.kodeSatker.length !== 20 && (
                        <p className="text-red-500 text-xs mt-1">
                          Kode Satker harus 20 karakter ({formData.kodeSatker.length}/20)
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="satker" className="text-gray-700 font-medium">
                        Satker <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="satker"
                        value={formData.satker}
                        onChange={(e) => handleInputChange("satker", e.target.value)}
                        className="border-gray-200 focus:border-blue-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Conditional Fields */}
                  {renderConditionalFields()}

                  {/* Surat Details */}
                  <Separator className="bg-gradient-to-r from-blue-200 to-green-200 h-0.5" />
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="suratDari" className="text-gray-700 font-medium">
                        Surat Dari <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="suratDari"
                        value={formData.suratDari}
                        onChange={(e) => handleInputChange("suratDari", e.target.value)}
                        className="border-gray-200 focus:border-blue-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nomor" className="text-gray-700 font-medium">
                        Nomor <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nomor"
                        value={formData.nomor}
                        onChange={(e) => handleInputChange("nomor", e.target.value)}
                        className="border-gray-200 focus:border-blue-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tanggal" className="text-gray-700 font-medium">
                        Tanggal <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="tanggal"
                        type="text"
                        value={formData.tanggal}
                        onChange={(e) => handleInputChange("tanggal", e.target.value)}
                        placeholder="contoh: 1 Juli 2025"
                        className="border-gray-200 focus:border-blue-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hal" className="text-gray-700 font-medium">
                      Hal <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="hal"
                      value={formData.hal}
                      onChange={(e) => handleInputChange("hal", e.target.value)}
                      className="border-gray-200 focus:border-blue-400"
                      required
                    />
                  </div>

                  {/* BMN Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jenisBMN" className="text-gray-700 font-medium">
                        Jenis BMN <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.jenisBMN}
                        onValueChange={(value) => handleInputChange("jenisBMN", value)}
                        required
                      >
                        <SelectTrigger className="border-gray-200 focus:border-blue-400">
                          <SelectValue placeholder="Pilih jenis BMN" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tanah-bangunan">🏗️ Tanah dan/atau Bangunan</SelectItem>
                          <SelectItem value="selain-tanah-bangunan">📦 Selain Tanah dan/atau Bangunan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pic" className="text-gray-700 font-medium">
                        PIC (Person In Charge) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="pic"
                        value={formData.pic}
                        onChange={(e) => handleInputChange("pic", e.target.value)}
                        className="border-gray-200 focus:border-blue-400"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3 text-lg shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Memproses Dokumen...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Generate Dokumen BMN
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Document Status */}
          <div>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="text-xl">📊 Status Dokumen</CardTitle>
                <CardDescription className="text-purple-100">
                  Daftar dokumen yang sedang diproses atau sudah selesai
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-gray-500">Belum ada dokumen yang diproses</p>
                    </div>
                  ) : (
                    documents.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-gray-800">{doc.id}</span>
                          {doc.status === "processing" && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Processing
                            </Badge>
                          )}
                          {doc.status === "completed" && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Selesai
                            </Badge>
                          )}
                          {doc.status === "error" && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{new Date(doc.createdAt).toLocaleString("id-ID")}</p>
                        {doc.status === "completed" && (
                          <div className="space-y-2">
                            {doc.mainDocumentId && (
                              <Button
                                size="sm"
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                onClick={() => downloadDocument(doc.mainDocumentId!, "main")}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Download Konsep ND
                              </Button>
                            )}
                            {doc.notaPengantarId && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
                                onClick={() => downloadDocument(doc.notaPengantarId!, "nota")}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Download Nota Pengantar
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
