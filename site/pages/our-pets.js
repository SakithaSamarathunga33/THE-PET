import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { FaPaw, FaDog, FaCat, FaFish, FaDove, FaHorse } from 'react-icons/fa'
import { MdPets, MdFilterList, MdSort } from 'react-icons/md'
import { FiX, FiFilter, FiDollarSign, FiChevronDown } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'

export default function OurPets() {
  const [pets, setPets] = useState([])
  const [filteredPets, setFilteredPets] = useState([])
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
    branch: '',
    status: 'Pending'
  })
  const [success, setSuccess] = useState(null)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    gender: '',
    minPrice: '',
    maxPrice: '',
    sort: ''
  })

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

  useEffect(() => {
    // Apply filters when filters state changes or pets data changes
    if (pets.length > 0) {
      applyFilters()
    }
  }, [filters, pets])

  const fetchPets = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/pets')
      if (!response.ok) {
        throw new Error('Failed to fetch pets')
      }
      const data = await response.json()
      setPets(data)
      setFilteredPets(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const fetchPetsWithFilters = async () => {
    try {
      setLoading(true)
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.gender) queryParams.append('gender', filters.gender);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sort) queryParams.append('sort', filters.sort);
      
      const url = `http://localhost:8080/api/pets?${queryParams.toString()}`;
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch pets')
      }
      const data = await response.json()
      setPets(data)
      setFilteredPets(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const applyFilters = () => {
    // Filter pets locally (as an alternative to server-side filtering)
    let result = [...pets];
    
    if (filters.type) {
      result = result.filter(pet => pet.type === filters.type);
    }
    
    if (filters.gender) {
      result = result.filter(pet => pet.gender === filters.gender);
    }
    
    if (filters.minPrice) {
      result = result.filter(pet => pet.price >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      result = result.filter(pet => pet.price <= Number(filters.maxPrice));
    }
    
    // Apply sorting
    if (filters.sort === 'priceLow') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'priceHigh') {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredPets(result);
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const resetFilters = () => {
    setFilters({
      type: '',
      gender: '',
      minPrice: '',
      maxPrice: '',
      sort: ''
    });
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
      petName: pet.breed,
      reason: `Interested in ${pet.type}: ${pet.breed} (Rs ${pet.price})`,
      ownerName: currentUser?.name || '',
      contactNumber: currentUser?.phoneNumber || '',
      branch: ''
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
      // Prepare appointment data, omitting ownerName as it will be set by the server
      const appointmentData = {
        petName: appointmentForm.petName,
        contactNumber: appointmentForm.contactNumber,
        appointmentDate: appointmentForm.appointmentDate,
        reason: appointmentForm.reason,
        branch: appointmentForm.branch,
        status: 'Pending'
      };

      const response = await fetch('http://localhost:8080/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
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
        branch: '',
        status: 'Pending'
      })
      
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    }
  }

  // Get Pet icon based on type
  const getPetIcon = (type) => {
    switch (type) {
      case 'Dog': return <FaDog className="text-[#4F959D] mr-2" />;
      case 'Cat': return <FaCat className="text-[#4F959D] mr-2" />;
      case 'Fish': return <FaFish className="text-[#4F959D] mr-2" />;
      case 'Bird': return <FaDove className="text-[#4F959D] mr-2" />;
      case 'Rabbit': return <FaHorse className="text-[#4F959D] mr-2" />;
      default: return <FaPaw className="text-[#4F959D] mr-2" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4F959D]"></div>
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
        className="relative py-20 bg-[#F6F8D5]"
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
            <MdPets className="w-16 h-16 mx-auto mb-6 text-[#205781]" />
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={fadeInUp}
          >
            Meet Our <span className="text-[#4F959D]">Wonderful Pets</span>
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

      {/* Filter Section */}
      <div className="bg-white py-6 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center space-x-2 bg-[#4F959D] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#4F959D]/90 transition-colors duration-200"
            >
              <FiFilter />
              <span>Filter Pets</span>
              <FiChevronDown className={`transform transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-gray-700">Sort by:</span>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F959D]"
              >
                <option value="">Newest</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filter Menu */}
          {showFilterMenu && (
            <motion.div 
              className="mt-4 bg-gray-50 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4F959D]"
                >
                  <option value="">All Types</option>
                  <option value="Dog">Dogs</option>
                  <option value="Cat">Cats</option>
                  <option value="Bird">Birds</option>
                  <option value="Fish">Fish</option>
                  <option value="Rabbit">Rabbits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4F959D]"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Min Price (₹)</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min Price"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4F959D]"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Price (₹)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max Price"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4F959D]"
                  min="0"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

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
          ) : filteredPets.length === 0 ? (
            <div className="text-center py-10">
              <MdPets className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium text-gray-600">No pets match your filters</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or browse all our available pets.</p>
              <button 
                onClick={resetFilters}
                className="mt-4 bg-[#4F959D] text-white px-6 py-2 rounded-md hover:bg-[#4F959D]/90 transition-colors duration-200"
              >
                Show All Pets
              </button>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredPets.map((pet, index) => (
                <motion.div 
                  key={pet._id} 
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
                      alt={pet.breed}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-[#205781] text-white px-3 py-1 rounded-full font-bold shadow-lg">
                      Rs {pet.price}
                    </div>
                  </motion.div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold flex items-center">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {getPetIcon(pet.type)}
                        </motion.div>
                        {pet.breed}
                      </h3>
                      <motion.span 
                        className={`px-3 py-1 rounded-full text-sm ${
                          pet.status === 'Available' ? 'bg-green-100 text-green-800' : 
                          pet.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {pet.status}
                      </motion.span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-semibold">Type:</span> {pet.type}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Age:</span> {pet.age} years
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Gender:</span> {pet.gender}
                      </p>
                      <p className="text-gray-500 mt-4 line-clamp-3">
                        {pet.description || `A wonderful ${pet.breed} looking for a loving home.`}
                      </p>
                    </div>
                    <motion.div 
                      className="mt-6"
                      whileHover={{ scale: 1.02 }}
                    >
                      <button 
                        className="w-full bg-[#4F959D] hover:bg-[#4F959D]/90 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
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
        className="bg-[#F6F8D5] py-20"
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
            New pets become available for sale regularly. Contact us to learn more about our upcoming arrivals!
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/contact" className="bg-[#205781] hover:bg-[#205781]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
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
                  Book Appointment for {selectedPet?.breed}
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F959D] focus:ring-[#4F959D]"
                    value={appointmentForm.ownerName}
                    onChange={(e) => setAppointmentForm({...appointmentForm, ownerName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F959D] focus:ring-[#4F959D]"
                    value={appointmentForm.contactNumber}
                    onChange={(e) => setAppointmentForm({...appointmentForm, contactNumber: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F959D] focus:ring-[#4F959D]"
                    value={appointmentForm.appointmentDate}
                    onChange={(e) => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F959D] focus:ring-[#4F959D]"
                    rows="3"
                    value={appointmentForm.reason}
                    onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Branch</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4F959D] focus:ring-[#4F959D]"
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
                    className="px-4 py-2 text-sm font-medium text-white bg-[#4F959D] hover:bg-[#4F959D]/90 rounded-md"
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