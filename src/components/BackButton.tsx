import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  to?: string;
  className?: string;
}

export const BackButton = ({ to, className = "" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`w-10 h-10 rounded-full bg-rest-blue hover:bg-rest-cyan text-white p-0 flex items-center justify-center transition-colors ${className}`}
      aria-label="Voltar"
    >
      <ArrowLeft className="w-5 h-5" />
    </Button>
  );
};
