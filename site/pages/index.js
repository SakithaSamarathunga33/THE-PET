import Link from 'next/link'
import MyHead from '../components/MyHead'
import { useState } from 'react'
import NavBar from '../components/Navbar'
import Image from 'next/image'
import { FaPaw } from 'react-icons/fa'
import { MdPets, MdHealthAndSafety, MdGroups } from 'react-icons/md'
import ChatBot from '../components/chat/ChatBot'
import { motion } from 'framer-motion'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

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
      <motion.section 
        className="relative h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1548767797-d8c844163c4c"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
          <motion.div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          ></motion.div>
        </div>
        
        <motion.div 
          className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-center mb-6"
            variants={fadeInUp}
          >
            Welcome to <motion.span 
              className="text-[#4F959D]"
              animate={{ 
                scale: [1, 1.1, 1],
                transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }
              }}
            >THE PET</motion.span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-center mb-8 text-[#F6F8D5]"
            variants={fadeInUp}
          >
            Your trusted partner in providing the best care for your furry friends
          </motion.p>
          <motion.div 
            className="flex gap-4"
            variants={fadeInUp}
          >
            <Link href="/our-pets" className="bg-[#205781] hover:bg-[#205781]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Our Pets
            </Link>
            <Link href="/services" className="bg-[#4F959D] hover:bg-[#4F959D]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Our Services
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-[#F6F8D5]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Choose <span className="text-[#4F959D]">THE PET</span>
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <MdPets className="w-8 h-8 text-white" />,
                title: "Expert Care",
                description: "Professional and loving care for all types of pets with experienced staff."
              },
              {
                icon: <MdHealthAndSafety className="w-8 h-8 text-white" />,
                title: "Health First",
                description: "Regular health check-ups and premium quality pet care services."
              },
              {
                icon: <MdGroups className="w-8 h-8 text-white" />,
                title: "Community",
                description: "Join our growing community of pet lovers and share experiences."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-[#F6F8D5] p-8 rounded-xl text-center"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="bg-[#205781] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="py-20 bg-[#98D2C0]/20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured <span className="text-[#205781]">Pets</span>
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
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
              <motion.div 
                key={index}
                className="bg-[#F6F8D5] rounded-xl overflow-hidden shadow-lg"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="relative h-64"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={pet.image}
                    alt={pet.name}
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <FaPaw className="text-[#4F959D] mr-2" />
                    </motion.div>
                    {pet.name}
                  </h3>
                  <p className="text-gray-600">{pet.type}</p>
                  <p className="text-gray-500 mt-2">{pet.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/our-pets" className="inline-flex items-center bg-[#4F959D] hover:bg-[#4F959D]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              View All Pets
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FaPaw className="ml-2" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="relative py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e"
            alt="CTA Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        </div>

        <motion.div 
          className="relative z-10 max-w-4xl mx-auto text-center px-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            Ready to Meet Your New Best Friend?
          </motion.h2>
          <motion.p 
            className="text-[#F6F8D5] text-xl mb-8"
            variants={fadeInUp}
          >
            Visit us today and discover the perfect companion for your family.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/contact" className="bg-[#205781] hover:bg-[#205781]/90 text-white px-8 py-3 rounded-lg inline-block transition-all duration-300 transform hover:scale-105">
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>
      {/* Add ChatBot */}
      <ChatBot />
    </>
  )
}
