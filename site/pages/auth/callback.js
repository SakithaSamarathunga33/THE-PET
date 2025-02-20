import { useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthCallback = () => {
    const router = useRouter();

    useEffect(() => {
        const { token } = router.query;
        
        if (token) {
            localStorage.setItem('token', token);
            
            fetch('http://localhost:8080/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(userData => {
                if (userData.userType === 'admin') {
                    router.push('/admin/dashboard'); // Updated redirect path for admin
                } else {
                    router.push('/');
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                router.push('/login');
            });
        }
    }, [router.query]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            </div>
        </div>
    );
};

export default AuthCallback; 