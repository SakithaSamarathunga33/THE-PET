import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { FaPaw } from 'react-icons/fa'
import { MdPets } from 'react-icons/md'
import Link from 'next/link'
import { FiX } from 'react-icons/fi'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'

export default function OurPets() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)
  const [appointmentForm, setAppointmentForm] = useState({
    petName: '',
    ownerName: '',
    contactNumber: '',
    appointmentDate: '',
    reason: '',
    branch: '', // Add branch field
    status: 'Pending'
  })
  const [success, setSuccess] = useState(null)

  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)

  // Animation variants
  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    fetchPets()
    checkAuthStatus()
  }, [])

  const fetchPets = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/pets')
      if (!response.ok) {
        throw new Error('Failed to fetch pets')
      }
      const data = await response.json()
      setPets(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }

  const handleAppointmentClick = (pet) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please login to book an appointment')
      router.push('/login?redirect=/our-pets')
      return
    }

    setSelectedPet(pet)
    setAppointmentForm(prev => ({
      ...prev,
      petName: pet.name,
      reason: `Interested in adopting ${pet.name}`,
      ownerName: currentUser?.name || '',
      contactNumber: currentUser?.phoneNumber || '',
      branch: '' // Reset branch selection
    }))
    setShowAppointmentModal(true)
  }

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please login to book an appointment')
      router.push('/login?redirect=/our-pets')
      return
    }

    // Add branch validation
    if (!appointmentForm.branch) {
      setError('Please select a branch')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...appointmentForm,
          userId: currentUser._id
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to create appointment')
      
      setSuccess('Your appointment request has been sent. We will contact you soon!')
      setShowAppointmentModal(false)
      setAppointmentForm({
        petName: '',
        ownerName: '',
        contactNumber: '',
        appointmentDate: '',
        reason: '',
        branch: '', // Reset branch
        status: 'Pending'
      })
      
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4DB6AC]"></div>
      </div>
    )
  }

  return (
    <>
      <MyHead
        title="Our Pets - THE PET"
        description="Meet our adorable pets waiting for their forever homes"
        image="/images/white.png"
        url="https://thepet.com/our-pets"
      />
      <NavBar />

      {/* Hero Section */}
      <motion.section 
        className="relative py-20 bg-[#FFF3E0]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="max-w-7xl mx-auto px-4 text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MdPets className="w-16 h-16 mx-auto mb-6 text-[#FF7043]" />
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={fadeInUp}
          >
            Meet Our <span className="text-[#4DB6AC]">Wonderful Pets</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Each of our pets has a unique personality and is waiting for their perfect match. 
            Could you be the one they're looking for?
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Pets Grid Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {error ? (
            <motion.div 
              className="text-center text-red-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>{error}</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {pets.map((pet, index) => (
                <motion.div 
                  key={pet.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-lg"
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <motion.div 
                    className="relative h-64"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={pet.imageUrl || "https://images.unsplash.com/photo-1548767797-d8c844163c4c"}
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold flex items-center">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <FaPaw className="text-[#4DB6AC] mr-2" />
                        </motion.div>
                        {pet.name}
                      </h3>
                      <motion.span 
                        className="bg-[#FFF3E0] text-[#FF7043] px-3 py-1 rounded-full text-sm"
                        whileHover={{ scale: 1.1 }}
                      >
                        {pet.status}
                      </motion.span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-semibold">Breed:</span> {pet.breed}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Age:</span> {pet.age} years
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Gender:</span> {pet.gender}
                      </p>
                      <p className="text-gray-500 mt-4">
                        {pet.description}
                      </p>
                    </div>
                    <motion.div 
                      className="mt-6"
                      whileHover={{ scale: 1.02 }}
                    >
                      <button 
                        className="w-full bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                        onClick={() => handleAppointmentClick(pet)}
                      >
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <MdPets className="mr-2" />
                        </motion.div>
                        Book Appointment
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="bg-[#FFF3E0] py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div 
          className="max-w-4xl mx-auto text-center px-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold mb-6"
            variants={fadeInUp}
          >
            Can't Find What You're Looking For?
          </motion.h2>
          <motion.p 
            className="text-gray-600 mb-8"
            variants={fadeInUp}
          >
            New pets become available for adoption regularly. Contact us to learn more about our upcoming arrivals!
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/contact" className="bg-[#FF7043] hover:bg-[#FF7043]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {showAppointmentModal && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Book Appointment for {selectedPet?.name}
                </h3>
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    value={appointmentForm.ownerName}
                    onChange={(e) => setAppointmentForm({...appointmentForm, ownerName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    value={appointmentForm.contactNumber}
                    onChange={(e) => setAppointmentForm({...appointmentForm, contactNumber: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    value={appointmentForm.appointmentDate}
                    onChange={(e) => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    rows="3"
                    value={appointmentForm.reason}
                    onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Branch</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    value={appointmentForm.branch}
                    onChange={(e) => setAppointmentForm({...appointmentForm, branch: e.target.value})}
                  >
                    <option value="">Select a branch</option>
                    <option value="Colombo Branch">Colombo Branch</option>
                    <option value="Kandy Branch">Kandy Branch</option>
                    <option value="Galle Branch">Galle Branch</option>
                    <option value="Jaffna Branch">Jaffna Branch</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 rounded-md"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      {success && (
        <motion.div 
          className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
        >
          {success}
        </motion.div>
      )}
      {error && (
        <motion.div 
          className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
        >
          {error}
        </motion.div>
      )}
    </>
  )
}