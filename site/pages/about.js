import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { MdPets, MdLocationOn, MdEmail, MdPhone } from 'react-icons/md'
import { FaHeart, FaHandHoldingHeart, FaUserShield, FaPaw } from 'react-icons/fa'

export default function About() {
  const values = [
    {
      icon: <FaHeart className="w-8 h-8" />,
      title: "Compassionate Care",
      description: "We treat every pet with love and attention they deserve, ensuring their comfort and happiness."
    },
    {
      icon: <FaHandHoldingHeart className="w-8 h-8" />,
      title: "Professional Service",
      description: "Our team of experienced professionals provides the highest quality care for your pets."
    },
    {
      icon: <FaUserShield className="w-8 h-8" />,
      title: "Trust & Safety",
      description: "We prioritize the safety and well-being of all pets entrusted to our care."
    }
  ]

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
    }
  ]

  return (
    <>
      <MyHead
        title="About Us - THE PET"
        description="Learn about our mission and dedicated team at THE PET"
        image="/images/white.png"
        url="https://thepet.com/about"
      />
      <NavBar />

      {/* Hero Section */}
      <section className="relative py-20 bg-[#FFF3E0]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <MdPets className="w-16 h-16 mx-auto mb-6 text-[#FF7043]" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-[#4DB6AC]">THE PET</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dedicated to providing exceptional care for your beloved pets since 2020
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c"
                alt="Our Mission"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                At THE PET, our mission is to provide the highest quality care for pets while offering 
                support and education to their owners. We believe in creating a warm, welcoming 
                environment where both pets and their humans feel comfortable and cared for.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We strive to be more than just a pet care facility – we aim to be a trusted partner 
                in your pet's health and happiness journey. Our team of dedicated professionals works 
                tirelessly to ensure every pet receives personalized attention and care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-[#FFF3E0]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
                <div className="bg-[#FF7043] w-16 h-16 rounded-full flex items-center justify-center text-white mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-[#4DB6AC] mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-[#4DB6AC] to-[#FF7043]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-12">Visit Us Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <MdLocationOn className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p>123 Pet Street<br />City, State 12345</p>
            </div>
            <div className="flex flex-col items-center">
              <MdEmail className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p>info@thepet.com</p>
            </div>
            <div className="flex flex-col items-center">
              <MdPhone className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p>(123) 456-7890</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
} 