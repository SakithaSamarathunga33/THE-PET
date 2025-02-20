import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from "react";
import { FiUser, FiLogOut } from 'react-icons/fi';

const NavBar = () => {
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
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <Link href="/" className="flex items-center">
                <img src="/images/favicon.ico" className="h-8 mr-3" alt="Company Logo" />
                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Template</span>
            </Link>
            <button onClick={toggleMobileMenu} data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
            </button>
            <div className={`${mobileMenuOpen ? "" : "hidden"} w-full md:block md:w-auto focus:outline-none`} id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                <li>
                <Link href="/" className="block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Home</Link>
                </li>
                <li>
                <Link href="/apply" className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Apply</Link>
                </li>
                <li>
                <Link href="/features" className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Features</Link>
                </li>
                <li>
                <Link href="#" className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Custom</Link>
                </li>
                <li>
                <Link href="#" className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Contact</Link>
                </li>
                {user ? (
                    <>
                        <li className="flex items-center">
                            <span className="block py-2 pl-3 pr-4 text-gray-900 md:p-0 dark:text-white">
                                <FiUser className="inline mr-2" />
                                {user.name}
                            </span>
                        </li>
                        {user.userType === 'admin' && (
                            <li>
                                <Link 
                                    href="/dashboard" 
                                    className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500"
                                >
                                    Admin Panel
                                </Link>
                            </li>
                        )}
                        <li>
                            <button
                                onClick={handleLogout}
                                className="flex items-center py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500"
                            >
                                <FiLogOut className="mr-2" />
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <li>
                        <Link 
                            href="/login"
                            className="flex items-center py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500"
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