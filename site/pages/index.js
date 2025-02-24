import Link from 'next/link'
import MyHead from '../components/MyHead'
import { useState } from 'react'
import NavBar from '../components/Navbar'
import Image from 'next/image'
import { FaPaw } from 'react-icons/fa'
import { MdPets, MdHealthAndSafety, MdGroups } from 'react-icons/md'
import ChatBot from '../components/chat/ChatBot'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <MyHead
        title="THE PET - Your Trusted Pet Care Partner"
        description="Welcome to THE PET, where we provide the best care for your furry friends"
        image="/images/white.png"
        url="https://thepet.com"
      />
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1548767797-d8c844163c4c"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
            Welcome to <span className="text-[#4DB6AC]">THE PET</span>
          </h1>
          <p className="text-xl md:text-2xl text-center mb-8 text-[#FFF3E0]">
            Your trusted partner in providing the best care for your furry friends
          </p>
          <div className="flex gap-4">
            <Link href="/our-pets" className="bg-[#FF7043] hover:bg-[#FF7043]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Our Pets
            </Link>
            <Link href="/services" className="bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose <span className="text-[#4DB6AC]">THE PET</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FFF3E0] p-8 rounded-xl text-center transform transition-all duration-300 hover:scale-105">
              <div className="bg-[#FF7043] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdPets className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Care</h3>
              <p className="text-gray-600">Professional and loving care for all types of pets with experienced staff.</p>
            </div>

            <div className="bg-[#FFF3E0] p-8 rounded-xl text-center transform transition-all duration-300 hover:scale-105">
              <div className="bg-[#FF7043] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdHealthAndSafety className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Health First</h3>
              <p className="text-gray-600">Regular health check-ups and premium quality pet care services.</p>
            </div>

            <div className="bg-[#FFF3E0] p-8 rounded-xl text-center transform transition-all duration-300 hover:scale-105">
              <div className="bg-[#FF7043] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdGroups className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-gray-600">Join our growing community of pet lovers and share experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Featured <span className="text-[#FF7043]">Pets</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
                name: "Max",
                type: "Dog",
                description: "Friendly Golden Retriever"
              },
              {
                image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
                name: "Luna",
                type: "Cat",
                description: "Playful Siamese"
              },
              {
                image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c",
                name: "Rocky",
                type: "Dog",
                description: "Energetic Husky"
              }
            ].map((pet, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105">
                <div className="relative h-64">
                  <Image
                    src={pet.image}
                    alt={pet.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <FaPaw className="text-[#4DB6AC] mr-2" />
                    {pet.name}
                  </h3>
                  <p className="text-gray-600">{pet.type}</p>
                  <p className="text-gray-500 mt-2">{pet.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/our-pets" className="inline-flex items-center bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              View All Pets
              <FaPaw className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e"
            alt="CTA Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Meet Your New Best Friend?</h2>
          <p className="text-[#FFF3E0] text-xl mb-8">Visit us today and discover the perfect companion for your family.</p>
          <Link href="/contact" className="bg-[#FF7043] hover:bg-[#FF7043]/90 text-white px-8 py-3 rounded-lg inline-block transition-all duration-300 transform hover:scale-105">
            Contact Us
          </Link>
        </div>
      </section>
      {/* Add ChatBot */}
      <ChatBot />
    </>
  )
}
