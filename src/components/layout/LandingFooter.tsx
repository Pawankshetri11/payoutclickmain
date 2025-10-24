import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, IndianRupee } from "lucide-react";

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4 border-t border-gray-700">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <IndianRupee className="h-7 w-7" />
              </div>
              <div>
                <span className="font-bold text-2xl">PayoutClick</span>
                <p className="text-xs text-gray-400">Earn Money Online</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              India's most trusted platform for earning money online through simple tasks. Join 50,000+ active users today!
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => navigate('/about')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all" />
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all" />
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/earnings-info')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all" />
                  Earnings
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all" />
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-px bg-purple-500 transition-all" />
                  Help Center
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-px bg-purple-500 transition-all" />
                  FAQs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms-of-service')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-px bg-purple-500 transition-all" />
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy-policy')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-px bg-purple-500 transition-all" />
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3 group">
                <Mail className="h-5 w-5 mt-0.5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">Email</p>
                  <a href="mailto:support@payoutclick.com" className="text-gray-300 hover:text-white transition-colors">
                    support@payoutclick.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <Phone className="h-5 w-5 mt-0.5 text-purple-500 group-hover:text-purple-400 transition-colors" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">Phone</p>
                  <a href="tel:+918104974122" className="text-gray-300 hover:text-white transition-colors">
                    +91 810 497 4122
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-pink-500" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">Location</p>
                  <p className="text-gray-300">Mumbai, India</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 PayoutClick. All rights reserved. Made with ❤️ in India
            </p>
            <div className="flex items-center gap-6 text-sm">
              <button onClick={() => navigate('/terms-of-service')} className="text-gray-400 hover:text-white transition-colors">
                Terms
              </button>
              <button onClick={() => navigate('/privacy-policy')} className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </button>
              <button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-white transition-colors">
                Contact
              </button>
              <button onClick={() => navigate('/sitemap')} className="text-gray-400 hover:text-white transition-colors">
                Sitemap
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
