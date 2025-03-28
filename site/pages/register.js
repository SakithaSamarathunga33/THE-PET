import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiLock, FiMail, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { MdPets } from 'react-icons/md';
import Link from 'next/link';
import NavBar from '../components/Navbar';
import { motion } from 'framer-motion';

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          username: formData.username,
          password: formData.password
        })
      });

      if (response.ok) {
        router.push('/login?registered=true');
      } else {
        const data = await response.json();
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative mt-16">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4DB6AC] via-[#FF7043] to-[#4DB6AC] opacity-20 animate-gradient"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#4DB6AC] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF7043] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#4DB6AC] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
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
                src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                alt="Happy pets playing together"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h2 className="text-3xl font-bold mb-4">Join PetCare Portal</h2>
                <p className="text-lg">Create your account and start managing your pet care journey</p>
              </div>
            </div>
          </motion.div>

          {/* Right side - Registration Form */}
          <motion.div 
            className="w-full md:w-1/2 max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20">
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
                    <MdPets className="h-16 w-16 text-[#4DB6AC]" />
                  </motion.div>
                </div>
                <h2 className="mt-4 text-center text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#4DB6AC] to-[#FF7043]">
                  Create Account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Join our community of pet lovers
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

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-[#4DB6AC] group-hover:text-[#FF7043] transition-colors duration-200" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043] bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-[#4DB6AC] group-hover:text-[#FF7043] transition-colors duration-200" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043] bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-[#4DB6AC] group-hover:text-[#FF7043] transition-colors duration-200" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043] bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
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
                        className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043] bg-white/50 backdrop-blur-sm"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
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
                        className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043] bg-white/50 backdrop-blur-sm"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-[#4DB6AC] group-hover:text-[#FF7043] transition-colors duration-200" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043] bg-white/50 backdrop-blur-sm"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white ${
                      loading 
                        ? 'bg-[#4DB6AC]/70 cursor-not-allowed'
                        : 'bg-[#4DB6AC] hover:bg-[#45A49A] transform transition-all duration-300 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4DB6AC] shadow-lg hover:shadow-xl'
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
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Already have an account?
                  </p>
                  <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center space-x-2 bg-[#4DB6AC] hover:bg-[#45A49A] text-white font-medium px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <span>Sign in</span>
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

export default Register; 