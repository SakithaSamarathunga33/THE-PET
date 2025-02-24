import React from 'react';
import MyHead from '../components/MyHead';
import NavBar from '../components/Navbar';
import { FaPhone, FaMapMarkerAlt, FaClock, FaAmbulance } from 'react-icons/fa';

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
      <div className="bg-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <FaAmbulance className="text-4xl animate-pulse" />
            <h1 className="text-4xl font-bold">Pet Emergency Services</h1>
          </div>
          <p className="text-center text-xl max-w-2xl mx-auto">
            If your pet needs immediate medical attention, contact one of these 24/7 emergency pet hospitals in Colombo.
            All listed hospitals provide round-the-clock emergency services.
          </p>
        </div>
      </div>

      {/* Emergency Tips Section */}
      <div className="bg-red-50 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Emergency First Aid Tips</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">Bleeding</h3>
              <p>Apply direct pressure with a clean cloth. If bleeding continues for more than 5 minutes, seek immediate veterinary care.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">Poisoning</h3>
              <p>Contact a vet immediately. Do not induce vomiting unless instructed by a professional.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">Seizures</h3>
              <p>Keep your pet away from furniture, keep them warm, and contact a vet immediately.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hospitals List */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {hospitals.map((hospital, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-gradient-to-r from-[#4DB6AC] to-[#26A69A] p-4">
                <h2 className="text-2xl font-bold text-white">{hospital.name}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-red-500 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Address:</p>
                    <p>{hospital.address}</p>
                    <a 
                      href={hospital.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 text-sm inline-block mt-1"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-green-500 text-xl flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Emergency Contact:</p>
                    <a 
                      href={`tel:${hospital.phone}`}
                      className="text-green-600 hover:text-green-700"
                    >
                      {hospital.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaClock className="text-blue-500 text-xl flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Hours:</p>
                    <p>{hospital.hours}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-2">Emergency Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {hospital.services.map((service, idx) => (
                      <span 
                        key={idx}
                        className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact Footer */}
      <div className="bg-red-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h2>
          <p className="text-lg mb-4">
            If your pet is experiencing a life-threatening emergency, 
            contact the nearest hospital immediately or call our 24/7 emergency hotline:
          </p>
          <a 
            href="tel:+94112577677" 
            className="inline-flex items-center bg-white text-red-600 px-6 py-3 rounded-full font-bold text-lg hover:bg-red-50 transition-colors duration-300"
          >
            <FaPhone className="mr-2" />
            +94 11 2 577 677
          </a>
        </div>
      </div>
    </>
  );
};

export default EmergencyPage;
