import { Link } from "react-router-dom";
import { useState } from "react";
import "./Navbars.css";

function Navbars() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/" className="logo-link" onClick={closeMenu}>
              AUSTRALIA RTS GROUP
            </Link>
          </div>
          
          {/* Hamburger Menu Button */}
          <button 
            className={`hamburger ${isMenuOpen ? 'hamburger--active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation Menu */}
          <ul className={`nav-menu ${isMenuOpen ? 'nav-menu--active' : ''}`}>
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/employer" className="nav-link" onClick={closeMenu}>
                Immigration
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/employer" className="nav-link" onClick={closeMenu}>
                Work Permit
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/employer" className="nav-link" onClick={closeMenu}>
                LMIA
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/employer" className="nav-link" onClick={closeMenu}>
                Job Offer
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/employer" className="nav-link" onClick={closeMenu}>
                VISA
              </Link>
            </li>
            
            {/* Admin/Login Links */}
            <li className="nav-item mobile-admin-links">
              {localStorage.getItem('adminLoggedIn') === 'true' ? (
                <>
                  <Link to="/admin" className="nav-link admin-link" onClick={closeMenu}>
                    Terminal Dashboard
                  </Link>
                  <button 
                    className="nav-link logout-btn"
                    onClick={() => {
                      localStorage.removeItem('adminLoggedIn');
                      localStorage.removeItem('adminEmail');
                      closeMenu();
                      window.location.reload();
                    }}
                  >
                    Terminal Logout
                  </button>
                </>
              ) : (
                <Link to="/admin/login" className="nav-link admin-link" onClick={closeMenu}>
                  Terminal Login
                </Link>
              )}
            </li>
          </ul>

          {/* Desktop Admin Links */}
          <div className="desktop-admin-links">
            {localStorage.getItem('adminLoggedIn') === 'true' ? (
              <div className="admin-section">
                <Link to="/admin" className="admin-link">
                  Terminal Dashboard
                </Link>
                <button 
                  className="logout-btn"
                  onClick={() => {
                    localStorage.removeItem('adminLoggedIn');
                    localStorage.removeItem('adminEmail');
                    window.location.reload();
                  }}
                >
                  Terminal Logout
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="admin-link">
                Terminal Login
              </Link>
            )}
          </div>
        </div>

        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div className="menu-overlay" onClick={closeMenu}></div>
        )}
      </nav>
    </>
  );
}

export default Navbars;