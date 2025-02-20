import { useState } from 'react'
import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import { MdPets, MdLocationOn, MdEmail, MdPhone, MdAccessTime, MdSend } from 'react-icons/md'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'

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

  const contactInfo = [
    {
      icon: <MdLocationOn className="w-6 h-6" />,
      title: "Visit Us",
      details: ["123 Pet Street", "City, State 12345"],
      color: "#4DB6AC"
    },
    {
      icon: <MdEmail className="w-6 h-6" />,
      title: "Email Us",
      details: ["info@thepet.com", "support@thepet.com"],
      color: "#FF7043"
    },
    {
      icon: <MdPhone className="w-6 h-6" />,
      title: "Call Us",
      details: ["(123) 456-7890", "(123) 456-7891"],
      color: "#FFB74D"
    },
    {
      icon: <MdAccessTime className="w-6 h-6" />,
      title: "Opening Hours",
      details: ["Mon-Sat: 9:00 AM - 6:00 PM", "Sunday: Closed"],
      color: "#81C784"
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
      <section className="relative py-20 bg-[#FFF3E0]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <MdPets className="w-16 h-16 mx-auto mb-6 text-[#FF7043]" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get in <span className="text-[#4DB6AC]">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info) => (
              <div 
                key={info.title}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${info.color}20`, color: info.color }}
                >
                  {info.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{info.title}</h3>
                {info.details.map((detail, index) => (
                  <p key={index} className="text-gray-600">{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              {success && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                  Message sent successfully!
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DB6AC] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DB6AC] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DB6AC] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DB6AC] focus:border-transparent"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white py-3 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <MdSend className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Find Us</h2>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509374!2d144.95373631531978!3d-37.817327979751735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0xb6899234e561db11!2sEnvato!5e0!3m2!1sen!2sus!4v1635274843520!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-20 bg-[#FFF3E0]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Connect With Us</h2>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-[#4DB6AC] hover:text-[#FF7043] transition-colors duration-300">
              <FaFacebook className="w-8 h-8" />
            </a>
            <a href="#" className="text-[#4DB6AC] hover:text-[#FF7043] transition-colors duration-300">
              <FaTwitter className="w-8 h-8" />
            </a>
            <a href="#" className="text-[#4DB6AC] hover:text-[#FF7043] transition-colors duration-300">
              <FaInstagram className="w-8 h-8" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
} 