import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') || 'aprobado';
    const trade = searchParams.get('trade');

    let query = supabase
      .from('oficios')
      .select('*')
      .order('rating', { ascending: false });

    if (estado === 'all') {
      // no filter
    } else {
      query = query.eq('estado', estado);
    }

    if (trade && trade !== 'all') {
      query = query.eq('trade', trade);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ oficios: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, trade, zone, whatsapp, bio } = body;

    if (!name || !trade || !zone || !whatsapp) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('oficios')
      .insert({
        name,
        trade,
        zone,
        whatsapp: whatsapp.startsWith('http') ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, '')}`,
        bio: bio || '',
        rating: 5.0,
        reviews: 0,
        medal: 'nuevo',
        available: true,
        estado: 'pendiente',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ oficio: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
