
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Logo: React.FC<{ className?: string; onClick?: () => void }> = ({ className = "", onClick }) => (
  <div className={`flex items-center gap-3 cursor-pointer ${className}`} onClick={onClick}>
    <div className="relative">
      <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-green-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      </div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-green-100 rounded-full flex items-center justify-center">
        <span className="text-[10px] font-black text-black">$</span>
      </div>
    </div>
    <div className="flex flex-col leading-none text-left">
      <span className="text-sm font-light tracking-[0.2em] text-black/60 uppercase">Amigo</span>
      <span className="text-xl font-black text-black tracking-tighter uppercase">Rentável</span>
    </div>
  </div>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md md:max-w-4xl bg-white rounded-3xl shadow-2xl border border-green-200 overflow-hidden min-h-[600px] flex flex-col md:flex-row relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        {children}
      </div>
    </div>
  );
};

interface SidebarProps {
  onLogout?: () => void;
  onLogoClick?: () => void;
  extraContent?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, onLogoClick, extraContent }) => {
  const handleSupportClick = () => {
    window.open('https://wa.me/5571982046468', '_blank');
  };

  return (
    <div className="hidden md:flex flex-col justify-between p-8 w-1/3 bg-green-100 border-r border-green-200 relative z-10">
      <div>
        <div className="mb-10">
          <Logo onClick={onLogoClick} />
        </div>
        <div className="space-y-6 text-black/70 text-sm">
          <p className="leading-relaxed">Potencialize seus ganhos através de nossa rede de investimentos inteligente e moderna.</p>
          
          <div className="p-5 bg-green-200/50 rounded-2xl border border-green-300 shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-green-700 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Retorno Garantido
            </div>
            <p className="text-xs text-black/80">Receba <span className="text-black font-bold">70% de lucro</span> sobre seus aportes através do sistema de indicação qualificada.</p>
          </div>

          <button 
            onClick={handleSupportClick}
            className="w-full flex items-center justify-center gap-2 bg-green-400 hover:bg-green-500 text-black border border-green-500/20 py-3 rounded-xl transition-all font-semibold shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
            </svg>
            Fale Conosco
          </button>

          {extraContent}
        </div>
      </div>

      <div className="space-y-4">
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm transition-colors py-2 border-t border-green-200 mt-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair da Conta
          </button>
        )}
        <div className="text-xs text-black/50 text-center font-medium">
          &copy; 2024 Amigo Rentável
        </div>
      </div>
    </div>
  );
};
