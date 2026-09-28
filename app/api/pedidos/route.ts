import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') || 'aprobado';
    const categoria = searchParams.get('categoria');

    let query = supabase
      .from('pedidos_trabajo')
      .select('*')
      .order('created_at', { ascending: false });

    if (estado === 'all') {
      // no filter
    } else {
      query = query.in('estado', [estado, 'resuelto']);
    }

    if (categoria && categoria !== 'all') {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ pedidos: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { titulo, categoria, detalles, zona, presupuesto, whatsapp, nombre_contacto, fotos } = body;

    if (!titulo || !categoria || !detalles || !zona || !whatsapp) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const fotosArray = Array.isArray(fotos) ? fotos.slice(0, 3) : [];

    const { data, error } = await supabase
      .from('pedidos_trabajo')
      .insert({
        titulo,
        categoria,
        detalles,
        zona,
        presupuesto: presupuesto || 'A convenir',
        whatsapp,
        nombre_contacto: nombre_contacto || '',
        fotos: fotosArray,
        estado: 'pendiente',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ pedido: data });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
