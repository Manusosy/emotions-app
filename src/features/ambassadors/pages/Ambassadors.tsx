
import React from "react";
import Header from "@/app/layout/Header";
import HighlightedDoctors from "@/features/mood-tracking/components/HighlightedDoctors";
import { motion } from "framer-motion";

const Ambassadors = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple-light via-white to-brand-blue-light">
      <Header />
      
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-purple-light via-transparent to-brand-blue-light" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.07'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="relative z-10 pt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center text-[#001A41] mb-6">
            Mental Health Ambassadors
          </h1>
          <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto">
            Our mental health ambassadors are dedicated professionals who provide support and guidance 
            to help you navigate your mental health journey. Connect with them for a free consultation.
          </p>
        </motion.div>
        <HighlightedDoctors />
        
        <div className="mt-20 px-4">
          <div className="why-book-badge flex items-center mx-auto justify-center">
            <span>• Why Book With Us •</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ambassadors;
