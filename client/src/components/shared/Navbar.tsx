
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state } = useCart();
  const { totalItems } = state;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container-custom py-3">
        <div className="flex items-center justify-between">
        
          <NavLink to="/" className="flex items-center space-x-2">
             

            <img 
                  src="/logo.png"
                  alt="hello260 Logo"
                  className="h-20 w-auto object-contain"
            />

            <span className="font-bold text-lg md:text-xl text-hello260-green font-serif">
            hello260
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-hello260-green font-medium" : "text-gray-600 hover:text-hello260-green transition-colors"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "text-hello260-green font-medium" : "text-gray-600 hover:text-hello260-green transition-colors"
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? "text-hello260-green font-medium" : "text-gray-600 hover:text-hello260-green transition-colors"
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "text-hello260-green font-medium" : "text-gray-600 hover:text-hello260-green transition-colors"
              }
            >
              Contact
            </NavLink>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/login" className="text-gray-600 hover:text-hello260-green transition-colors">
              Login
            </NavLink>
            <NavLink to="/cart" className="relative">
              <ShoppingBag className="text-gray-600 hover:text-hello260-green transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-hello260-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <NavLink to="/cart" className="relative">
              <ShoppingBag className="text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-hello260-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </NavLink>
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-hello260-green transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <NavLink
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? "text--green font-medium" : "text-gray-600"
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? "text-hello260-green font-medium" : "text-gray-600"
                }
              >
                Products
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? "text-hello260-green font-medium" : "text-gray-600"
                }
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? "text-hello260-green font-medium" : "text-gray-600"
                }
              >
                Contact
              </NavLink>
              <NavLink
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? "text-hello260-green font-medium" : "text-gray-600"
                }
              >
                Login
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
