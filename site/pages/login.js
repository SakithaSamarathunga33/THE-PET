import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { MdPets } from 'react-icons/md';
import Link from 'next/link';
import NavBar from '../components/Navbar';
import { motion } from 'framer-motion';

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = router.query.token;
    const error = router.query.error;

    if (token) {
      localStorage.setItem('token', token);
      router.push('/');
    } else if (error) {
      setError('Google authentication failed. Please try again.');
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (formData.username === 'admin' && formData.password === 'admin') {
        console.log('Admin credentials detected');
      }

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: formData.username,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login response:', data);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.name || data.user.username);
        localStorage.setItem('email', data.user.email);
        localStorage.setItem('userType', data.user.userType);
        
        if (data.user.employeeId) {
          localStorage.setItem('employeeId', data.user.employeeId);
        }
        
        console.log('Login successful, user type:', data.user.userType);
        
        if (data.user.userType === 'admin' || formData.username === 'admin') {
          console.log('Redirecting to admin dashboard...');
          await router.push('/dashboard');
        } else if (data.user.userType === 'employee') {
          console.log('Redirecting to employee page...');
          await router.push('/employee');
        } else {
          console.log('Redirecting to home...');
          await router.push('/');
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/auth/google';
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative mt-16">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#98D2C0] via-[#4F959D] to-[#205781] opacity-20 animate-gradient"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#98D2C0] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4F959D] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#205781] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side - Image and Welcome Message */}
          <motion.div 
            className="hidden md:block w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2086&q=80"
                alt="Happy pets with their owner"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h2 className="text-3xl font-bold mb-4">Welcome to PetCare Portal</h2>
                <p className="text-lg">Your one-stop solution for pet care management</p>
              </div>
            </div>
          </motion.div>

          {/* Right side - Login Form */}
          <motion.div 
            className="w-full md:w-1/2 max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/90 p-6 rounded-xl shadow-xl backdrop-blur-md border border-white/20">
              <div>
                <div className="flex justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <MdPets className="h-12 w-12 text-[#4F959D]" />
                  </motion.div>
                </div>
                <h2 className="mt-3 text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#205781] to-[#4F959D]">
                  Sign In
                </h2>
                <p className="mt-1 text-center text-xs text-gray-600">
                  Welcome back! Please sign in to your account
                </p>
              </div>

              {error && (
                <motion.div 
                  className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg relative mt-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <p className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    {error}
                  </p>
                </motion.div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username or Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-[#4F959D] group-hover:text-[#205781] transition-colors duration-200" />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4F959D] focus:border-[#4F959D] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#205781] bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your username or email"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-[#4F959D] group-hover:text-[#205781] transition-colors duration-200" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4F959D] focus:border-[#4F959D] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#205781] bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full flex justify-center py-2 px-3 border border-transparent text-sm font-medium rounded-lg text-white ${
                      loading 
                        ? 'bg-[#4F959D]/70 cursor-not-allowed'
                        : 'bg-[#4F959D] hover:bg-[#205781] transform transition-all duration-300 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F959D] shadow-lg hover:shadow-xl'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </motion.button>
                </div>
              </form>

              <div className="mt-6">
                <div className="flex items-center justify-center space-x-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <span className="text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    Or continue with
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>

                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <motion.button
                    onClick={handleGoogleLogin}
                    className="group w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 hover:border-[#4F959D] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-[#4F959D]/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                    
                    <div className="relative flex items-center justify-center space-x-4">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm">
                        <FcGoogle className="w-4 h-4" />
                      </div>
                      <span>Continue with Google</span>
                      <motion.div 
                        className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -10 }}
                        animate={{ x: 0 }}
                      >
                        <svg className="w-5 h-5 text-[#4F959D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.button>
                </motion.div>

                <motion.div 
                  className="mt-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      New to our platform?
                    </p>
                    <Link 
                      href="/register" 
                      className="inline-flex items-center justify-center space-x-2 bg-[#4F959D] hover:bg-[#205781] text-white font-medium px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-sm"
                    >
                      <span>Create an account</span>
                      <motion.span
                        initial={{ x: 0 }}
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </motion.span>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-gradient {
          animation: gradient 15s ease infinite;
          background-size: 200% 200%;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
};

export default Login;