"use client"

import { Code, Trophy, Play, Users } from "lucide-react"
import {Link} from "react-router-dom"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useTheme } from "../contexts/ThemeContext"
 
export default function FeaturesPage() {
    const { isDark } = useTheme()
  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Practice Problems",
      description: "2000+ coding problems from easy to expert level with detailed solutions",
      link: "/problems",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/10 to-red-500/10",
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Global Contests",
      description: "Weekly contests to compete with programmers worldwide and climb rankings",
      link: "/contest",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-500/10 to-orange-500/10",
    },
    {
      icon: <Play className="h-8 w-8" />,
      title: "Real-time Battles",
      description: "Challenge others in live coding battles with anti-cheat protection",
      link: "/game",
      color: "from-green-500 to-teal-500",
      bgColor: "from-green-500/10 to-teal-500/10",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community",
      description: "Connect with developers, share solutions, and learn together",
      link: "/top",
      color: "from-blue-500 to-purple-500",
      bgColor: "from-blue-500/10 to-purple-500/10",
    },
  ]

  const { ref: containerRef, inView: containerInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 300,
      scale: 0.95,
      rotateX: -15,
      rotateY: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      y: -100,
      scale: 0.9,
      rotateX: 15,
      rotateY: 10,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.6, 1],
      },
    },
  }

  return (
    <div className="bg-background px-4">
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate={containerInView ? "visible" : "exit"}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        style={{ perspective: 1000 }}
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants} className="h-full" style={{ transformStyle: "preserve-3d" }}>
            <Link
              to={feature.link}
              className={`h-full group relative overflow-hidden p-6 rounded-3xl transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl bg-card flex flex-col items-center text-center ${
                    isDark
                      ? "bg-gray-800/50 border-2 border-white/30 hover:bg-gray-800/80 hover:border-white/50"
                      : "bg-white border-2 border-black/30 hover:bg-gray-50 hover:border-black/50"
                  } backdrop-blur-sm`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Icon */}
              <div
                className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className={`text-xl font-bold mb-4 transition-all duration-300 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                {feature.title}
              </h3>

              {/* Description */}
              <p className={`leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                {feature.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
