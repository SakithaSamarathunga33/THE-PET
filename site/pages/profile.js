import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/Navbar';
import { FiUser, FiMail, FiEdit2, FiCalendar, FiClock, FiMapPin, FiPhoneCall } from 'react-icons/fi';
import Image from 'next/image';

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [appointmentError, setAppointmentError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchUserData();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserAppointments();
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/me', {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            setUser(userData);
            setFormData({
                username: userData.username || '',
                name: userData.name || '',
                email: userData.email || ''
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to load user data');
        }
    };

    const fetchUserAppointments = async () => {
        setLoadingAppointments(true);
        setAppointmentError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/appointments', {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }

            const allAppointments = await response.json();
            
            // Filter appointments for the current user
            const userAppointments = allAppointments.filter(apt => 
                apt.ownerName === user.name
            );
            
            // Sort by date (newest first)
            userAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setAppointments(userAppointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAppointmentError('Failed to load your appointments');
        } finally {
            setLoadingAppointments(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Confirmed': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:8080/api/auth/user/${user._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username,
                    name: formData.name,
                    email: formData.email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setUser(data);
            localStorage.setItem('username', data.name);
            setIsEditing(false);
            await fetchUserData(); // Refresh user data
            // After updating profile, refresh appointments in case the name changed
            await fetchUserAppointments();
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsEditing(false);
        setError('');
        if (user) {
            setFormData({
                username: user.username || '',
                name: user.name || '',
                email: user.email || ''
            });
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#205781]"></div>
            </div>
        );
    }

    return (
        <>
            <NavBar />
            <div 
                className="min-h-screen bg-cover bg-center bg-fixed pt-16"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1444212477490-ca407925329e?ixlib=rb-4.0.3")',
                }}
            >
                <div className="min-h-screen bg-gradient-to-br from-[#4F959D]/90 via-white/80 to-[#205781]/90 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
                            <p className="text-gray-600">Manage your pet care account details</p>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden mb-8">
                            <div className="md:flex">
                                {/* Profile Image Section */}
                                <div className="md:w-1/3 bg-gradient-to-br from-[#4F959D] to-[#205781] p-8 text-white">
                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg mb-4">
                                            <div className="w-full h-full rounded-full bg-[#4F959D] flex items-center justify-center">
                                                <FiUser className="w-16 h-16 text-white" />
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                                        <p className="text-[#F6F8D5] mb-4">Pet Lover</p>
                                        <div className="w-full max-w-xs bg-black/20 backdrop-blur-sm rounded-lg p-4 mt-4">
                                            <p className="text-sm text-center">
                                                "Taking care of pets is not just a responsibility, it's a privilege."
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Details Section */}
                                <div className="md:w-2/3 p-8 bg-white/50 backdrop-blur-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-semibold text-gray-900">Account Details</h3>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center px-4 py-2 bg-[#4F959D] text-white rounded-lg hover:bg-[#205781] transition-colors duration-200 shadow-md hover:shadow-lg"
                                        >
                                            <FiEdit2 className="mr-2" />
                                            Edit Profile
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <FiUser className="w-6 h-6 text-[#4F959D] mr-4" />
                                            <div>
                                                <p className="text-sm text-gray-500">Username</p>
                                                <p className="text-gray-900 font-medium">{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <FiUser className="w-6 h-6 text-[#4F959D] mr-4" />
                                            <div>
                                                <p className="text-sm text-gray-500">Full Name</p>
                                                <p className="text-gray-900 font-medium">{user.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <FiMail className="w-6 h-6 text-[#4F959D] mr-4" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="text-gray-900 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-200">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Account Status</h4>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 bg-green-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                                                <p className="text-sm text-green-600 font-medium">Active Member</p>
                                                <p className="text-xs text-green-500">Since {new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex-1 bg-blue-50/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                                                <p className="text-sm text-blue-600 font-medium">Pet Lover</p>
                                                <p className="text-xs text-blue-500">Verified Account</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* My Appointments Section */}
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                        <FiCalendar className="mr-2 text-[#4F959D]" />
                                        My Appointments
                                    </h3>
                                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                        {appointments.length} Total
                                    </span>
                                </div>

                                {appointmentError && (
                                    <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                                        <p>{appointmentError}</p>
                                    </div>
                                )}

                                {loadingAppointments ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4F959D]"></div>
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">You have no appointments yet.</p>
                                        <button 
                                            onClick={() => router.push('/our-pets')}
                                            className="mt-4 px-4 py-2 bg-[#4F959D] text-white rounded-lg hover:bg-[#205781] transition-colors"
                                        >
                                            Book an Appointment
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {appointments.map(appointment => (
                                            <div 
                                                key={appointment._id} 
                                                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                                            >
                                                <div className="p-6">
                                                    <div className="flex flex-col md:flex-row justify-between mb-4">
                                                        <div className="flex items-center mb-2 md:mb-0">
                                                            <div className="w-12 h-12 rounded-full bg-[#4F959D]/10 flex items-center justify-center mr-4">
                                                                <FiCalendar className="w-6 h-6 text-[#4F959D]" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-medium text-gray-900">{appointment.petName}</h4>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                                                                        weekday: 'long', 
                                                                        year: 'numeric', 
                                                                        month: 'long', 
                                                                        day: 'numeric' 
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                                {appointment.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div className="flex items-center">
                                                            <FiClock className="w-5 h-5 text-gray-400 mr-2" />
                                                            <span className="text-sm text-gray-600">
                                                                {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FiMapPin className="w-5 h-5 text-gray-400 mr-2" />
                                                            <span className="text-sm text-gray-600">{appointment.branch}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FiPhoneCall className="w-5 h-5 text-gray-400 mr-2" />
                                                            <span className="text-sm text-gray-600">{appointment.contactNumber}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-700">{appointment.reason}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-medium text-gray-900">Edit Profile</h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                                <p className="font-medium">Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F959D] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F959D] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F959D] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 bg-[#4F959D] text-white rounded-lg hover:bg-[#205781] font-medium flex items-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;
