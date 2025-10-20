import { useAuth } from "@/hooks/useAuth";
import { PublicNavbar } from "./PublicNavbar";
import { AuthenticatedNavbar } from "./AuthenticatedNavbar";
import { NavbarSkeleton } from "./NavbarSkeleton";

interface NavbarProps {
  showBackButton?: boolean;
  backButtonPath?: string;
}

const Navbar = ({ showBackButton, backButtonPath }: NavbarProps) => {
  const { user, loading } = useAuth();
  
  if (loading) return <NavbarSkeleton />;
  
  return user ? (
    <AuthenticatedNavbar showBackButton={showBackButton} backButtonPath={backButtonPath} />
  ) : (
    <PublicNavbar />
  );
};

export default Navbar;
