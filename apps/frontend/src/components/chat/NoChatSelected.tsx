import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-base-100/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-[40%] left-[60%] w-64 h-64 bg-secondary/5 rounded-full blur-2xl -z-10" />

      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        {/* Icon Container with subtle bounce */}
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl group-hover:bg-primary/30 transition-all duration-500" />
          <div className="relative w-24 h-24 bg-base-100 rounded-3xl flex items-center justify-center shadow-xl border border-base-200 group-hover:-translate-y-2 transition-transform duration-500">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2 max-w-sm px-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ping them!
          </h2>
          <p className="text-base-content/60 text-lg leading-relaxed">
            click on an existing conversation or start a new one.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
