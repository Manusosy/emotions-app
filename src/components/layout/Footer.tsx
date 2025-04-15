import { Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  
  // Direct navigation function that doesn't use setTimeout
  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

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
                <a 
                  href="/about" 
                  onClick={(e) => handleNavigation("/about", e)}
                  className="block text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
                >
                  About Us
                </a>
                <a 
                  href="/contact" 
                  onClick={(e) => handleNavigation("/contact", e)}
                  className="block text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
                >
                  Contact
                </a>
                <a 
                  href="/resources" 
                  onClick={(e) => handleNavigation("/resources", e)}
                  className="block text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
                >
                  Resources
                </a>
              </div>
              <div className="space-y-3">
                <a 
                  href="/journal" 
                  onClick={(e) => handleNavigation("/journal", e)}
                  className="block text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
                >
                  Journal
                </a>
                <a 
                  href="/help-groups" 
                  onClick={(e) => handleNavigation("/help-groups", e)}
                  className="block text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
                >
                  Help Groups
                </a>
                <a 
                  href="/ambassadors" 
                  onClick={(e) => handleNavigation("/ambassadors", e)}
                  className="block text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
                >
                  Ambassadors
                </a>
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
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Emotions. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="/privacy" 
                onClick={(e) => handleNavigation("/privacy", e)}
                className="text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
              >
                Privacy Policy
              </a>
              <a 
                href="/data-protection" 
                onClick={(e) => handleNavigation("/data-protection", e)}
                className="text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
              >
                Data Protection
              </a>
              <a 
                href="/terms" 
                onClick={(e) => handleNavigation("/terms", e)}
                className="text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
              >
                Terms of Service
              </a>
              <a 
                href="/faqs" 
                onClick={(e) => handleNavigation("/faqs", e)}
                className="text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
              >
                FAQs
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
