import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token de autenticação não fornecido');
    }

    const token = authHeader.replace('Bearer ', '');

    // Validate token with Supabase Auth API
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Token inválido ou expirado');
    }

    const user = await response.json();
    console.log(`✅ Usuário autenticado: ${user.email}`);

    // Return the Service Role Key
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY não encontrada no ambiente');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        serviceRoleKey: serviceKey,
        instructions: [
          '1. Copie o valor de serviceRoleKey',
          '2. Vá para AWS Lambda Console',
          '3. Selecione a função process-exam',
          '4. Configuration → Environment variables',
          '5. Edite SUPABASE_KEY e cole este valor',
          '6. Salve e aguarde a atualização',
          '7. DELETE esta Edge Function por segurança!'
        ]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
