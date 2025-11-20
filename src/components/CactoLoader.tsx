import cactoGif from "@/assets/cacto-loading.gif";

interface CactoLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const CactoLoader = ({ 
  size = "md", 
  text = "Processando...",
  className = "" 
}: CactoLoaderProps) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <img 
        src={cactoGif} 
        alt="Carregando" 
        className={`${sizes[size]} object-contain`}
      />
      {text && (
        <p className="text-sm text-white/60 animate-pulse">{text}</p>
      )}
    </div>
  );
};
