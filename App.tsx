
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Sidebar, Logo } from './components/Layout';
import { User, AuthState, Review } from './types';

// Configurações Globais
const PIX_KEY = "50706268504";
const ADMIN_NUMBER = "71982046468";

// Utilitário de validação de CPF
const isValidCPF = (cpf: string): boolean => {
  if (typeof cpf !== 'string') return false;
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  
  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  
  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

// Máscara para CPF
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const [view, setView] = useState<'USER' | 'ADMIN'>('USER');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Recupera sessão ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('amigoRentavelUser');
    if (savedUser) {
      setAuthState({
        isAuthenticated: true,
        user: JSON.parse(savedUser),
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('amigoRentavelUser');
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    setView('USER');
  };

  const handleRegister = (user: User) => {
    // Salvar Avaliação no LocalStorage ao registrar
    const newReview: Review = {
      id: Math.random().toString(36).substring(2, 9),
      userName: user.name,
      rating: rating,
      comment: comment,
      date: new Date().toISOString(),
    };
    const existingReviews = JSON.parse(localStorage.getItem('amigoRentavelReviews') || '[]');
    localStorage.setItem('amigoRentavelReviews', JSON.stringify([...existingReviews, newReview]));

    localStorage.setItem('amigoRentavelUser', JSON.stringify(user));
    setAuthState({
      isAuthenticated: true,
      user: user,
    });
    alert("Cadastro realizado! Verifique seu WhatsApp ou E-mail para o código de ativação.");
  };

  const updateStatus = (status: User['status'], extraData?: Partial<User>) => {
    if (!authState.user) return;
    const updatedUser = { ...authState.user, status, ...extraData };
    setAuthState({ ...authState, user: updatedUser });
    localStorage.setItem('amigoRentavelUser', JSON.stringify(updatedUser));
  };

  const handleSupportClick = () => {
    window.open(`https://wa.me/55${ADMIN_NUMBER}`, '_blank');
  };

  const SupportButton = () => (
    <div className="fixed bottom-6 right-6 z-50">
       <button 
         onClick={handleSupportClick} 
         className="bg-green-500 text-white px-5 py-3 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-3 border-4 border-white"
       >
         <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
           <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
         </svg>
         <span className="font-bold text-sm">Ajuda Rápida</span>
       </button>
    </div>
  );

  // Renderização da Tela de Autenticação (Login/Cadastro)
  if (!authState.isAuthenticated) {
    return (
      <Layout>
        <Sidebar onLogoClick={() => window.location.reload()} />
        <div className="flex-1 p-6 md:p-10 pb-12 overflow-y-auto relative z-10 flex flex-col bg-white">
          <div className="md:hidden flex justify-center mb-8">
            <Logo onClick={() => window.location.reload()} />
          </div>
          
          <AuthForm onRegister={handleRegister} onLogin={() => alert("Acesse sua conta para continuar.")} />
          
          <div className="mt-10 pt-6 border-t border-green-100">
             <h3 className="text-black font-black mb-4 text-xs uppercase tracking-[0.2em] text-center">Como Funciona</h3>
             <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                   <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                      <div className="bg-green-400 text-black w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0">1</div>
                      <p className="text-xs text-black/70 font-medium leading-tight">Invista o valor de <strong className="text-black">R$ 10,00 ou mais</strong>.</p>
                   </div>
                   <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                      <div className="bg-green-400 text-black w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0">2</div>
                      <p className="text-xs text-black/70 font-medium leading-tight">Indique <strong className="text-black">2 amigos</strong> que deverão investir o mesmo valor ou mais.</p>
                   </div>
                   <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                      <div className="bg-green-400 text-black w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0">3</div>
                      <p className="text-xs text-black/70 font-medium leading-tight">Você recebe <strong className="text-green-600 font-bold">70% de lucro</strong>.</p>
                   </div>
                   
                   <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mt-2">
                      <p className="text-[10px] font-black uppercase text-red-600 mb-1 flex items-center gap-2">
                         <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>
                         Regra de Desistência
                      </p>
                      <p className="text-[11px] text-red-800 leading-tight">Caso queira desistir antes de completar as indicações, você deve indicar pelo menos <strong className="font-bold">1 amigo</strong> para recuperar seu investimento original.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Seção de Avaliação no Rodapé da Conteúdo */}
          <RatingFooter rating={rating} setRating={setRating} comment={comment} setComment={setComment} />
          
          <SupportButton />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar 
        onLogout={handleLogout} 
        onLogoClick={() => setView('USER')}
        extraContent={
          <div className="pt-4 border-t border-green-200 mt-4">
            <button 
              onClick={() => setView(view === 'USER' ? 'ADMIN' : 'USER')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                view === 'ADMIN' ? 'bg-black text-green-400' : 'text-black/30 hover:bg-green-200/50'
              }`}
            >
              {view === 'USER' ? 'Gestão Admin' : 'Painel Usuário'}
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto relative z-10 bg-white flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-green-100">
           <Logo className="scale-75 origin-left" onClick={() => setView('USER')} />
           <button onClick={handleLogout} className="text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-100 px-3 py-1.5 rounded-full">Sair</button>
        </div>

        {view === 'ADMIN' ? (
          <AdminView 
            user={authState.user!} 
            onApproveDeposit={() => updateStatus('ACTIVE')}
            onBack={() => setView('USER')}
          />
        ) : (
          <div className="flex-1">
            {authState.user?.status === 'PENDING_VERIFICATION' && (
                <VerificationView user={authState.user} onVerify={() => updateStatus('PENDING_DEPOSIT')} onBack={handleLogout} />
            )}
            {authState.user?.status === 'PENDING_DEPOSIT' && (
              <DepositView user={authState.user} onConfirm={(amount) => updateStatus('PENDING_APPROVAL', { investmentAmount: amount })} onBack={handleLogout} />
            )}
            {authState.user?.status === 'PENDING_APPROVAL' && (
              <PendingApprovalView 
                onCancel={() => updateStatus('PENDING_DEPOSIT')}
                onBack={handleLogout}
                onAdminPanel={() => setView('ADMIN')}
              />
            )}
            {authState.user?.status === 'ACTIVE' && (
              <Dashboard 
                user={authState.user} 
                onLogout={handleLogout}
              />
            )}
          </div>
        )}

        <SupportButton />
      </div>
    </Layout>
  );
}

// --- Componentes Internos Especializados ---

const RatingFooter: React.FC<{ 
  rating: number; 
  setRating: (n: number) => void; 
  comment: string; 
  setComment: (s: string) => void 
}> = ({ rating, setRating, comment, setComment }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="mt-12 pt-8 border-t border-green-100 bg-green-50/30 -mx-6 md:-mx-10 p-6 md:p-10 text-center">
       <div className="max-w-sm mx-auto space-y-5">
          <div>
            <h4 className="text-[10px] font-black uppercase text-black/40 tracking-[0.2em]">O que achou de nós?</h4>
            <p className="text-xs text-black/60 font-bold uppercase mt-1">Sua avaliação ajuda outros investidores</p>
          </div>
          
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-125"
              >
                <svg
                  width="32"
                  height="32"
                  fill={(hoverRating || rating) >= star ? "#4ade80" : "none"}
                  stroke={(hoverRating || rating) >= star ? "#4ade80" : "#d1d5db"}
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>

          <textarea
            placeholder="Deixe seu depoimento sobre a Amigo Rentável..."
            className="w-full bg-white border border-green-200 rounded-2xl p-4 text-black outline-none focus:ring-2 focus:ring-green-400 transition-all font-medium placeholder:text-black/30 h-24 resize-none shadow-sm text-center"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <p className="text-[9px] text-black/30 font-bold uppercase italic tracking-tighter">Sua avaliação será enviada após o cadastro completo.</p>
       </div>
    </div>
  );
};

const AuthForm: React.FC<{ onRegister: (u: User) => void; onLogin: () => void }> = ({ onRegister, onLogin }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [cpfError, setCpfError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const maskedValue = maskCPF(e.target.value);
    setFormData({ ...formData, cpf: maskedValue });
    
    if (rawValue.length === 11 && !isValidCPF(rawValue)) {
      setCpfError('CPF Inválido. Verifique os números.');
    } else {
      setCpfError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (cpfError || formData.cpf.length < 14) return;
      if (!acceptedTerms) return;

      onRegister({
        ...formData,
        status: 'PENDING_VERIFICATION',
        investmentAmount: 0,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        approvedReferrals: 0,
      });
    } else {
      onLogin();
    }
  };

  const inputStyle = "w-full bg-green-50/50 border border-green-200 rounded-2xl p-4 text-black outline-none focus:ring-2 focus:ring-green-400 transition-all font-medium placeholder:text-black/30";

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
         <h2 className="text-3xl font-black text-black tracking-tighter uppercase">{isRegister ? 'Nova Conta' : 'Acesse seu Painel'}</h2>
         <p className="text-black/40 text-xs font-bold uppercase tracking-widest mt-1">Invista e Ganhe em Comunidade</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <input required placeholder="Nome Completo" type="text" className={inputStyle} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <div>
              <input required placeholder="CPF (000.000.000-00)" type="text" className={`${inputStyle} ${cpfError ? 'border-red-400' : ''}`} value={formData.cpf} onChange={handleCpfChange} />
              {cpfError && <p className="text-red-500 text-[10px] mt-1 font-black uppercase ml-2">{cpfError}</p>}
            </div>
            <input required placeholder="WhatsApp / Celular" type="tel" className={inputStyle} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </>
        )}
        <input required placeholder="E-mail" type="email" className={inputStyle} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        <input required placeholder="Senha de Acesso" type="password" className={inputStyle} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

        {isRegister && (
          <div className="flex items-center gap-3 px-2 py-2">
            <input 
              required 
              type="checkbox" 
              id="li_aceito" 
              checked={acceptedTerms} 
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-5 h-5 accent-green-400 cursor-pointer"
            />
            <label htmlFor="li_aceito" className="text-black cursor-pointer text-xs uppercase tracking-tight select-none">
              Li e aceito os termos
            </label>
          </div>
        )}

        <button type="submit" className="w-full font-black py-5 rounded-2xl bg-black text-green-400 shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all uppercase text-xs tracking-[0.2em] mt-2">
          {isRegister ? 'Criar minha conta' : 'Entrar no sistema'}
        </button>
      </form>

      <button onClick={() => setIsRegister(!isRegister)} className="w-full mt-8 text-black/40 text-[10px] font-black uppercase tracking-[0.1em] hover:text-black transition-colors">
        {isRegister ? 'Já tenho acesso • Fazer Login' : 'Não sou membro • Criar Conta'}
      </button>
    </div>
  );
};

const VerificationView: React.FC<{ user: User; onVerify: () => void; onBack: () => void }> = ({ user, onVerify, onBack }) => {
  const [code, setCode] = useState('');
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-green-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg rotate-3">
         <svg width="32" height="32" fill="black" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
      </div>
      <h2 className="text-2xl font-black text-black uppercase tracking-tight">Verificação</h2>
      <p className="text-black/50 mb-8 text-sm max-w-xs mx-auto">Insira o código enviado para o seu <strong>WhatsApp</strong> ou <strong>E-mail ({user.email})</strong>.</p>
      <input type="text" maxLength={6} placeholder="000000" className="w-48 bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center text-4xl tracking-[0.2em] font-black outline-none mb-10 focus:border-green-400" value={code} onChange={(e) => {
        if (e.target.value === '123456') onVerify();
        else setCode(e.target.value);
      }} />
      <button onClick={onBack} className="text-[10px] text-black/30 font-black uppercase tracking-widest hover:text-red-500 flex items-center gap-2">Sair e Corrigir Dados</button>
    </div>
  );
};

const DepositView: React.FC<{ user: User; onConfirm: (amount: number) => void; onBack: () => void }> = ({ user, onConfirm, onBack }) => {
  const [amount, setAmount] = useState('10.00');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWhatsAppSend = () => {
    const text = `COMPROVANTE AMIGO RENTÁVEL\n\nNome: ${user.name}\nCPF: ${user.cpf}\nValor: R$ ${amount}\n\n${file ? `Anexo: ${file.name}` : 'Aguardando ativação!'}`;
    window.open(`https://wa.me/55${ADMIN_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    onConfirm(parseFloat(amount));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center animate-fade-in-up">
      <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-2">Ativar Minha Conta</h2>
      <p className="text-black/50 mb-8 text-sm">Realize o PIX e envie o comprovante abaixo.</p>
      
      <div className="w-full max-w-sm bg-green-50 p-6 rounded-[2.5rem] border border-green-200 mb-8 shadow-sm">
        <div className="text-left mb-6">
           <label className="text-[10px] font-black uppercase text-black/40 ml-1">Quanto deseja investir?</label>
           <div className="relative mt-1">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/30 text-lg">R$</span>
             <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white border-2 border-green-300 rounded-2xl py-4 pl-12 pr-4 text-2xl font-black outline-none focus:border-green-400" />
           </div>
        </div>

        <div className="bg-green-200/40 p-4 rounded-2xl flex flex-col gap-2 border border-green-300 mb-6">
           <p className="text-[10px] font-black uppercase text-black/40 text-left">Chave PIX (CPF)</p>
           <div className="flex justify-between items-center bg-white p-3 rounded-xl">
              <span className="font-mono font-bold text-black text-sm">{PIX_KEY}</span>
              <button onClick={() => {navigator.clipboard.writeText(PIX_KEY); alert("Chave Copiada!");}} className="bg-green-400 text-black px-3 py-1.5 rounded-lg font-black text-[10px] uppercase">Copiar</button>
           </div>
        </div>

        {/* Campo de Anexo de Comprovante */}
        <div className="text-left">
           <label className="text-[10px] font-black uppercase text-black/40 ml-1">Anexar Comprovante</label>
           <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" />
           <div 
             onClick={triggerFileInput}
             className="mt-1 cursor-pointer w-full bg-white border-2 border-dashed border-green-400 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-green-100/50 transition-all"
           >
              {file ? (
                <div className="flex items-center gap-2 text-green-600">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.317 8.762a.733.733 0 0 1 .01-1.05.733.733 0 0 1 1.047 0l2.454 2.455 5.908-6.197z"/></svg>
                  <span className="text-[11px] font-black uppercase truncate max-w-[200px]">{file.name}</span>
                </div>
              ) : (
                <>
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="text-green-500"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>
                  <span className="text-[10px] font-black uppercase text-black/30">Clique para selecionar arquivo</span>
                </>
              )}
           </div>
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        <button 
          onClick={handleWhatsAppSend} 
          disabled={!file}
          className={`w-full font-black py-5 rounded-2xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3 ${
            file ? 'bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
          {file ? 'Enviar Comprovante' : 'Selecione o Arquivo'}
        </button>
        <button onClick={onBack} className="text-[10px] text-black/30 font-black uppercase tracking-widest hover:text-black">Sair da Conta</button>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const invested = user.investmentAmount || 0;
  const potentialReturn = invested * 1.7;
  const [showGoalNotification, setShowGoalNotification] = useState(false);
  const [friendApproval, setFriendApproval] = useState<{show: boolean, name: string}>({show: false, name: ''});
  const prevReferralCount = useRef(user.approvedReferrals);

  // Monitorar aprovações individuais de amigos
  useEffect(() => {
    if (user.approvedReferrals > prevReferralCount.current) {
      const mockNames = ["Ricardo Pereira", "Juliana Costa", "André Luiz", "Patrícia Gomes", "Gabriel Santos"];
      const approvedName = mockNames[(user.approvedReferrals - 1) % mockNames.length];
      
      setFriendApproval({ show: true, name: approvedName });
      
      const timer = setTimeout(() => {
        setFriendApproval(prev => ({ ...prev, show: false }));
      }, 5000);

      prevReferralCount.current = user.approvedReferrals;
      return () => clearTimeout(timer);
    }
  }, [user.approvedReferrals]);

  // Monitorar meta de indicações
  useEffect(() => {
    if (user.approvedReferrals >= 2) {
      const timer = setTimeout(() => {
        setShowGoalNotification(true);
        const hideTimer = setTimeout(() => setShowGoalNotification(false), 10000);
        return () => clearTimeout(hideTimer);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user.approvedReferrals]);

  return (
    <div className="p-6 md:p-10 h-full space-y-8 animate-fade-in-up relative">
      <div className="absolute top-4 left-4 right-4 z-[60] flex flex-col gap-3 pointer-events-none">
        {friendApproval.show && (
          <div className="animate-bounce-in pointer-events-auto">
            <div className="bg-green-400 text-black p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-green-600">
              <div className="flex items-center gap-3">
                <div className="bg-black text-green-400 p-2 rounded-full">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.317 8.762a.733.733 0 0 1 .01-1.05.733.733 0 0 1 1.047 0l2.454 2.455 5.908-6.197z"/>
                  </svg>
                </div>
                <p className="font-bold">{friendApproval.name} foi aprovado!</p>
              </div>
            </div>
          </div>
        )}

        {showGoalNotification && (
          <div className="animate-bounce-in pointer-events-auto">
            <div className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-green-400">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.319.232.319.437a.5.5 0 0 1-.5.5H5.25a.5.5 0 0 1-.5-.5c0-.205.125-.389.319-.437L6.5 13.11V10.937c-.955-.234-2.043-1.146-2.833-3.011a3 3 0 1 1-1.133-5.89A33.035 33.035 0 0 1 2.5.5zm10 2h-9a25.155 25.155 0 0 0 .01 2.25c.01.244.02.464.03.66a2 2 0 1 0 1.133 3.89c.762-1.803 1.626-2.733 2.327-2.967a.5.5 0 0 1 .596.492v4.22l-1.038.259c-.272.068-.49.255-.581.496l-.3 1.1h3.35l-.3-1.1c-.092-.241-.309-.428-.581-.496l-1.038-.259V7.834a.5.5 0 0 1 .596-.492c.701.234 1.565 1.164 2.327 2.967a2 2 0 1 0 1.133-3.89 15.741 15.741 0 0 0 .03-.66A24.57 24.57 0 0 0 12.5 2.5z"/>
                  </svg>
                </div>
                <p className="font-bold">Meta de Indicações Atingida!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-start animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tight leading-none uppercase">Meu Painel</h2>
          <p className="text-black/40 text-xs font-bold mt-2 uppercase">Investidor: {user.name.split(' ')[0]}</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase border border-green-200 shadow-sm transition-all hover:scale-105">Ativo</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-green-50 p-6 rounded-[2rem] border border-green-200 animate-fade-in-up [animation-delay:100ms]">
          <p className="text-black/40 text-[10px] font-black uppercase mb-1">Aporte</p>
          <p className="text-3xl font-black text-black">R$ {invested.toFixed(2)}</p>
        </div>
        <div className="bg-green-400 p-6 rounded-[2rem] shadow-2xl shadow-green-400/30 border-2 border-green-500 md:scale-105 animate-fade-in-up [animation-delay:200ms]">
          <p className="text-black/70 text-[10px] font-black uppercase mb-1">Retorno Previsto</p>
          <p className="text-3xl font-black text-black">R$ {potentialReturn.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-fade-in-up [animation-delay:300ms]">
          <p className="text-black/40 text-[10px] font-black uppercase mb-1">Amigos</p>
          <p className="text-3xl font-black text-black">{user.approvedReferrals} <span className="text-sm text-black/20">/ 2</span></p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-[2rem] p-8 animate-fade-in-up [animation-delay:400ms] transition-all hover:shadow-md">
        <h3 className="text-black font-black mb-4 text-[10px] uppercase tracking-widest">Link de Convite</h3>
        <div className="flex gap-3">
          <input readOnly value={`amigo.rentavel.com/ref=${user.referralCode}`} className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black text-xs font-bold outline-none shadow-inner" />
          <button onClick={() => {navigator.clipboard.writeText(`amigo.rentavel.com/ref=${user.referralCode}`); alert("Link de indicação copiado!");}} className="bg-black text-white px-8 rounded-2xl text-xs font-black uppercase hover:bg-zinc-800 transition-all shadow-lg active:scale-95">Copiar</button>
        </div>
      </div>
      
      <div className="md:hidden text-center pt-10 animate-fade-in-up [animation-delay:500ms]">
         <button onClick={onLogout} className="text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-red-600">Desconectar</button>
      </div>
    </div>
  );
};

const PendingApprovalView: React.FC<{ 
  onCancel: () => void; 
  onBack: () => void;
  onAdminPanel: () => void;
}> = ({ onCancel, onBack, onAdminPanel }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
    <div className="relative w-24 h-24 mb-8">
       <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
       <div className="absolute inset-0 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
       <div className="absolute inset-0 flex items-center justify-center font-black text-black text-xs uppercase">Validando</div>
    </div>
    <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-2">Análise em Curso</h2>
    <p className="text-black/40 max-w-sm mb-12 text-sm font-medium">Nosso time está confirmando seu aporte via WhatsApp. Isso leva alguns instantes.</p>
    
    <div className="w-full max-w-sm space-y-4">
      <button onClick={onCancel} className="w-full border-2 border-green-400 text-green-700 font-black py-4 rounded-2xl hover:bg-green-50 text-xs uppercase tracking-widest transition-all">Cancelar Envio</button>
      <button onClick={onBack} className="text-[10px] text-black/30 font-black uppercase tracking-[0.2em] block mx-auto hover:text-black">Voltar</button>
      <div className="pt-16 opacity-10 hover:opacity-100 transition-opacity">
         <button onClick={onAdminPanel} className="text-[9px] text-black/20 font-black uppercase tracking-tighter">[ Acesso Gerencial ]</button>
      </div>
    </div>
  </div>
);

const AdminView: React.FC<{ 
  user: User; 
  onApproveDeposit: () => void;
  onBack: () => void;
}> = ({ user, onApproveDeposit, onBack }) => {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
    // Simula uma pequena latência para mostrar a animação antes de prosseguir
    setTimeout(() => {
      onApproveDeposit();
      alert("Membro ativado com sucesso!");
      onBack();
    }, 800);
  };

  return (
    <div className="p-8 md:p-12 h-full flex flex-col space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-4">
         <button onClick={onBack} className="bg-green-100 p-3 rounded-2xl hover:bg-green-200 transition-all">
            <svg width="20" height="20" fill="black" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
         </button>
         <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Gestão Administrativa</h2>
      </div>

      <div className="bg-green-50 border-2 border-green-200 rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-md">
        <p className="text-[10px] font-black text-green-700 uppercase mb-4 tracking-widest">Solicitação de Ativação</p>
        <div className="space-y-6">
           <div>
              <p className="text-black/40 text-[10px] font-black uppercase">Membro</p>
              <h3 className="font-black text-black text-2xl">{user.name}</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl">
                 <p className="text-black/40 text-[9px] font-black uppercase mb-1">CPF</p>
                 <p className="font-bold text-xs">{user.cpf}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl">
                 <p className="text-black/40 text-[9px] font-black uppercase mb-1">Status</p>
                 <p className="font-black text-xs text-green-600 uppercase">{user.status}</p>
              </div>
           </div>

           {user.status !== 'ACTIVE' && (
              <button 
                onClick={handleApprove}
                disabled={isApproving}
                className={`w-full bg-black text-green-400 font-black py-5 rounded-2xl transition-all duration-300 uppercase text-xs tracking-widest shadow-xl shadow-black/10 active:scale-95 flex items-center justify-center gap-3 ${
                  isApproving ? 'opacity-70 scale-[0.98]' : 'hover:bg-zinc-800'
                }`}
              >
                {isApproving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : 'Aprovar Pagamento e Ativar'}
              </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default App;
