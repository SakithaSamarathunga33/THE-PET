import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from "react";
import { FiUser, FiLogOut } from 'react-icons/fi';
import Image from 'next/image';

const NavBar = ({ username }) => {
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        setMobileMenuOpen(false);
        checkAuthStatus();
    }, [router.asPath]);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('http://localhost:8080/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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

    return (
    <>    
        <nav className="bg-white shadow-md relative z-50">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link href="/" className="flex items-center flex-shrink-0">
                    <Image 
                        src="/images/white2.png" 
                        alt="THE PET Logo" 
                        width={80} 
                        height={50}
                        className="h-10"
                    />
                    <span className="self-center text-2xl font-semibold ml-3 text-gray-800">THE PET</span>
                </Link>
                
                <div className="flex items-center md:order-2">
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/profile" 
                                className={`flex items-center py-2 px-3 rounded transition-colors duration-200 ${
                                    router.pathname === "/profile"
                                    ? "text-[#FF7043] font-semibold"
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                <FiUser className="mr-2" />
                                <span className="max-w-[100px] truncate">
                                    {user.name}
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center whitespace-nowrap py-2 px-3 text-gray-700 rounded hover:text-[#4DB6AC] transition-colors duration-200"
                            >
                                <FiLogOut className="mr-2" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className={`flex items-center py-2 px-3 rounded transition-colors duration-200 ${
                                router.pathname === "/login"
                                ? "text-[#FF7043] font-semibold"
                                : "text-gray-700 hover:text-[#4DB6AC]"
                            }`}
                        >
                            <FiUser className="mr-2" />
                            Login
                        </Link>
                    )}
                    <button 
                        onClick={toggleMobileMenu} 
                        className="inline-flex items-center p-2 ml-3 text-sm rounded-lg md:hidden hover:bg-[#FFF3E0] focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] text-gray-700" 
                        aria-controls="navbar-default" 
                        aria-expanded="false"
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>

                <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 md:flex-row md:space-x-8 md:mt-0 md:border-0">
                        <li>
                            <Link 
                                href="/" 
                                className={`block py-2 px-3 transition-colors duration-200 ${
                                    router.pathname === "/" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/our-pets" 
                                className={`block py-2 px-3 transition-colors duration-200 ${
                                    router.pathname === "/our-pets" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                Our Pets
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/services" 
                                className={`block py-2 px-3 transition-colors duration-200 ${
                                    router.pathname === "/services" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                Services
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/emergency" 
                                className={`block py-2 px-3 transition-colors duration-200 ${
                                    router.pathname === "/emergency" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-red-600 hover:text-red-700"
                                }`}
                            >
                                Emergency
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/forum" 
                                className={`block py-2 px-3 transition-colors duration-200 ${
                                    router.pathname === "/forum" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                Forum
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/about" 
                                className={`block py-2 px-3 transition-colors duration-200 ${
                                    router.pathname === "/about" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                About Us
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Mobile menu */}
                <div className={`${mobileMenuOpen ? "block" : "hidden"} w-full md:hidden mt-4`}>
                    <ul className="font-medium flex flex-col p-4 border border-gray-100 rounded-lg bg-white">
                        <li>
                            <Link 
                                href="/" 
                                className={`block py-2 px-3 rounded transition-colors duration-200 ${
                                    router.pathname === "/" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/our-pets" 
                                className={`block py-2 px-3 rounded transition-colors duration-200 ${
                                    router.pathname === "/our-pets" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                Our Pets
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/services" 
                                className={`block py-2 px-3 rounded transition-colors duration-200 ${
                                    router.pathname === "/services" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                Services
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/emergency" 
                                className={`block py-2 px-3 rounded transition-colors duration-200 ${
                                    router.pathname === "/emergency" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-red-600 hover:text-red-700"
                                }`}
                            >
                                Emergency
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/forum" 
                                className={`block py-2 px-3 rounded transition-colors duration-200 ${
                                    router.pathname === "/forum" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                Forum
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/about" 
                                className={`block py-2 px-3 rounded transition-colors duration-200 ${
                                    router.pathname === "/about" 
                                    ? "text-[#FF7043] font-semibold" 
                                    : "text-gray-700 hover:text-[#4DB6AC]"
                                }`}
                            >
                                About Us
                            </Link>
                        </li>
                        {user ? (
                            <li>
                                <Link 
                                    href="/profile" 
                                    className={`flex items-center py-2 px-3 rounded transition-colors duration-200 ${
                                        router.pathname === "/profile"
                                        ? "text-[#FF7043] font-semibold"
                                        : "text-gray-700 hover:text-[#4DB6AC]"
                                    }`}
                                >
                                    <FiUser className="mr-2" />
                                    <span className="max-w-[150px] truncate">
                                        {user.name}
                                    </span>
                                </Link>
                            </li>
                        ) : (
                            <li>
                                <Link
                                    href="/login"
                                    className={`flex items-center py-2 px-3 rounded transition-colors duration-200 ${
                                        router.pathname === "/login"
                                        ? "text-[#FF7043] font-semibold"
                                        : "text-gray-700 hover:text-[#4DB6AC]"
                                    }`}
                                >
                                    <FiUser className="mr-2" />
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    </>
    )
}

export default NavBar