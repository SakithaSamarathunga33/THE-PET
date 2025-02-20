import { useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthCallback = () => {
    const router = useRouter();

    useEffect(() => {
        const { token } = router.query;
        
        if (token) {
            // Store the token
            localStorage.setItem('token', token);
            
            // Fetch user data
            fetch('http://localhost:8080/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                return response.json();
            })
            .then(userData => {
                if (userData.userType === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                localStorage.removeItem('token');
                router.push('/login?error=fetch_failed');
            });
        } else if (router.query.error) {
            router.push('/login?error=' + router.query.error);
        }
    }, [router.query]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DB6AC] mx-auto"></div>
            </div>
        </div>
    );
};

export default AuthCallback; 