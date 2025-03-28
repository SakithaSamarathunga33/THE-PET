import { useState } from 'react'
import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import { MdPets, MdLocationOn, MdEmail, MdPhone, MdAccessTime, MdSend } from 'react-icons/md'
import { FaFacebook, FaTwitter, FaInstagram, FaPaw } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    }
  };

  const contactInfo = [
    {
      icon: <MdLocationOn className="w-8 h-8" />,
      title: "Visit Us",
      details: ["123 Pet Street", "City, State 12345"],
      color: "#4F959D",
      bgColor: "#F6F8D5"
    },
    {
      icon: <MdEmail className="w-8 h-8" />,
      title: "Email Us",
      details: ["info@thepet.com", "support@thepet.com"],
      color: "#205781",
      bgColor: "#98D2C0"
    },
    {
      icon: <MdPhone className="w-8 h-8" />,
      title: "Call Us",
      details: ["(123) 456-7890", "(123) 456-7891"],
      color: "#4F959D",
      bgColor: "#F6F8D5"
    },
    {
      icon: <MdAccessTime className="w-8 h-8" />,
      title: "Opening Hours",
      details: ["Mon-Sat: 9:00 AM - 6:00 PM", "Sunday: Closed"],
      color: "#205781",
      bgColor: "#98D2C0"
    }
  ]

  return (
    <>
      <MyHead
        title="Contact Us - THE PET"
        description="Get in touch with THE PET team"
        image="/images/white.png"
        url="https://thepet.com/contact"
      />
      <NavBar />

      {/* Hero Section */}
      <motion.section 
        className="relative py-24 bg-gradient-to-r from-[#4F959D]/10 to-[#205781]/10"
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
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.8 }}
          >
            <FaPaw className="w-20 h-20 mx-auto mb-8 text-[#205781]" />
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6"
            variants={fadeInUp}
          >
            Get in <span className="text-[#4F959D]">Touch</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Have questions? We'd love to hear from you. Reach out to us and we'll respond as soon as possible.
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Contact Info Cards */}
      <motion.section 
        className="py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {contactInfo.map((info) => (
              <motion.div 
                key={info.title}
                className="rounded-2xl overflow-hidden"
                variants={cardVariants}
                whileHover="hover"
              >
                <div 
                  className="p-8"
                  style={{ backgroundColor: info.bgColor }}
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white shadow-lg"
                    style={{ color: info.color }}
                  >
                    {info.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: info.color }}>
                    {info.title}
                  </h3>
                  {info.details.map((detail, index) => (
                    <p key={index} className="text-gray-600 text-lg mb-2">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Map Section */}
      <motion.section 
        className="py-24 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-8 text-center">Find Us</h2>
              <div className="relative h-[500px] rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.58585989655!2d79.7861641371615!3d6.921837369678468!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1689893751932!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Social Media Section */}
      <motion.section 
        className="py-24 bg-gradient-to-r from-[#4F959D]/10 to-[#205781]/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div 
          className="max-w-4xl mx-auto px-4 text-center"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl font-bold mb-12"
            variants={fadeInUp}
          >
            Connect With Us
          </motion.h2>
          <motion.div 
            className="flex justify-center space-x-12"
            variants={staggerContainer}
          >
            {[
              { icon: <FaFacebook className="w-10 h-10" />, color: "#4267B2" },
              { icon: <FaTwitter className="w-10 h-10" />, color: "#1DA1F2" },
              { icon: <FaInstagram className="w-10 h-10" />, color: "#E1306C" }
            ].map((social, index) => (
              <motion.a
                key={index}
                href="#"
                className="transform transition-all duration-300"
                variants={cardVariants}
                whileHover={{ scale: 1.2 }}
                style={{ color: social.color }}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>
    </>
  )
} 