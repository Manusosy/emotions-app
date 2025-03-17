import { Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-brand-blue-light via-white to-brand-purple-light w-full">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission Statement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-[#fda901]" />
              <h3 className="text-lg font-semibold text-gray-900">Our Mission</h3>
            </div>
            <div className="space-y-3">
              <p className="text-gray-600">
                Making mental health support accessible to everyone, everywhere.
              </p>
              <p className="text-gray-600">
                Join us in creating a world where mental wellness is a priority, not an afterthought.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Link to="/about" className="block text-sm text-gray-500 hover:text-blue-500">About Us</Link>
                <Link to="/contact" className="block text-sm text-gray-500 hover:text-blue-500">Contact</Link>
                <Link to="/therapy" className="block text-sm text-gray-500 hover:text-blue-500">Therapy</Link>
              </div>
              <div className="space-y-3">
                <Link to="/journal" className="block text-sm text-gray-500 hover:text-blue-500">Journal</Link>
                <Link to="/mood-tracker" className="block text-sm text-gray-500 hover:text-blue-500">Mood Tracker</Link>
                <Link to="/ambassadors" className="block text-sm text-gray-500 hover:text-blue-500">Ambassadors</Link>
              </div>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#fda901] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#fda901] transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#fda901] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#fda901] transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Emotions. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-blue-500">
                Privacy Policy
              </Link>
              <Link to="/data-protection" className="text-sm text-gray-500 hover:text-blue-500">
                Data Protection
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-blue-500">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
