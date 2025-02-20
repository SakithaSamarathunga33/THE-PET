import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { MdPets, MdHealthAndSafety, MdGroups, MdSpa, MdHome, MdLocalHotel } from 'react-icons/md'
import { FaPaw, FaHeart } from 'react-icons/fa'
import Link from 'next/link'

export default function Services() {
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
      <section className="relative py-20 bg-[#FFF3E0]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <MdPets className="w-16 h-16 mx-auto mb-6 text-[#FF7043]" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Our <span className="text-[#4DB6AC]">Premium Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Providing the best care for your beloved pets with our comprehensive range of professional services
          </p>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-20">
            {services.map((service, index) => (
              <div key={service.title} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
                <div className="w-full md:w-1/2">
                  <div className="relative h-[400px] rounded-xl overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="bg-[#FF7043] w-16 h-16 rounded-full flex items-center justify-center text-white mb-6">
                    {service.icon}
                  </div>
                  <h2 className="text-3xl font-bold">{service.title}</h2>
                  <p className="text-gray-600 text-lg">{service.description}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-700">
                        <FaPaw className="text-[#4DB6AC] mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/contact" 
                    className="bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-20 bg-[#FFF3E0]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalServices.map((service) => (
              <div key={service.title} className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
                <div className="bg-[#FF7043] w-12 h-12 rounded-full flex items-center justify-center text-white mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#4DB6AC] to-[#FF7043]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Give Your Pet the Best Care?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Contact us today to schedule an appointment or learn more about our services
          </p>
          <Link href="/contact" className="bg-white text-[#4DB6AC] px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#FFF3E0]">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
} 