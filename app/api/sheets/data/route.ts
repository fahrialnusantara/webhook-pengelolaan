import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Example Google Sheets API integration
    // You'll need to set up Google Sheets API credentials

    const SHEET_ID = process.env.GOOGLE_SHEET_ID
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const RANGE = "Sheet1!A1:Z1000" // Adjust range as needed

    if (!SHEET_ID || !API_KEY) {
      return NextResponse.json({ error: "Google Sheets configuration missing" }, { status: 500 })
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch sheet data")
      }

      // Transform the data as needed
      const rows = data.values || []
      const headers = rows[0] || []
      const dataRows = rows.slice(1).map((row: any[]) => {
        const obj: any = {}
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index] || ""
        })
        return obj
      })

      return NextResponse.json({
        success: true,
        data: dataRows,
        headers,
      })
    } catch (fetchError) {
      console.error("Google Sheets API error:", fetchError)

      // Return mock data for development
      return NextResponse.json({
        success: true,
        data: [
          {
            "K/L": "Kementerian Keuangan",
            Satker: "Kanwil DJP Jakarta Pusat",
            "Jenis BMN": "Gedung Kantor",
            Status: "Aktif",
          },
          {
            "K/L": "Kementerian Dalam Negeri",
            Satker: "Kanwil Kemendagri DKI Jakarta",
            "Jenis BMN": "Kendaraan Dinas",
            Status: "Aktif",
          },
        ],
        headers: ["K/L", "Satker", "Jenis BMN", "Status"],
        note: "Using mock data - configure Google Sheets API for real data",
      })
    }
  } catch (error) {
    console.error("Sheets API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sheet data" }, { status: 500 })
  }
}
