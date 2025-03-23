
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#0078FF] text-white relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/03038be2-2146-4f36-a685-7b7719df9caa.png" 
              alt="Emotions Logo" 
              className="h-7 md:h-9 relative"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-1 bg-blue-600/30 backdrop-blur-sm rounded-full px-2 py-1.5">
              <Link to="/" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Home
              </Link>
              <Link to="/therapists" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Therapists
              </Link>
              <Link to="/journal" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Journal
              </Link>
              <Link to="/ambassadors" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Mental Health Ambassadors
              </Link>
              <Link to="/resources" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Resource Center
              </Link>
              <Link to="/help-groups" className="text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-all hover:bg-[#fda802] text-sm font-medium">
                Help Groups
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="bg-white text-[#0078FF] hover:bg-[#fda802] hover:text-white rounded-full px-6 font-medium shadow-sm shadow-blue-600/20 border-none transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-[#fda802] rounded-full px-6 font-medium transition-all"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    className="bg-white text-[#0078FF] hover:bg-[#fda802] hover:text-white rounded-full px-6 font-medium shadow-sm shadow-blue-600/20 transition-all"
                  >
                    Signup
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-blue-600/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link to="/" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Home
            </Link>
            <Link to="/therapists" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Therapists
            </Link>
            <Link to="/journal" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Journal
            </Link>
            <Link to="/ambassadors" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Mental Health Ambassadors
            </Link>
            <Link to="/resources" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Resource Center
            </Link>
            <Link to="/help-groups" className="block px-4 py-2 hover:bg-[#fda802] rounded-lg transition-colors">
              Help Groups
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
