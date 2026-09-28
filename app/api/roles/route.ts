import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede ver roles' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        role,
        user_id,
        created_at,
        auth.users!inner ( email )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      const { data: roles, error: err2 } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
      return NextResponse.json({ roles: roles || [] });
    }

    return NextResponse.json({ roles: data || [] });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede asignar roles' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, role } = body;

    if (!user_id || !['admin', 'moderator', 'merchant', 'promoter', 'client'].includes(role)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ role: data });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
