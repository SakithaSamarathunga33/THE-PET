import React from 'react';
import MyHead from '../components/MyHead';
import NavBar from '../components/Navbar';
import { FaPhone, FaMapMarkerAlt, FaClock, FaAmbulance, FaExclamationTriangle, FaFirstAid, FaHospital, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const EmergencyPage = () => {
  const hospitals = [
    {
      name: "Pet Vet Clinic",
      address: "No 375, Galle Road, Colombo 03",
      phone: "+94 11 2 577 677",
      hours: "24/7 Emergency Service",
      services: ["Emergency Care", "Surgery", "ICU", "Pet Ambulance"],
      mapLink: "https://maps.google.com/?q=Pet+Vet+Clinic+Colombo",
    },
    {
      name: "Animal Medical Centre",
      address: "No 128, High Level Road, Nugegoda, Colombo",
      phone: "+94 11 2 821 111",
      hours: "24/7 Emergency Service",
      services: ["Emergency Care", "Critical Care", "Surgery", "Diagnostics"],
      mapLink: "https://maps.google.com/?q=Animal+Medical+Centre+Nugegoda",
    },
    {
      name: "Dr. Nalinika's Pet Hospital",
      address: "No. 141/3 Vauxhall Street, Colombo 02",
      phone: "+94 11 4 337 292",
      hours: "Open 24 Hours",
      services: ["Emergency Services", "Surgery", "Pet Ambulance", "ICU"],
      mapLink: "https://maps.google.com/?q=Dr+Nalinikas+Pet+Hospital+Colombo",
    },
    {
      name: "Guide Animal Hospital",
      address: "No 386, Galle Road, Colombo 03",
      phone: "+94 11 2 503 671",
      hours: "24/7 Emergency Care",
      services: ["Emergency Treatment", "Surgery", "Critical Care", "Laboratory"],
      mapLink: "https://maps.google.com/?q=Guide+Animal+Hospital+Colombo",
    },
    {
      name: "Pet Care Veterinary Hospital",
      address: "No. 23, Park Road, Colombo 05",
      phone: "+94 11 2 588 810",
      hours: "24 Hours Emergency Service",
      services: ["Emergency Care", "Surgery", "Diagnostics", "Intensive Care"],
      mapLink: "https://maps.google.com/?q=Pet+Care+Veterinary+Hospital+Colombo",
    }
  ];

  const emergencyTips = [
    {
      title: "Bleeding",
      icon: <FaFirstAid className="text-red-500 text-3xl mb-4" />,
      description: "Apply direct pressure with a clean cloth. If bleeding continues for more than 5 minutes, seek immediate veterinary care.",
      color: "bg-red-50"
    },
    {
      title: "Poisoning",
      icon: <FaExclamationTriangle className="text-yellow-500 text-3xl mb-4" />,
      description: "Contact a vet immediately. Do not induce vomiting unless instructed by a professional.",
      color: "bg-yellow-50"
    },
    {
      title: "Seizures",
      icon: <FaHospital className="text-blue-500 text-3xl mb-4" />,
      description: "Keep your pet away from furniture, keep them warm, and contact a vet immediately.",
      color: "bg-blue-50"
    }
  ];

  return (
    <>
      <MyHead
        title="Emergency Pet Care"
        description="24/7 Emergency pet care services and major pet hospitals in Colombo"
        image="/images/emergency.jpg"
        url="https://thepet.com/emergency"
      />
      <NavBar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-500 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/paw-pattern.png')] opacity-10"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 relative"
        >
          <div className="flex items-center justify-center space-x-4 mb-8">
            <FaAmbulance className="text-5xl animate-pulse" />
            <h1 className="text-5xl font-bold">Pet Emergency Services</h1>
          </div>
          <p className="text-center text-xl max-w-3xl mx-auto leading-relaxed">
            If your pet needs immediate medical attention, contact one of these 24/7 emergency pet hospitals in Colombo.
            Quick response time is crucial in emergency situations.
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="mt-8 flex justify-center"
          >
            <a 
              href="tel:+94112577677"
              className="inline-flex items-center bg-white text-red-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-red-50 transition-colors duration-300 shadow-lg"
            >
              <FaPhone className="mr-3" />
              Call Emergency Hotline
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Emergency Tips Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Emergency First Aid Tips</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {emergencyTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`${tip.color} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="flex flex-col items-center text-center">
                  {tip.icon}
                  <h3 className="text-xl font-bold mb-4">{tip.title}</h3>
                  <p className="text-gray-700">{tip.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Hospitals List */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">24/7 Emergency Pet Hospitals</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {hospitals.map((hospital, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FaHospital className="mr-3" />
                  {hospital.name}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start space-x-4">
                  <FaMapMarkerAlt className="text-red-500 text-2xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-700">Address:</p>
                    <p className="text-gray-600">{hospital.address}</p>
                    <a 
                      href={hospital.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-red-600 hover:text-red-700 mt-2 group"
                    >
                      View on Maps
                      <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <FaPhone className="text-green-500 text-2xl flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-700">Emergency Contact:</p>
                    <a 
                      href={`tel:${hospital.phone}`}
                      className="text-green-600 hover:text-green-700 text-lg"
                    >
                      {hospital.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <FaClock className="text-blue-500 text-2xl flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-700">Hours:</p>
                    <p className="text-gray-600">{hospital.hours}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 mb-3">Emergency Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {hospital.services.map((service, idx) => (
                      <span 
                        key={idx}
                        className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Emergency Contact Footer */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">Need Immediate Assistance?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              If your pet is experiencing a life-threatening emergency, 
              contact the nearest hospital immediately or call our 24/7 emergency hotline
            </p>
            <motion.a 
              href="tel:+94112577677"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center bg-white text-red-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-red-50 transition-colors duration-300 shadow-lg"
            >
              <FaPhone className="mr-3" />
              +94 11 2 577 677
            </motion.a>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default EmergencyPage;
