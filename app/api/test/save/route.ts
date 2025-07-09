import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🧪 Test save API called with:', JSON.stringify(body, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test endpoint working',
      received: body 
    })

  } catch (error) {
    console.error('🧪 Test save API error:', error)
    return NextResponse.json(
      { error: 'Test endpoint error', details: String(error) },
      { status: 500 }
    )
  }
}
