"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface FeatureTabProps {
  icon: ReactNode
  title: string
  description: string
  isActive: boolean
}

export const FeatureTab = ({ icon, title, description, isActive }: FeatureTabProps) => {
  return (
    <div 
      className={`
        w-full flex items-center gap-4 p-5 rounded-xl
        transition-all duration-300 relative
        ${isActive 
          ? 'bg-white/10 backdrop-blur-lg shadow-lg shadow-blue-500/10' 
          : 'hover:bg-white/5'
        }
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 top-0 w-1 h-full bg-blue-400 rounded-l-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <div className="flex items-center gap-4 min-w-0">
        <div className={`${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
          {icon}
        </div>
        <div className="text-left min-w-0">
          <h3 className={`font-semibold truncate text-base ${isActive ? 'text-blue-400' : 'text-white'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
