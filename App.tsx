
import React, { useState, useEffect } from 'react';
import { Layout, Sidebar, Logo } from './components/Layout';
import { User, AuthState, Review } from './types';

// Configurações Globais Iniciais
const DEFAULT_ADMIN_PASS = "admin123";
const ADMIN_NUMBER = "71982046468";
const PIX_KEY = "50706268504";
const MIN_INVESTMENT = 10;

// Utilitários de Persistência Global
const getGlobalUsers = (): User[] => {
  const data = localStorage.getItem('amigoRentavel_Database');
  return data ? JSON.parse(data) : [];
};

const saveGlobalUsers = (users: User[]) => {
  localStorage.setItem('amigoRentavel_Database', JSON.stringify(users));
};

const getMasterPass = (): string => {
  return localStorage.getItem('amigoRentavel_AdminPass') || DEFAULT_ADMIN_PASS;
};

const saveMasterPass = (newPass: string) => {
  localStorage.setItem('amigoRentavel_AdminPass', newPass);
};

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

  const [view, setView] = useState<'USER' | 'ADMIN' | 'ADMIN_LOGIN'>('USER');
  const [globalUsers, setGlobalUsers] = useState<User[]>(getGlobalUsers());
  const [showActivationToast, setShowActivationToast] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(
    sessionStorage.getItem('adminAuth') === 'true'
  );

  useEffect(() => {
    const handleCaptureRef = () => {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        localStorage.setItem('amigoRentavel_PendingRef', refCode.toUpperCase());
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };
    handleCaptureRef();
    window.addEventListener('popstate', handleCaptureRef);
    return () => window.removeEventListener('popstate', handleCaptureRef);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const users = getGlobalUsers();
      setGlobalUsers(users);
      
      if (authState.isAuthenticated && authState.user) {
        const currentUser = users.find(u => u.cpf === authState.user?.cpf);
        if (currentUser && currentUser.status !== authState.user.status) {
          if (currentUser.status === 'ACTIVE') setShowActivationToast(true);
          setAuthState(prev => ({ ...prev, user: currentUser }));
          localStorage.setItem('amigoRentavelUser', JSON.stringify(currentUser));
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [authState]);

  useEffect(() => {
    const savedUser = localStorage.getItem('amigoRentavelUser');
    if (savedUser) {
      setAuthState({ isAuthenticated: true, user: JSON.parse(savedUser) });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('amigoRentavelUser');
    setAuthState({ isAuthenticated: false, user: null });
    setView('USER');
    setAdminAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  const handleGlobalClose = () => {
    if (view === 'ADMIN' || view === 'ADMIN_LOGIN') {
      setView('USER');
    } else if (authState.isAuthenticated) {
      if (window.confirm("Deseja realmente sair da conta?")) {
        handleLogout();
      }
    } else {
      localStorage.removeItem('amigoRentavel_PendingRef');
      window.location.reload();
    }
  };

  const handleRegister = (user: User, manualRef?: string) => {
    let users = getGlobalUsers();
    if (users.find(u => u.cpf === user.cpf)) {
      alert("Este CPF já está cadastrado no sistema.");
      return;
    }
    const refToUse = manualRef || localStorage.getItem('amigoRentavel_PendingRef');
    if (refToUse) {
      const referrerExists = users.some(u => u.referralCode === refToUse);
      if (referrerExists) {
        users = users.map(u => {
          if (u.referralCode === refToUse) {
            return { ...u, approvedReferrals: (u.approvedReferrals || 0) + 1 };
          }
          return u;
        });
      }
      localStorage.removeItem('amigoRentavel_PendingRef');
    }
    const newList = [...users, user];
    saveGlobalUsers(newList);
    setGlobalUsers(newList);
    localStorage.setItem('amigoRentavelUser', JSON.stringify(user));
    setAuthState({ isAuthenticated: true, user: user });
    const message = `Olá! Acabei de me cadastrar no Amigo Rentável.\n\nNome: ${user.name}\nCPF: ${user.cpf}\n\nCódigo de Indicação: ${refToUse || 'Direto'}\n\nGostaria de receber meu código de ativação.`;
    window.open(`https://wa.me/55${ADMIN_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const updateCurrentUserStatus = (status: User['status'], extraData?: Partial<User>) => {
    if (!authState.user) return;
    const users = getGlobalUsers();
    const updatedUsers = users.map(u => u.cpf === authState.user?.cpf ? { ...u, status, ...extraData } : u);
    saveGlobalUsers(updatedUsers);
    const updatedUser = { ...authState.user, status, ...extraData };
    setAuthState({ ...authState, user: updatedUser });
    localStorage.setItem('amigoRentavelUser', JSON.stringify(updatedUser));
  };

  const handleAdminAction = (cpf: string, status: User['status'], extra?: Partial<User>) => {
    const users = getGlobalUsers();
    const updated = users.map(u => u.cpf === cpf ? { ...u, status, ...extra } : u);
    saveGlobalUsers(updated);
    setGlobalUsers(updated);
  };

  const handleDeleteUser = (cpf: string) => {
    if (!window.confirm("Deseja realmente excluir este investidor?")) return;
    const users = getGlobalUsers();
    const updated = users.filter(u => u.cpf !== cpf);
    saveGlobalUsers(updated);
    setGlobalUsers(updated);
  };

  const performAdminLogin = (password: string) => {
    if (password === getMasterPass()) {
      setAdminAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setView('ADMIN');
    } else {
      alert("Senha incorreta.");
    }
  };

  const GlobalCloseButton = () => {
    const isVisible = view !== 'USER' || authState.isAuthenticated;
    if (!isVisible) return null;
    return (
      <button 
        onClick={handleGlobalClose}
        className="fixed top-8 right-8 z-[200] bg-black text-green-400 p-3 rounded-full shadow-2xl border-2 border-white hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="group-hover:rotate-90 transition-transform">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
        </svg>
      </button>
    );
  };

  if (view === 'ADMIN_LOGIN') {
    return (
      <Layout>
        <GlobalCloseButton />
        <Sidebar onLogoClick={() => setView('USER')} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
           <AdminLoginForm onLogin={performAdminLogin} onCancel={() => setView('USER')} />
        </div>
      </Layout>
    );
  }

  if (view === 'ADMIN' && adminAuthenticated) {
    return (
      <Layout>
        <GlobalCloseButton />
        <Sidebar 
          onLogout={handleLogout} 
          onLogoClick={() => setView('USER')}
          extraContent={
            <div className="pt-4 border-t border-green-200 mt-4">
              <button onClick={() => setView('USER')} className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-black text-green-400">Voltar ao App</button>
            </div>
          }
        />
        <div className="flex-1 bg-white overflow-y-auto relative">
          <AdminPanel 
            users={globalUsers} 
            onApprove={(cpf, amount) => handleAdminAction(cpf, 'ACTIVE', { investmentAmount: amount })}
            onReject={(cpf) => handleAdminAction(cpf, 'PENDING_DEPOSIT')}
            onDelete={handleDeleteUser}
            onReset={(cpf) => handleAdminAction(cpf, 'PENDING_DEPOSIT', { investmentAmount: 0 })}
            onBack={() => setView('USER')}
            onUpdatePass={(p) => saveMasterPass(p)}
          />
        </div>
      </Layout>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Layout>
        <Sidebar onLogoClick={() => window.location.reload()} />
        <div className="flex-1 p-6 md:p-10 pb-12 overflow-y-auto relative z-10 flex flex-col bg-white">
          <div className="md:hidden flex justify-center mb-8"><Logo onClick={() => window.location.reload()} /></div>
          <AuthForm onRegister={handleRegister} onLogin={() => alert("Use o cadastro para entrar.")} />
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="h-[1px] w-full bg-zinc-100 max-w-xs"></div>
            <button 
              onClick={() => setView('ADMIN_LOGIN')} 
              className="bg-zinc-100 hover:bg-zinc-200 text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-200 flex items-center gap-2"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
              Acesso Administrativo
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <GlobalCloseButton />
      <Sidebar 
        onLogout={handleLogout} 
        onLogoClick={() => setView('USER')}
        extraContent={
          <div className="pt-4 border-t border-green-200 mt-4">
            <button 
              onClick={() => adminAuthenticated ? setView('ADMIN') : setView('ADMIN_LOGIN')}
              className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-black/30 hover:bg-green-200/50"
            >
              Painel de Controle Admin
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto relative z-10 bg-white flex flex-col">
        <div className="md:hidden fixed top-8 left-8 z-50">
           <button onClick={() => adminAuthenticated ? setView('ADMIN') : setView('ADMIN_LOGIN')} className="bg-black text-green-400 p-3 rounded-full shadow-xl border-2 border-white">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V3a2 2 0 0 1 2-2h5z"/></svg>
           </button>
        </div>

        {showActivationToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-bounce-in">
            <div className="bg-green-400 text-black p-4 rounded-2xl shadow-2xl border-4 border-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-black text-green-400 p-2 rounded-full">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.317 8.762a.733.733 0 0 1 .01-1.05.733.733 0 0 1 1.047 0l2.454 2.455 5.908-6.197z"/></svg>
                </div>
                <div>
                  <p className="font-black text-xs uppercase leading-tight">Conta Ativada!</p>
                </div>
              </div>
              <button onClick={() => setShowActivationToast(false)} className="p-2"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button>
            </div>
          </div>
        )}

        <div className="flex-1">
          {authState.user?.status === 'PENDING_VERIFICATION' && <VerificationView user={authState.user} onVerify={() => updateCurrentUserStatus('PENDING_DEPOSIT')} onBack={handleLogout} />}
          {authState.user?.status === 'PENDING_DEPOSIT' && <DepositView user={authState.user} onConfirm={(amount) => updateCurrentUserStatus('PENDING_APPROVAL', { investmentAmount: amount })} onBack={handleLogout} />}
          {authState.user?.status === 'PENDING_APPROVAL' && <PendingApprovalView onCancel={() => updateCurrentUserStatus('PENDING_DEPOSIT')} onBack={handleLogout} />}
          {authState.user?.status === 'ACTIVE' && <Dashboard user={authState.user} onLogout={handleLogout} />}
        </div>
      </div>
    </Layout>
  );
}

// --- Componentes ---

const AdminLoginForm: React.FC<{ onLogin: (p: string) => void, onCancel: () => void }> = ({ onLogin, onCancel }) => {
  const [pass, setPass] = useState('');
  return (
    <div className="w-full max-w-sm p-8 bg-zinc-50 rounded-[2.5rem] border-2 border-zinc-200 text-center animate-fade-in-up">
       <div className="bg-black text-green-400 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V3a2 2 0 0 1 2-2h5z"/></svg>
       </div>
       <h2 className="text-xl font-black text-black uppercase mb-2">Painel Restrito</h2>
       <input 
          type="password" 
          placeholder="••••••••" 
          className="w-full bg-white border-2 border-zinc-200 rounded-2xl p-5 text-center text-xl font-black outline-none focus:border-black mb-6"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onLogin(pass)}
          autoFocus
       />
       <button onClick={() => onLogin(pass)} className="w-full bg-black text-green-400 font-black py-4 rounded-2xl uppercase text-xs tracking-widest mb-4">Acessar Sistema</button>
       <button onClick={onCancel} className="text-[10px] text-black/30 font-black uppercase tracking-widest hover:text-black">Voltar</button>
    </div>
  );
};

const AdminPanel: React.FC<{ 
  users: User[], 
  onApprove: (cpf: string, amount: number) => void, 
  onReject: (cpf: string) => void,
  onDelete: (cpf: string) => void,
  onReset: (cpf: string) => void,
  onBack: () => void,
  onUpdatePass: (p: string) => void
}> = ({ users, onApprove, onReject, onDelete, onReset, onBack, onUpdatePass }) => {
  const [newPass, setNewPass] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [approvalAmounts, setApprovalAmounts] = useState<Record<string, string>>({});

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'PENDING_APPROVAL').length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    invested: users.reduce((acc, curr) => acc + (curr.investmentAmount || 0), 0)
  };

  const handlePasswordUpdate = () => {
    if (!newPass || newPass.length < 4) return alert("Mínimo 4 caracteres");
    setIsUpdating(true);
    setTimeout(() => {
      onUpdatePass(newPass);
      setIsUpdating(false);
      setShowSuccess(true);
      setNewPass('');
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight">Gestão Central</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest">Controle Total de Investidores</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Investidores" value={stats.total} color="bg-zinc-100" />
        <StatCard label="Pendentes" value={stats.pending} color="bg-yellow-100 text-yellow-700" />
        <StatCard label="Ativos" value={stats.active} color="bg-green-100 text-green-700" />
        <StatCard label="Total PIX" value={`R$ ${stats.invested.toFixed(2)}`} color="bg-black text-green-400" />
      </div>
      <div className="bg-white border-2 border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="p-6 text-[10px] font-black uppercase text-black/40">Investidor</th>
                <th className="p-6 text-[10px] font-black uppercase text-black/40">Status</th>
                <th className="p-6 text-[10px] font-black uppercase text-black/40">Valor (R$)</th>
                <th className="p-6 text-[10px] font-black uppercase text-black/40 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map(u => (
                <tr key={u.cpf} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-6">
                    <p className="font-black text-xs text-black">{u.name}</p>
                    <p className="text-[10px] text-black/40 font-bold">{u.cpf}</p>
                  </td>
                  <td className="p-6"><StatusBadge status={u.status} /></td>
                  <td className="p-6">
                    {u.status === 'PENDING_APPROVAL' ? (
                      <input 
                        type="number" 
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-black w-24"
                        defaultValue={u.investmentAmount}
                        onChange={(e) => setApprovalAmounts({ ...approvalAmounts, [u.cpf]: e.target.value })}
                      />
                    ) : (
                      <p className="font-black text-xs">R$ {u.investmentAmount?.toFixed(2) || '0.00'}</p>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      {u.status === 'PENDING_APPROVAL' && (
                        <button onClick={() => onApprove(u.cpf, parseFloat(approvalAmounts[u.cpf] || String(u.investmentAmount)))} className="bg-green-400 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase">Aprovar</button>
                      )}
                      <button onClick={() => onDelete(u.cpf)} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-zinc-100 p-8 rounded-[2.5rem] border-2 border-zinc-200">
         <h3 className="text-xs font-black uppercase text-black mb-4">Atualizar Senha Master</h3>
         <div className="flex gap-4">
            <input 
                type={showPass ? "text" : "password"} 
                className="bg-white border border-zinc-300 rounded-xl p-4 text-xs font-bold outline-none flex-1"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
            />
            <button onClick={handlePasswordUpdate} className="bg-black text-green-400 px-8 rounded-xl text-[10px] font-black uppercase">Salvar</button>
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string, value: any, color: string }) => (
  <div className={`${color} p-6 rounded-[2rem] border border-black/5`}>
    <p className="text-[8px] font-black uppercase opacity-60 mb-1">{label}</p>
    <p className="text-xl font-black tracking-tight">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: User['status'] }) => {
  const configs = {
    PENDING_VERIFICATION: { label: 'Cód Pendente', class: 'bg-zinc-100 text-zinc-500' },
    PENDING_DEPOSIT: { label: 'Aguard. Depósito', class: 'bg-orange-100 text-orange-600' },
    PENDING_APPROVAL: { label: 'Validando PIX', class: 'bg-yellow-400 text-black' },
    ACTIVE: { label: 'Ativo', class: 'bg-green-400 text-black' },
  };
  return <span className={`${configs[status].class} px-3 py-1 rounded-full text-[9px] font-black uppercase whitespace-nowrap`}>{configs[status].label}</span>;
};

const AppRules: React.FC<{ showTitle?: boolean }> = ({ showTitle = true }) => (
  <div className="bg-green-100/50 border-2 border-green-200 rounded-[2rem] p-8 animate-fade-in-up mb-6">
    {showTitle && <h3 className="text-sm font-black uppercase text-green-800 mb-6">Regras do Negócio</h3>}
    <ul className="space-y-4">
      <li className="flex gap-4 items-start">
        <span className="bg-black text-green-400 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs">1</span>
        <p className="text-xs leading-relaxed text-black/70 font-bold uppercase">Investimento mínimo de R$ 10,00 para ativação.</p>
      </li>
      <li className="flex gap-4 items-start">
        <span className="bg-black text-green-400 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs">2</span>
        <p className="text-xs leading-relaxed text-black/70 font-bold uppercase">Indique 2 amigos que ativem suas contas.</p>
      </li>
      <li className="flex gap-4 items-start">
        <span className="bg-black text-green-400 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs">3</span>
        <p className="text-xs leading-relaxed text-black/70 font-bold uppercase">Receba 70% de lucro real sobre seu aporte.</p>
      </li>
    </ul>
  </div>
);

const Dashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const invested = user.investmentAmount || 0;
  const referralLink = `${window.location.origin}${window.location.pathname}?ref=${user.referralCode}`;
  return (
    <div className="p-6 md:p-10 space-y-10 animate-fade-in-up">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight">Meu Painel</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase">{user.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard label="Total Aportado" value={`R$ ${invested.toFixed(2)}`} color="bg-green-50 text-black" />
        <StatCard label="Previsão de Saque" value={`R$ ${(invested * 1.7).toFixed(2)}`} color="bg-green-400 text-black" />
        <StatCard label="Indicações" value={`${user.approvedReferrals} / 2`} color="bg-white text-black border border-zinc-100" />
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 text-white">
        <h3 className="text-[9px] font-black uppercase text-green-400 mb-3 tracking-widest">Link de Convite Individual</h3>
        <div className="flex flex-col md:flex-row gap-3">
           <input readOnly value={referralLink} className="flex-1 bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-[10px] font-bold outline-none" />
           <button onClick={() => {navigator.clipboard.writeText(referralLink); alert("Copiado!");}} className="bg-green-400 text-black px-8 rounded-xl text-[10px] font-black uppercase py-4">Copiar Link</button>
        </div>
      </div>
      <AppRules />
    </div>
  );
};

const AuthForm: React.FC<{ onRegister: (u: User, ref?: string) => void; onLogin: () => void }> = ({ onRegister, onLogin }) => {
  const [formData, setFormData] = useState({ name: '', cpf: '', phone: '', email: '', password: '' });
  const [pendingRef, setPendingRef] = useState(localStorage.getItem('amigoRentavel_PendingRef') || '');
  const [cpfError, setCpfError] = useState('');
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setFormData({ ...formData, cpf: masked });
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length === 11) setCpfError(isValidCPF(raw) ? '' : 'CPF Inválido');
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cpfError) return;
    onRegister({ ...formData, status: 'PENDING_VERIFICATION', investmentAmount: 0, referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(), approvedReferrals: 0 }, pendingRef);
  };
  const inputStyle = "w-full bg-green-50/50 border border-green-200 rounded-2xl p-4 text-black outline-none focus:ring-2 focus:ring-green-400 text-xs";
  return (
    <div className="w-full max-sm mx-auto animate-fade-in-up">
      <h2 className="text-xl font-black text-black uppercase mb-4 text-center">Cadastro de Investidor</h2>
      {pendingRef && <div className="bg-green-400 text-black p-3 rounded-xl mb-4 text-[9px] font-black uppercase flex justify-between"><span>🚀 Indicação Ativa: {pendingRef}</span></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Nome Completo" className={inputStyle} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <input required placeholder="CPF" className={inputStyle} value={formData.cpf} onChange={handleCpfChange} />
        {cpfError && <p className="text-red-500 text-[9px] font-black">{cpfError}</p>}
        <input required placeholder="WhatsApp" className={inputStyle} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        <input required placeholder="E-mail" type="email" className={inputStyle} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        <input required placeholder="Senha" type="password" className={inputStyle} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        <button type="submit" className="w-full font-black py-4 rounded-2xl bg-black text-green-400 uppercase text-[10px] tracking-widest">Criar Minha Conta</button>
      </form>
    </div>
  );
};

const VerificationView: React.FC<{ user: User; onVerify: () => void; onBack: () => void }> = ({ onVerify }) => (
  <div className="p-8 h-full flex flex-col items-center justify-center text-center">
    <h2 className="text-2xl font-black text-black uppercase">Verificação</h2>
    <input type="text" maxLength={6} placeholder="000000" className="w-48 bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center text-3xl font-black outline-none mb-6" onChange={(e) => e.target.value === '123456' && onVerify()} />
    <button onClick={() => window.open(`https://wa.me/55${ADMIN_NUMBER}`, '_blank')} className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase">Receber Código</button>
  </div>
);

const DepositView: React.FC<{ user: User; onConfirm: (amount: number) => void; onBack: () => void }> = ({ onConfirm }) => {
  const [amount, setAmount] = useState('10.00');
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-black text-black uppercase mb-2">Ativar Minha Conta</h2>
      <div className="w-full max-sm bg-green-50 p-6 rounded-[2.5rem] border border-green-200 mb-8">
         <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white border-2 border-green-300 rounded-2xl py-4 px-4 text-xl font-black outline-none mb-4" />
         <div className="bg-white p-3 rounded-xl flex justify-between items-center mb-4"><span className="font-mono text-xs font-bold">{PIX_KEY}</span><button onClick={() => {navigator.clipboard.writeText(PIX_KEY); alert("Copiado!");}} className="bg-green-400 text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase">Copiar</button></div>
         <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-[10px] w-full" />
      </div>
      <button onClick={() => onConfirm(parseFloat(amount))} disabled={!file} className={`w-full font-black py-4 rounded-2xl uppercase text-[10px] ${file ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>Confirmar Envio</button>
    </div>
  );
};

const PendingApprovalView: React.FC<{ onCancel: () => void; onBack: () => void }> = ({ onCancel }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-6"></div>
    <h2 className="text-2xl font-black text-black uppercase mb-2">Validando Depósito</h2>
    <p className="text-black/40 text-[10px] font-black uppercase">Aguarde a liberação do administrador.</p>
    <button onClick={onCancel} className="mt-8 border-2 border-green-400 text-green-700 font-black px-8 py-3 rounded-2xl text-[10px] uppercase">Cancelar</button>
  </div>
);

export default App;
