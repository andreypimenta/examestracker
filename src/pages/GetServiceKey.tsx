import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Copy, AlertTriangle } from 'lucide-react';

export default function GetServiceKey() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serviceKey, setServiceKey] = useState<string | null>(null);

  const fetchServiceKey = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-service-key');

      if (error) throw error;

      if (data.success) {
        setServiceKey(data.serviceRoleKey);
        toast.success('Service Role Key obtida com sucesso!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(error.message || 'Erro ao buscar Service Key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (serviceKey) {
      navigator.clipboard.writeText(serviceKey);
      toast.success('Chave copiada para a área de transferência!');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Autenticação Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Você precisa estar logado para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Obter Service Role Key (Temporário)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-sm text-destructive font-semibold mb-2">
              ⚠️ ATENÇÃO - Esta página é temporária e deve ser deletada após uso!
            </p>
            <p className="text-sm text-destructive/80">
              A Service Role Key concede acesso total ao banco de dados. 
              Use apenas para configurar a AWS Lambda.
            </p>
          </div>

          {!serviceKey ? (
            <Button 
              onClick={fetchServiceKey} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Obtendo...' : 'Obter Service Role Key'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Service Role Key:</p>
                <code className="text-xs break-all block bg-background p-3 rounded border">
                  {serviceKey}
                </code>
              </div>

              <Button 
                onClick={copyToClipboard}
                className="w-full"
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar para Área de Transferência
              </Button>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-primary mb-2">
                  Próximos passos:
                </p>
                <ol className="text-sm text-foreground/80 space-y-1 list-decimal list-inside">
                  <li>Copie o valor acima</li>
                  <li>Acesse AWS Lambda Console</li>
                  <li>Selecione a função <code>process-exam</code></li>
                  <li>Configuration → Environment variables</li>
                  <li>Edite <code>SUPABASE_KEY</code> e cole este valor</li>
                  <li>Salve e aguarde a atualização</li>
                  <li><strong>DELETE esta página e a Edge Function!</strong></li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
