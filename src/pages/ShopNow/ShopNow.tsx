import { motion } from "framer-motion";
import {
  FaRocket,
  FaChartLine,
  FaPenFancy,
  FaFunnelDollar,
  FaLaptopCode,
  FaMobileAlt,
  FaStar,
} from "react-icons/fa";

const ShopNow = () => {
  // Function to open WhatsApp
  const openWhatsApp = () => {
    window.location.href = "tel:7777079708";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    hover: {
      y: -10,
      scale: 1.03,
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] }, // cubic-bezier for easeOut
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Basic Products Section */}
        <motion.div
          className="mb-20"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
            Basic Products
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-12 rounded-full"></div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* AI Ads */}
            <motion.div
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col"
              variants={itemVariants}
              whileHover="hover"
            >
              <div className="p-6 flex-1">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <FaRocket className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                    <FaStar className="text-yellow-400" />
                  Ai Ads
                </h3>
                <p className="text-gray-600 mb-6">
                  AI-powered ad campaigns that optimize in real-time for maximum
                  conversions and ROI.
                </p>
                
                <a
                  href="https://ads.starzai.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                    Know More
                  </button>
                </a>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 h-2 w-full"></div>
            </motion.div>

            {/* AI Ranks */}
            <motion.div
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col"
              variants={itemVariants}
              whileHover="hover"
            >
              <div className="p-6 flex-1">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <FaChartLine className="text-purple-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                    <FaStar className="text-yellow-400" />
                  Ai Rank
                </h3>
                <p className="text-gray-600 mb-6">
                  Boost your search engine rankings with AI-optimized SEO
                  strategies and content.
                </p>
                <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium opacity-80 cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 h-2 w-full"></div>
            </motion.div>

            {/* AI Content */}
            <motion.div
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col"
              variants={itemVariants}
              whileHover="hover"
            >
              <div className="p-6 flex-1">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <FaPenFancy className="text-green-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                    <FaStar className="text-yellow-400" />
                  Ai Content
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate high-quality, SEO-friendly content at scale with our
                  advanced AI writer.
                </p>
                <button className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium opacity-80 cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-teal-50 h-2 w-full"></div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Advanced Solutions Section */}
        <motion.div
          className="mt-32"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
            Advanced Solutions
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto mb-12 rounded-full"></div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Funnel */}
            <motion.div
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden border border-gray-200 flex flex-col"
              variants={itemVariants}
              whileHover="hover"
            >
              <div className="p-6 flex-1">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <FaFunnelDollar className="text-orange-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Starz Funnel
                </h3>
                <p className="text-gray-600 mb-6">
                  High-converting sales funnels tailored to your business with
                  automated lead nurturing.
                </p>
                <button
                  onClick={openWhatsApp}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Free Consultation
                </button>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 h-2 w-full"></div>
            </motion.div>

            {/* Web */}
            <motion.div
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden border border-gray-200 flex flex-col"
              variants={itemVariants}
              whileHover="hover"
            >
              <div className="p-6 flex-1">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <FaLaptopCode className="text-red-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Starz Web
                </h3>
                <p className="text-gray-600 mb-6">
                  Custom websites with blazing fast performance, SEO
                  optimization, and conversion-focused design.
                </p>
                <button
                  onClick={openWhatsApp}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Free Consultation
                </button>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-rose-50 h-2 w-full"></div>
            </motion.div>

            {/* Apps */}
            <motion.div
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden border border-gray-200 flex flex-col"
              variants={itemVariants}
              whileHover="hover"
            >
              <div className="p-6 flex-1">
                <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                  <FaMobileAlt className="text-cyan-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Starz Apps
                </h3>
                <p className="text-gray-600 mb-6">
                  Native and cross-platform mobile applications with modern
                  UI/UX and robust backend.
                </p>
                <button
                  onClick={openWhatsApp}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Free Consultation
                </button>
              </div>
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 h-2 w-full"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopNow;
