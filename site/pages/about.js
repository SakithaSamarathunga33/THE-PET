import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { MdPets, MdLocationOn, MdEmail, MdPhone } from 'react-icons/md'
import { FaHeart, FaHandHoldingHeart, FaUserShield, FaPaw } from 'react-icons/fa'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function About() {
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

  const values = [
    {
      icon: <FaHeart className="w-8 h-8" />,
      title: "Compassionate Care",
      description: "We treat every pet with the love and attention they deserve"
    },
    {
      icon: <FaHandHoldingHeart className="w-8 h-8" />,
      title: "Professional Service",
      description: "Our team of experts provides the highest quality care"
    },
    {
      icon: <FaUserShield className="w-8 h-8" />,
      title: "Trust & Safety",
      description: "Your pet's safety and well-being is our top priority"
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Head Veterinarian",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
      description: "Experienced veterinarian with over 10 years of practice in pet care."
    },
    {
      name: "Michael Chen",
      role: "Pet Behavior Specialist",
      image: "https://images.unsplash.com/photo-1556157382-97eda2d62296",
      description: "Certified animal behavior specialist helping pets and their owners."
    },
    {
      name: "Emma Williams",
      role: "Head Groomer",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
      description: "Professional pet groomer with expertise in all breeds."
    },
    {
      name: "Alex Thompson",
      role: "Pet Nutritionist",
      image: "https://images.unsplash.com/photo-1607990283143-e81e7a2c9349",
      description: "Certified pet nutritionist specializing in dietary planning and wellness."
    }
  ]

  return (
    <>
      <MyHead
        title="About Us - THE PET"
        description="Learn about our mission and values at THE PET"
        image="/images/white.png"
        url="https://thepet.com/about"
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
            <FaPaw className="w-16 h-16 mx-auto mb-6 text-[#FF7043]" />
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={fadeInUp}
          >
            About <span className="text-[#4DB6AC]">THE PET</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Dedicated to providing exceptional care for your beloved pets since 2023
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Story Section */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative h-[500px] rounded-xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1587764379873-97837921fd44"
                  alt="Our Story"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
            <motion.div 
              className="w-full md:w-1/2 space-y-6"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2 
                className="text-3xl font-bold"
                variants={fadeInUp}
              >
                Our Story
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-lg"
                variants={fadeInUp}
              >
                Founded with a passion for animal welfare, THE PET has grown from a small clinic to a comprehensive pet care center. Our journey began with a simple mission: to provide the highest quality care for pets while supporting their owners with expert guidance and compassionate service.
              </motion.p>
              <motion.p 
                className="text-gray-600 text-lg"
                variants={fadeInUp}
              >
                Today, we continue to expand our services while maintaining the personal touch that has made us a trusted name in pet care. Our team of dedicated professionals works tirelessly to ensure every pet receives the attention and care they deserve.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section 
        className="py-20 bg-[#FFF3E0]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-16"
            variants={fadeInUp}
          >
            Our Values
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {values.map((value) => (
              <motion.div 
                key={value.title} 
                className="bg-white p-8 rounded-xl shadow-lg"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="bg-[#FF7043] w-16 h-16 rounded-full flex items-center justify-center text-white mb-6 mx-auto"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {value.icon}
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-4 text-center"
                  variants={fadeInUp}
                >
                  {value.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-600 text-center"
                  variants={fadeInUp}
                >
                  {value.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-16"
            variants={fadeInUp}
          >
            Meet Our Team
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {team.map((member) => (
              <motion.div 
                key={member.name}
                className="text-center"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="relative h-64 mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <motion.h3 
                  className="text-xl font-semibold mb-2"
                  variants={fadeInUp}
                >
                  {member.name}
                </motion.h3>
                <motion.p 
                  className="text-gray-600"
                  variants={fadeInUp}
                >
                  {member.role}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-[#4DB6AC] to-[#FF7043]"
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
            Join Our Pet-Loving Family
          </motion.h2>
          <motion.p 
            className="text-white/90 mb-8 text-lg"
            variants={fadeInUp}
          >
            Experience the difference of professional pet care with a personal touch
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link 
              href="/contact" 
              className="bg-white text-[#4DB6AC] px-8 py-3 rounded-lg transition-all duration-300 inline-block hover:bg-[#FFF3E0]"
            >
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-[#4DB6AC] to-[#FF7043]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div 
          className="max-w-4xl mx-auto px-4 text-center text-white"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold mb-12"
            variants={fadeInUp}
          >
            Visit Us Today
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            <motion.div 
              className="flex flex-col items-center"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                transition={{ duration: 0.3 }}
              >
                <MdLocationOn className="w-10 h-10 mb-4" />
              </motion.div>
              <motion.h3 
                className="text-xl font-semibold mb-2"
                variants={fadeInUp}
              >
                Location
              </motion.h3>
              <motion.p 
                variants={fadeInUp}
                className="text-white/90"
              >
                123 Pet Street<br />City, State 12345
              </motion.p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                transition={{ duration: 0.3 }}
              >
                <MdEmail className="w-10 h-10 mb-4" />
              </motion.div>
              <motion.h3 
                className="text-xl font-semibold mb-2"
                variants={fadeInUp}
              >
                Email
              </motion.h3>
              <motion.p 
                variants={fadeInUp}
                className="text-white/90"
              >
                info@thepet.com
              </motion.p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                transition={{ duration: 0.3 }}
              >
                <MdPhone className="w-10 h-10 mb-4" />
              </motion.div>
              <motion.h3 
                className="text-xl font-semibold mb-2"
                variants={fadeInUp}
              >
                Phone
              </motion.h3>
              <motion.p 
                variants={fadeInUp}
                className="text-white/90"
              >
                (123) 456-7890
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>
    </>
  )
} 