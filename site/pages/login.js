import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { MdPets } from 'react-icons/md';
import Link from 'next/link';
import NavBar from '../components/Navbar';
import { motion } from 'framer-motion'; // Import framer-motion for animations

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',  // This will handle both email and username
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

    // Validate form data
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Check for admin credentials
      if ((formData.username === 'admin' || formData.username === 'admin@gmail.com') && formData.password === 'admin123') {
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
        localStorage.setItem('token', data.token);
        // Fetch user data immediately after login
        const userResponse = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('username', userData.name);
          localStorage.setItem('email', userData.email);
          localStorage.setItem('userType', userData.userType);
        }
        console.log('Login successful, user type:', data.user.userType);
        
        if (data.user.userType === 'admin' || 
            formData.username === 'admin' || 
            formData.username === 'admin@gmail.com') {
          console.log('Redirecting to admin dashboard...');
          await router.push('/dashboard');
        } else {
          console.log('Redirecting to home...');
          await router.push('/');
        }
      } else {
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

  const isBrowser = typeof window !== 'undefined';

  return (
    <>
      <NavBar />
      <motion.div 
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative mt-16"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-[2px]"></div>
        
        <motion.div 
          className="relative max-w-md w-full space-y-8 bg-white/90 p-8 rounded-xl shadow-2xl backdrop-blur-md"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div>
            <div className="flex justify-center">
              <MdPets className="h-12 w-12 text-[#4DB6AC] animate-bounce" />
            </div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
              PetCare Portal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Providing the best care for your furry friends
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg relative">
              <p className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username or Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-[#4DB6AC] group-hover:text-[#FF7043] transition-colors duration-200" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043]"
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
                    <FiLock className="text-[#4DB6AC] group-hover:text-[#FF7043] transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none relative block w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043]"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  loading 
                    ? 'bg-[#4DB6AC]/70 cursor-not-allowed'
                    : 'bg-[#4DB6AC] hover:bg-[#FF7043]'
                } transform transition-all duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4DB6AC]`}
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
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-sm text-gray-500 bg-white/90 px-4 py-1 rounded-full shadow-sm border border-gray-100">
                Social Login
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <button
                onClick={handleGoogleLogin}
                className="group w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border border-gray-200 hover:border-[#4DB6AC] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                {/* Background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4DB6AC]/10 to-[#FF7043]/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                
                <div className="relative flex items-center justify-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                    <FcGoogle className="w-5 h-5" />
                  </div>
                  <span>Continue with Google</span>
                  <motion.div 
                    className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    animate={{ x: 0 }}
                  >
                    <svg className="w-5 h-5 text-[#4DB6AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.div>
                </div>
              </button>
            </motion.div>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  New to our platform?
                </p>
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#4DB6AC] to-[#FF7043] text-white font-medium px-6 py-2 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                >
                  <span>Create an account</span>
                  <motion.span
                    initial={{ x: 0 }}
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.span>
                </Link>
              </div>
            </motion.div>

            {/* Add subtle decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#4DB6AC]/20 to-[#FF7043]/20 rounded-full blur-xl"></div>
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-[#FF7043]/20 to-[#4DB6AC]/20 rounded-full blur-xl"></div>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
};

export default Login;