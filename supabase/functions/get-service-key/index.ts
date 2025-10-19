import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autorizado - faça login primeiro');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
      throw new Error('Usuário não autenticado');
    }

    console.log(`✅ Usuário autenticado: ${user.email}`);

    // Retornar a Service Role Key
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY não encontrada');
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
      }
    );
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
