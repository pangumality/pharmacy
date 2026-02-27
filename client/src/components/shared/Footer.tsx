
import { NavLink } from "react-router-dom";
import { Facebook, Instagram,  Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-hello260-green text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">hello260</h3>
            <p className="text-sm text-gray-200">
              Your trusted partner in health and wellness since 2022.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="hover:text-hello260-cream transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-hello260-cream transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-hello260-cream transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>
                <NavLink to="/products" className="hover:text-hello260-cream transition-colors">
                  All Products
                </NavLink>
              </li>
              <li>
                <NavLink to="/products?category=Pain Relief" className="hover:text-hello260-cream transition-colors">
                  Pain Relief
                </NavLink>
              </li>
              <li>
                <NavLink to="/products?category=Antibiotics" className="hover:text-hello260-cream transition-colors">
                  Antibiotics
                </NavLink>
              </li>
              <li>
                <NavLink to="/products?category=Vitamins" className="hover:text-hello260-cream transition-colors">
                  Vitamins
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>
                <NavLink to="/about" className="hover:text-hello260-cream transition-colors">
                  Our Story
                </NavLink>
              </li>
              <li>
                <NavLink to="/about#mission" className="hover:text-hello260-cream transition-colors">
                  Our Commitment
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className="hover:text-hello260-cream transition-colors">
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <address className="not-italic text-sm text-gray-200 space-y-2">
              <p>Cairo Road,</p>
              <p>Lusaka, Zambia</p>
              <p className="mt-4">
                Email:{" "}
                <a href="mailto:info@hello260.com" className="hover:text-hello260-cream underline transition-colors">
                info@hello260.com
                </a>
              </p>
              <p>
                Phone:{" "}
                <a href="tel:+260972595061" className="hover:text-hello260-cream underline transition-colors">
                  (+260) 972595061
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-6 text-sm text-center text-gray-300">
          <p>
            &copy; {currentYear} hello260. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
