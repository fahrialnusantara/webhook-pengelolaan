# Tools Pengelolaan BMN

Sistem otomatis untuk generate dokumen pengelolaan Barang Milik Negara dengan integrasi n8n dan Google Sheets.

## Fitur

- **Form Input Dinamis**: Form yang berubah berdasarkan jenis pengelolaan (Sewa, PSP, Penjualan)
- **Webhook Integration**: Integrasi dengan n8n untuk pemrosesan dokumen
- **Google Sheets Integration**: Membaca data dari Google Sheets (read-only)
- **Real-time Status**: Tracking status dokumen secara real-time
- **Auto Download**: Tombol download otomatis muncul setelah dokumen selesai

## Alur Kerja

1. **Input Data** → User mengisi form sesuai jenis pengelolaan
2. **Kirim Webhook** → Data dikirim ke n8n via webhook
3. **Proses n8n** → n8n memproses dan generate dokumen di Google Drive
4. **Callback** → n8n mengirim callback dengan document ID
5. **Download** → Tombol download muncul dengan link Google Docs export

## Setup

### 1. Environment Variables

Copy `.env.example` ke `.env.local` dan isi:

\`\`\`bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/bmn-process
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SHEETS_API_KEY=your-google-sheets-api-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### 2. Google Sheets API

1. Buat project di Google Cloud Console
2. Enable Google Sheets API
3. Buat API Key
4. Set permissions untuk sheet (read-only)

### 3. n8n Webhook Setup

Buat workflow n8n dengan:
- **Webhook Trigger**: Terima data dari aplikasi
- **Google Drive Integration**: Generate dokumen
- **HTTP Request**: Kirim callback ke `/api/webhook/callback`

#### Callback Format

n8n harus mengirim callback ke `/api/webhook/callback` dengan format:

\`\`\`json
{
  "documentId": "doc_1234567890",
  "googleDocId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "status": "completed"
}
\`\`\`

### 4. Testing

- **Test Webhook**: Gunakan tombol "Test Webhook" untuk cek koneksi
- **Mock Data**: API akan return mock data jika Google Sheets tidak dikonfigurasi

## API Endpoints

- `POST /api/webhook/test` - Test webhook connection
- `POST /api/webhook/send` - Kirim data ke n8n
- `POST /api/webhook/callback` - Terima callback dari n8n
- `GET /api/sheets/data` - Ambil data dari Google Sheets
- `GET /api/documents/status/[id]` - Cek status dokumen

## Download Format

Download link menggunakan format Google Docs export:
\`\`\`
https://docs.google.com/document/d/{documentId}/export?format=doc
\`\`\`

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Aplikasi akan berjalan di `http://localhost:3000`
