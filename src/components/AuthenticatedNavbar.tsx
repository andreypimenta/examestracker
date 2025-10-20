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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
        <Sheet>
          <SheetTrigger asChild>
            <button 
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          </SheetTrigger>
          
          <SheetContent 
            side="right" 
            className="w-[280px] sm:w-[350px] bg-gradient-to-br from-black via-zinc-900 to-black border-l border-white/10"
          >
            <SheetHeader>
              <SheetTitle className="text-white text-left">Menu</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col space-y-3 mt-8">
              <Link 
                to="/dashboard"
                className="font-medium text-white/90 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 transition-all hover:translate-x-1 text-base flex items-center group"
              >
                <span className="w-1 h-6 bg-rest-blue rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Home
              </Link>
              
              <Link 
                to="/patients"
                className="font-medium text-white/90 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 transition-all hover:translate-x-1 text-base flex items-center group"
              >
                <span className="w-1 h-6 bg-rest-blue rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Pacientes
              </Link>
              
              <button 
                onClick={() => scrollToSection('contact')}
                className="font-medium text-white/90 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 transition-all hover:translate-x-1 text-base text-left flex items-center group"
              >
                <span className="w-1 h-6 bg-rest-blue rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Contato
              </button>
              
              <div className="pt-4 mt-4 border-t border-white/10">
                <Button 
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg w-full py-3 text-base font-medium"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
