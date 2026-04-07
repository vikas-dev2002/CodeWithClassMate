import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, Code, Eye, EyeOff, Shield, User } from 'lucide-react';
import { API_URL } from '../config/api';

const RoleRegister: React.FC = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'organiser' | 'admin'>('user');
  const [college, setCollege] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [colleges, setColleges] = useState<Array<{ _id: string; name: string; city?: string }>>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const response = await fetch(`${API_URL}/colleges`);
        const data = await response.json();
        if (Array.isArray(data)) setColleges(data);
      } catch (loadError) {
        console.error('Error loading colleges:', loadError);
      }
    };
    loadColleges();
  }, []);

  const inputClass =
    'w-full px-4 py-3 bg-white/70 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (role === 'admin') {
      setError('Admin accounts are created by an existing admin. Please choose Student or Organiser.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      return;
    }
    if (!college) {
      setError('Please select your college');
      return;
    }
    if (role === 'user' && (!rollNo.trim() || !branch || !year)) {
      setError('Student signup requires roll number, branch, and year');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          college,
          rollNo: role === 'user' ? rollNo : undefined,
          branch: role === 'user' ? branch : undefined,
          year: role === 'user' ? Number(year) : undefined,
          profile: {
            firstName,
            lastName,
            college: colleges.find((item) => item._id === college)?.name || '',
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        alert('Account created successfully! You can now login.');
        window.location.href = '/login';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (submitError) {
      console.error('Registration error:', submitError);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-900/20">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-4 shadow-lg">
                <Code className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
              Join EvenEase
            </h2>
            <p className="mt-2 text-slate-300">
              Create your event management account
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center space-x-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Register as</label>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => setRole('user')} className={`flex items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium ${role === 'user' ? 'border-blue-500 bg-blue-500/20 text-blue-200' : 'border-white/15 bg-white/5 text-slate-200'}`}>
                  <User className="mr-2 h-4 w-4" />
                  Student
                </button>
                <button type="button" onClick={() => setRole('organiser')} className={`flex items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium ${role === 'organiser' ? 'border-blue-500 bg-blue-500/20 text-blue-200' : 'border-white/15 bg-white/5 text-slate-200'}`}>
                  <Shield className="mr-2 h-4 w-4" />
                  Organiser
                </button>
                <button type="button" onClick={() => setRole('admin')} className={`flex items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium ${role === 'admin' ? 'border-red-500 bg-red-500/20 text-red-200' : 'border-white/15 bg-white/5 text-slate-200'}`}>
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </button>
              </div>
              {role === 'admin' && (
                <p className="mt-2 text-xs text-amber-300">
                  Admin self-signup is disabled. Admin accounts should be created from the admin panel.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input className={inputClass} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <input className={inputClass} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              <input className={inputClass} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input type="email" className={inputClass} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select className={`${inputClass} pl-10`} value={college} onChange={(e) => setCollege(e.target.value)} required>
                <option value="">Select college</option>
                {colleges.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}{item.city ? ` - ${item.city}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {role === 'user' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <input className={inputClass} placeholder="Roll number" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
                <select className={inputClass} value={branch} onChange={(e) => setBranch(e.target.value)} required>
                  <option value="">Select branch</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                  <option value="IT">IT</option>
                  <option value="AIML">AIML</option>
                  <option value="Other">Other</option>
                </select>
                <select className={inputClass} value={year} onChange={(e) => setYear(e.target.value)} required>
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            )}

            {role === 'organiser' && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
                Organiser signup keeps inputs minimal: name, username, email, password, and college selection.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className={`${inputClass} pr-12`} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} className={`${inputClass} pr-12`} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 text-slate-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <span className="text-slate-300">Already have an account? </span>
              <button type="button" className="font-semibold text-blue-300 transition-colors duration-200 hover:text-blue-200" onClick={() => window.location.href = '/login'}>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleRegister;
