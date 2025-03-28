import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { MdPets, MdHealthAndSafety, MdGroups, MdSpa, MdHome, MdLocalHotel } from 'react-icons/md'
import { FaPaw, FaHeart } from 'react-icons/fa'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Services() {
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

  const services = [
    {
      icon: <MdHealthAndSafety className="w-8 h-8" />,
      title: "Veterinary Care",
      description: "Professional medical care for your pets with experienced veterinarians",
      features: ["Regular Check-ups", "Vaccinations", "Emergency Care", "Surgery Services"],
      image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97"
    },
    {
      icon: <MdSpa className="w-8 h-8" />,
      title: "Grooming Services",
      description: "Keep your pet clean and stylish with our professional grooming services",
      features: ["Bath & Brush", "Hair Trimming", "Nail Clipping", "Ear Cleaning"],
      image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36"
    },
    {
      icon: <MdLocalHotel className="w-8 h-8" />,
      title: "Pet Boarding",
      description: "Safe and comfortable accommodation for your pets while you're away",
      features: ["24/7 Supervision", "Comfortable Beds", "Regular Meals", "Daily Exercise"],
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1"
    }
  ]

  const additionalServices = [
    {
      icon: <MdHome className="w-6 h-6" />,
      title: "Pet Adoption",
      description: "Find your perfect companion from our selection of lovely pets"
    },
    {
      icon: <MdGroups className="w-6 h-6" />,
      title: "Training Classes",
      description: "Professional training sessions for better pet behavior"
    },
    {
      icon: <FaHeart className="w-6 h-6" />,
      title: "Pet Counseling",
      description: "Expert advice on pet care, nutrition, and behavior"
    }
  ]

  return (
    <>
      <MyHead
        title="Our Services - THE PET"
        description="Professional pet care services for your beloved companions"
        image="/images/white.png"
        url="https://thepet.com/services"
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
            Our <span className="text-[#4F959D]">Premium Services</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Providing the best care for your beloved pets with our comprehensive range of professional services
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Main Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="space-y-20"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div 
                key={service.title} 
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
                variants={cardVariants}
              >
                <motion.div 
                  className="w-full md:w-1/2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-[400px] rounded-xl overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                <div className="w-full md:w-1/2 space-y-6">
                  <motion.div 
                    className="bg-[#205781] w-16 h-16 rounded-full flex items-center justify-center text-white mb-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {service.icon}
                  </motion.div>
                  <motion.h2 
                    className="text-3xl font-bold"
                    variants={fadeInUp}
                  >
                    {service.title}
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 text-lg"
                    variants={fadeInUp}
                  >
                    {service.description}
                  </motion.p>
                  <motion.ul 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    variants={staggerContainer}
                  >
                    {service.features.map((feature) => (
                      <motion.li 
                        key={feature} 
                        className="flex items-center text-gray-700"
                        variants={fadeInUp}
                      >
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <FaPaw className="text-[#4F959D] mr-2" />
                        </motion.div>
                        {feature}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link 
                      href="/contact" 
                      className="bg-[#4F959D] hover:bg-[#4F959D]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 inline-block"
                    >
                      Learn More
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Additional Services Section */}
      <motion.section 
        className="py-20 bg-[#F6F8D5]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-16"
            variants={fadeInUp}
          >
            Additional Services
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {additionalServices.map((service) => (
              <motion.div 
                key={service.title} 
                className="bg-[#F6F8D5] p-8 rounded-xl shadow-lg"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="bg-[#205781] w-12 h-12 rounded-full flex items-center justify-center text-white mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {service.icon}
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-4"
                  variants={fadeInUp}
                >
                  {service.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-600"
                  variants={fadeInUp}
                >
                  {service.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-[#4F959D] to-[#205781]"
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
            className="text-3xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            Ready to Give Your Pet the Best Care?
          </motion.h2>
          <motion.p 
            className="text-white/90 mb-8 text-lg"
            variants={fadeInUp}
          >
            Contact us today to schedule an appointment or learn more about our services
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/contact" className="bg-white text-[#4F959D] px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#F6F8D5]">
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>
    </>
  )
} 