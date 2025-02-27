import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiUser, FiLogOut, FiMenu, FiX, FiHome, FiHeart, FiGrid, FiAlertCircle, FiMessageCircle, FiInfo } from 'react-icons/fi';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const NavBar = ({ username }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    checkAuthStatus();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router.asPath]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('username', userData.name);
          localStorage.setItem('email', userData.email);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (router.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { path: '/', label: 'Home', icon: <FiHome className="w-5 h-5" /> },
    { path: '/our-pets', label: 'Our Pets', icon: <FiHeart className="w-5 h-5" /> },
    { path: '/services', label: 'Services', icon: <FiGrid className="w-5 h-5" /> },
    { path: '/emergency', label: 'Emergency', icon: <FiAlertCircle className="w-5 h-5" /> },
    { path: '/forum', label: 'Forum', icon: <FiMessageCircle className="w-5 h-5" /> },
    { path: '/about', label: 'About Us', icon: <FiInfo className="w-5 h-5" /> },
  ];

  return (
    <motion.nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-white'
      }`}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Image
                  src="/images/white2.png"
                  alt="THE PET Logo"
                  width={80}
                  height={50}
                  className="h-10 w-auto"
                  priority
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#4DB6AC]/10"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.span 
                className="ml-3 text-2xl font-bold bg-gradient-to-r from-[#4DB6AC] to-[#FF7043] bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                THE PET
              </motion.span>
            </Link>
          </div>

          {/* Center: All Nav Items */}
          <div className="hidden md:flex items-center justify-center flex-1 px-16">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group relative px-3 py-2 rounded-lg transition-all duration-300 ${
                    router.pathname === item.path
                      ? 'text-[#4DB6AC]'
                      : 'text-gray-600 hover:text-[#4DB6AC]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <div 
                    className={`absolute bottom-0 left-0 h-0.5 w-full transition-all duration-300 ${
                      router.pathname === item.path ? 'bg-[#4DB6AC]' : 'bg-transparent'
                    }`}
                  />
                  <div className="absolute inset-0 bg-[#4DB6AC]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  initial={false}
                >
                  <Link
                    href="/profile"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      router.pathname === '/profile'
                        ? 'bg-[#4DB6AC] text-white'
                        : 'text-gray-600 hover:bg-[#4DB6AC]/10 hover:text-[#4DB6AC]'
                    } transition-all duration-300`}
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="max-w-[100px] truncate font-medium">
                      {user.name || ''}
                    </span>
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={false}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                initial={false}
              >
                <Link
                  href="/login"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    router.pathname === '/login'
                      ? 'bg-[#4DB6AC] text-white'
                      : 'text-gray-600 hover:bg-[#4DB6AC]/10 hover:text-[#4DB6AC]'
                  } transition-all duration-300`}
                >
                  <FiUser className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={false}
              onClick={toggleMobileMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-[#4DB6AC]/10 hover:text-[#4DB6AC] transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white border-t"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navItems.map((item) => (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      router.pathname === item.path
                        ? 'bg-[#4DB6AC]/10 text-[#4DB6AC]'
                        : 'text-gray-600 hover:bg-[#4DB6AC]/10 hover:text-[#4DB6AC]'
                    } transition-all duration-300`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;