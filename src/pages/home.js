import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Australia <span className="highlight">RTS</span> Solutions
            </h1>
            <p className="hero-subtitle">
              Leading Provider of Resident Tracking Systems and Immigration Technology Solutions
            </p>
            <p className="hero-description">
              Advanced software solutions for immigration compliance, resident management, 
              and government reporting across Australia and beyond.
            </p>
            <div className="hero-buttons">
              <Link to="/" className="btn btn-primary">
                View Our Products
              </Link>
              <Link to="/" className="btn btn-secondary">
                Request Demo
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="vehicle-2275456.jpg" alt="RTS Dashboard" className="hero-img" />
            <div className="image-caption">RTS Enterprise Dashboard - Real-time Monitoring</div>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section className="products-section">
        <div className="container">
          <h2 className="section-title">Your Demand Suite</h2>
          <div className="products-grid">
            
            <div className="product-card">
              <div className="product-image">
                <img src="ai-generated-8540912.jpg" alt="RTS Enterprise System" />
                <div className="product-badge">Enterprise</div>
              </div>
              <div className="product-content">
                <h3>RTS Enterprise Platform</h3>
                <p className="product-description">
                  Comprehensive resident tracking and compliance management system for large-scale 
                  immigration programs and government agencies.
                </p>
                <ul className="product-features">
                  <li>Real-time resident monitoring</li>
                  <li>Automated compliance reporting</li>
                  <li>Multi-agency integration</li>
                  <li>Advanced analytics dashboard</li>
                </ul>
                <div className="product-actions">
                  <Link to="/" className="btn btn-outline">Learn More</Link>
                  <button className="btn btn-primary">Request Demo</button>
                </div>
              </div>
            </div>

            <div className="product-card reverse">
              <div className="product-image">
                <img src="/milling-444493.jpg" alt="RTS Business Edition" />
                <div className="product-badge">Business</div>
              </div>
              <div className="product-content">
                <h3>RTS Business Edition</h3>
                <p className="product-description">
                  Streamlined resident management solution for businesses, educational institutions, 
                  and medium-sized organizations.
                </p>
                <ul className="product-features">
                  <li>Employee visa tracking</li>
                  <li>Compliance alert system</li>
                  <li>Document management</li>
                  <li>Custom reporting tools</li>
                </ul>
                <div className="product-actions">
                  <Link to="/products/business" className="btn btn-outline">Learn More</Link>
                  <button className="btn btn-primary">Request Pricing</button>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-image">
                <img src="night-view-6212073.jpg" alt="RTS Mobile App" />
                <div className="product-badge">Mobile</div>
              </div>
              <div className="product-content">
                <h3>RTS Mobile Connect</h3>
                <p className="product-description">
                  Mobile application for residents and temporary visa holders to manage their 
                  compliance requirements and stay connected.
                </p>
                <ul className="product-features">
                  <li>Visa status tracking</li>
                  <li>Document upload</li>
                  <li>Location check-ins</li>
                  <li>Push notifications</li>
                </ul>
                <div className="product-actions">
                  <Link to="/" className="btn btn-outline">View App</Link>
                  <button className="btn btn-primary">Download</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About RTS Company */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Australia RTS</h2>
              <p className="about-intro">
                For over 15 years, Australia RTS has been at the forefront of immigration 
                technology solutions, providing robust Resident Tracking Systems to government 
                agencies, businesses, and educational institutions across Australia.
              </p>
              
              <div className="about-features">
                <div className="feature">
                  <h4>🏢 Our Mission</h4>
                  <p>To streamline immigration compliance through innovative technology solutions that benefit both residents and administrators.</p>
                </div>
                
                <div className="feature">
                  <h4>🌏 Our Reach</h4>
                  <p>Serving clients across all Australian states and territories, with expanding operations in New Zealand and Southeast Asia.</p>
                </div>
                
                <div className="feature">
                  <h4>🔒 Security First</h4>
                  <p>All our systems are built with enterprise-grade security and comply with Australian privacy and data protection standards.</p>
                </div>
              </div>
            </div>
            
            <div className="about-image">
              <img src="RTS.png" alt="Australia RTS Office" />
              <div className="company-stats">
                <div className="stat">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="stat">
                  <div className="stat-number">200+</div>
                  <div className="stat-label">Clients</div>
                </div>
                <div className="stat">
                  <div className="stat-number">50K+</div>
                  <div className="stat-label">Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="tech-section">
        <div className="container">
          <h2 className="section-title">Our Technology</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <div className="tech-icon">☁️</div>
              <h4>Cloud Native</h4>
              <p>Built on AWS and Azure cloud platforms for scalability and reliability</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">🔐</div>
              <h4>Bank-Level Security</h4>
              <p>End-to-end encryption and compliance with Australian security standards</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">📊</div>
              <h4>Real-time Analytics</h4>
              <p>Advanced reporting and data visualization for informed decision making</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">🔄</div>
              <h4>API Integration</h4>
              <p>Seamless integration with existing government and business systems</p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-text">
                "The RTS platform revolutionized our compliance tracking. Reduced manual work by 80% and improved accuracy significantly."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">JS</div>
                <div className="author-info">
                  <div className="author-name">John Smith</div>
                  <div className="author-role">Immigration Manager, NSW Government</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-text">
                "Excellent support and robust system. The mobile app makes it easy for our international students to stay compliant."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">SG</div>
                <div className="author-info">
                  <div className="author-name">Sarah Johnson</div>
                  <div className="author-role">International Student Director, University of Melbourne</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Resident Management?</h2>
            <p>Schedule a personalized demo and see how Australia RTS can streamline your operations</p>
            <div className="cta-buttons">
              <Link to="/" className="btn btn-primary">Schedule Demo</Link>
              <Link to="/" className="btn btn-outline">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;