import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { filename, dataUrl } = body as { filename: string; dataUrl: string }
    if (!filename || !dataUrl) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })

    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
    if (!matches) return NextResponse.json({ message: 'Invalid data URL' }, { status: 400 })
    const mime = matches[1]
    const base64 = matches[2]

    const ext = mime.split('/').pop() || filename.split('.').pop() || 'jpg'
    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    const filePath = path.join(uploadsDir, safeName)
    const buffer = Buffer.from(base64, 'base64')
    await fs.promises.writeFile(filePath, buffer)

    const url = `/uploads/${safeName}`
    return NextResponse.json({ message: 'Uploaded', url })
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ message }, { status: 500 })
  }
}
