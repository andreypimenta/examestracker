import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-zinc-900 to-black">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Bem-vindo ao painel de controle, {user?.email}
          </p>

          <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Em Desenvolvimento</h2>
            <p className="text-white/70">
              O dashboard completo será implementado nas próximas fases do projeto.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
