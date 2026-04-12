'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api } from '@/lib/api';
import { RoleCard } from '@/components/auth/RoleCard';
import { Button } from '@/components/ui/button';
import { Scale, User, Briefcase, Gavel, Shield, Loader2, Mail, Lock } from 'lucide-react';

const ROLES = [
  { role: 'citizen', label: 'Citizen', description: 'File a case, track progress', icon: User },
  { role: 'lawyer', label: 'Advocate', description: 'Manage cases, upload evidence', icon: Briefcase },
  { role: 'judge', label: 'Judge', description: 'Review cases, schedule hearings', icon: Gavel },
  { role: 'admin', label: 'Admin', description: 'System administration', icon: Shield },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email/Password state
  const [isLoginState, setIsLoginState] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const handleError = (err: any) => {
    console.error('Auth error:', err);
    if (err.code === 'auth/user-disabled') {
      setError('Your account is Pending Administrator Approval. You will receive an email once approved.');
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      setError('Invalid email or password.');
    } else if (err.code === 'auth/email-already-in-use') {
      setError('This email is already registered.');
    } else {
      const msg = err.response?.data?.error || err.message || 'Authentication failed.';
      setError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true); setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user: firebaseUser } = result;
      await api.post('/auth/register', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        role: 'citizen',
        name: firebaseUser.displayName ?? 'Citizen',
        photoURL: firebaseUser.photoURL,
      });
      router.push('/dashboard/user');
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) return setError('Email and password are required');
    setLoading(true); setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Ensure registration mapping exists or syncs (Admin seed bypasses backend /auth/register natively)
      // Actually we must ping /auth/register to return the user state to global auth object normally
      await api.post('/auth/register', {
        firebaseUid: result.user.uid,
        email: result.user.email,
        role: selectedRole,
        name: result.user.displayName || 'User',
      });
      router.push(`/dashboard/${selectedRole === 'citizen' ? 'user' : selectedRole}`);
    } catch (err: any) {
      // Logout in case it succeeded but backend threw
      signOut(auth);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!name || !email || !password || !mobile || !licenseNumber) {
      return setError('All fields are required');
    }
    setLoading(true); setError(null); setSuccessMsg(null);
    try {
      // Create user in Firebase
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Submit application to backend (this will disable the user)
      await api.post('/auth/professional/apply', {
        firebaseUid: result.user.uid,
        email,
        role: selectedRole,
        name,
        mobile,
        licenseNumber,
      });

      // Sign out immediately so they aren't logged in
      await signOut(auth);

      setSuccessMsg(`Your application has been submitted to Higher Authorities. Once approved, you will get a mail.`);
      setIsLoginState(true);
      setPassword(''); // clear pass
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh bg-fixed flex flex-col relative overflow-y-auto">
      <div className="bg-saffron text-navy font-bold tracking-wider text-[11px] uppercase py-2 text-center fixed top-0 w-full z-50 shadow-sm border-b border-saffron-dark/20">
        This is a Non-Official Government of India Portal.Made by Team Bug_Busters
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 mt-8 z-10 font-sans">
        <div className="flex flex-col items-center gap-4 mb-6 text-center">
          <div className="bg-navy/10 p-3 rounded-3xl shadow-inner border border-navy/5 backdrop-blur-md mb-2 flex items-center justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Ashok Stambh" className="h-14 w-auto drop-shadow-md" />
          </div>
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-navy drop-shadow-sm mb-2 uppercase">NyayaSetu</h1>
            <p className="text-navy/60 font-bold uppercase tracking-widest text-xs">AI-Powered Indian Judiciary Portal</p>
          </div>
        </div>

        <div className="glass-card p-10 w-full max-w-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
            {ROLES.map((r) => (
              <div 
                key={r.role} 
                onClick={() => {
                  setSelectedRole(r.role);
                  setError(null);
                  setSuccessMsg(null);
                  setIsLoginState(true); // reset to login
                }}
                className={`p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${selectedRole === r.role ? 'bg-navy border-navy text-white shadow-lg' : 'bg-white/50 border-[#D9D5C7] text-navy/60 hover:bg-white'}`}
              >
                <r.icon className="h-5 w-5 mb-1" />
                <span className="text-[10px] uppercase font-bold tracking-wider">{r.label}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50/80 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
              <p className="text-sm text-green-700 font-medium">{successMsg}</p>
            </div>
          )}

          {selectedRole === 'citizen' ? (
            <div className="text-center space-y-6">
              <h2 className="text-xl font-bold text-navy">Citizen Portal Login</h2>
              <p className="text-sm text-slate-500 mb-4">Securely file and track your cases</p>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-navy hover:bg-navy/90 text-white py-6"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Continue with Google Account'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-navy capitalize">
                  {selectedRole} {isLoginState ? 'Access' : 'Application'}
                </h2>
                {selectedRole !== 'admin' && (
                  <button 
                    onClick={() => setIsLoginState(!isLoginState)}
                    className="text-xs font-bold text-saffron-dark uppercase hover:underline"
                  >
                    {isLoginState ? 'Apply for Access' : 'Back to Login'}
                  </button>
                )}
              </div>

              {isLoginState ? (
                <>
                  <input type="email" placeholder="Official Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-navy focus:outline-none" />
                  <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-navy focus:outline-none" />
                  <Button onClick={handleEmailLogin} disabled={loading} className="w-full bg-navy hover:bg-navy/90 py-6 mt-4 text-white">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Secure Login'}
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <input type="text" placeholder="Full Legal Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-navy" />
                  <input type="email" placeholder="Official Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-navy" />
                  <input type="tel" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-navy" />
                  <input type="text" placeholder={selectedRole === 'lawyer' ? 'Bar Council License Number' : 'Judicial Identification Number'} value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-navy" />
                  <input type="password" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-navy" />
                  
                  <Button onClick={handleApply} disabled={loading} className="w-full bg-saffron-dark hover:bg-saffron text-white py-6 mt-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application to Higher Authorities'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
