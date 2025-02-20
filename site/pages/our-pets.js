import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { FaPaw } from 'react-icons/fa'
import { MdPets } from 'react-icons/md'
import Link from 'next/link'

export default function OurPets() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPets()
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
      <section className="relative py-20 bg-[#FFF3E0]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <MdPets className="w-16 h-16 mx-auto mb-6 text-[#FF7043]" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Meet Our <span className="text-[#4DB6AC]">Wonderful Pets</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Each of our pets has a unique personality and is waiting for their perfect match. 
            Could you be the one they're looking for?
          </p>
        </div>
      </section>

      {/* Pets Grid Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {error ? (
            <div className="text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pets.map((pet) => (
                <div 
                  key={pet.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105"
                >
                  <div className="relative h-64">
                    <Image
                      src={pet.imageUrl || "https://images.unsplash.com/photo-1548767797-d8c844163c4c"} // fallback image
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold flex items-center">
                        <FaPaw className="text-[#4DB6AC] mr-2" />
                        {pet.name}
                      </h3>
                      <span className="bg-[#FFF3E0] text-[#FF7043] px-3 py-1 rounded-full text-sm">
                        {pet.status}
                      </span>
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
                    <div className="mt-6">
                      <button 
                        className="w-full bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                        onClick={() => {/* Add adoption/enquiry logic */}}
                      >
                        <MdPets className="mr-2" />
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#FFF3E0] py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-600 mb-8">
            New pets become available for adoption regularly. Contact us to learn more about our upcoming arrivals!
          </p>
          <Link href="/contact" className="bg-[#FF7043] hover:bg-[#FF7043]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
} 