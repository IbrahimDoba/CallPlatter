"use client"

import { motion } from "framer-motion"

const LogoCarousel = () => {
  const companies = [
    {
      name: "MTN Nigeria",
      logo: "https://logos-world.net/wp-content/uploads/2020/09/MTN-Logo.png",
      description: "Leading Telecom"
    },
    {
      name: "Access Bank",
      logo: "https://logos-world.net/wp-content/uploads/2020/09/Access-Bank-Logo.png",
      description: "Financial Services"
    },
    {
      name: "Dangote Group",
      logo: "https://logos-world.net/wp-content/uploads/2020/09/Dangote-Logo.png",
      description: "Industrial Conglomerate"
    },
    {
      name: "Interswitch",
      logo: "https://logos-world.net/wp-content/uploads/2020/09/Interswitch-Logo.png",
      description: "Fintech Solutions"
    },
    {
      name: "Flutterwave",
      logo: "https://logos-world.net/wp-content/uploads/2020/09/Flutterwave-Logo.png",
      description: "Payment Platform"
    }
  ]

  const extendedCompanies = [...companies, ...companies, ...companies]

  return (
    <div className="w-full overflow-hidden py-16" style={{ backgroundColor: '#343434' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Trusted by Leading{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Nigerian Companies
            </span>
          </h3>
          <p className="text-gray-300 text-lg">
            Join thousands of businesses that rely on CallPlatter for their communication needs
          </p>
        </div>
        
        <motion.div 
          className="flex space-x-16"
          initial={{ opacity: 0, x: "0%" }}
          animate={{
            opacity: 1,
            x: "-50%"
          }}
          transition={{
            opacity: { duration: 0.5 },
            x: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              delay: 0.5
            }
          }}
          style={{
            width: "fit-content",
            display: "flex",
            gap: "4rem"
          }}
        >
          {extendedCompanies.map((company, index) => (
            <motion.div
              key={`company-${index}`}
              className="flex flex-col items-center space-y-3 min-w-[200px]"
              initial={{ opacity: 0.7 }}
              whileHover={{ 
                opacity: 1,
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              {/* <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                <div
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="h-12 w-auto object-contain mx-auto"
                  onError={(e) => {
                    // Fallback to a simple text logo if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `<div class="text-2xl font-bold text-white">${company.name.split(' ')[0]}</div>`
                    }
                  }}
                />
              </div> */}
              <div className="text-center">
                <h4 className="text-white font-semibold text-lg">{company.name}</h4>
                <p className="text-gray-300 text-sm">{company.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default LogoCarousel
