import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { areaCode } = await request.json()

    if (!areaCode) {
      return NextResponse.json(
        { error: 'Area code is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('areas')
      .select('id')
      .eq('codigo', areaCode)
      .single()

    if (error) {
      console.error('Error obteniendo UUID del área:', error)
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ uuid: data.id })

  } catch (error) {
    console.error('Error in area-uuid API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
