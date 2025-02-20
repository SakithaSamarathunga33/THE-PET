import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiUser, FiLock, FiMail } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import NavBar from '../components/Navbar';

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Password validation
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
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login');
      } else {
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
      <div 
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          marginTop: '-64px'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-[2px]"></div>
        
        <div className="relative max-w-md w-full space-y-8 bg-white/90 p-8 rounded-xl shadow-2xl backdrop-blur-md">
          <div>
            <div className="flex justify-center">
              <MdPets className="h-12 w-12 text-[#4DB6AC]" />
            </div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
              Create an Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join our pet-loving community
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
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
                    className="appearance-none relative block w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043]"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

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
                    className="appearance-none relative block w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043]"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
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
                    className="appearance-none relative block w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043]"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    className="appearance-none relative block w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm transition-all duration-200 ease-in-out hover:border-[#FF7043]"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-[#4DB6AC] hover:text-[#FF7043] transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register; 