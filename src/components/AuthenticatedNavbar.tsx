import { Button } from "@/components/ui/button";
import { Menu, LogOut, User } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BackButton } from "@/components/BackButton";
import exLogo from "@/assets/ex-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuthenticatedNavbarProps {
  showBackButton?: boolean;
  backButtonPath?: string;
}

export const AuthenticatedNavbar = ({ showBackButton = false, backButtonPath = '/patients' }: AuthenticatedNavbarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    // Se não estiver na página inicial, navegar para lá primeiro
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }

    try {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error(`Error scrolling to ${sectionId}:`, error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-white/10 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <BackButton to={backButtonPath} className="flex-shrink-0" />
          )}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <img 
              src={exLogo} 
              alt="Exames Logo" 
              className="w-16 h-16 object-contain group-hover:scale-110 transition-transform" 
            />
            <span className="text-2xl font-bold text-white tracking-tight">Exames</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/dashboard" className="font-medium text-white/80 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/patients" className="font-medium text-white/80 hover:text-white transition-colors">
            Pacientes
          </Link>
          <button 
            onClick={() => scrollToSection('contact')}
            className="font-medium text-white/80 hover:text-white transition-colors"
          >
            Contato
          </button>
        </nav>

        {/* Desktop Button */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-rest-blue text-white hover:bg-rest-cyan rounded-full px-6 transition-colors">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/95 border-white/10 text-white z-50">
              <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer hover:bg-white/10">
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/patients')} className="cursor-pointer hover:bg-white/10">
                Pacientes
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-white/10 text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-black/95 border-white/10 text-white z-50"
          >
            <DropdownMenuItem 
              onClick={() => navigate('/dashboard')} 
              className="cursor-pointer hover:bg-white/10 py-3"
            >
              Home
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => navigate('/patients')} 
              className="cursor-pointer hover:bg-white/10 py-3"
            >
              Pacientes
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => scrollToSection('contact')} 
              className="cursor-pointer hover:bg-white/10 py-3"
            >
              Contato
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/10" />
            
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="cursor-pointer hover:bg-white/10 text-red-400 py-3"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
