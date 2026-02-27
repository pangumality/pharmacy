import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Users, Award, Sparkles } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-hello260-cream py-16 md:py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="heading-xl">Our Story</h1>
              <p className="text-lg text-gray-700">
                At hello260, we believe in the power of accessible healthcare.
                Born from the heart of our community, our pharmacy is dedicated 
                to providing essential medicines and professional health advice to everyone.
              </p>
              <p className="text-lg text-gray-700">
              We specialize in high-quality pharmaceuticals, vitamins, and healthcare products—all 
              sourced from trusted manufacturers.
              Every product we offer is selected with your well-being in mind, ensuring you receive 
              safe and effective treatments for your health needs.
              From prescription medicines to daily supplements, our story is one of care, trust, and commitment to your health.
              </p>
            </div>
            <div className="relative h-80 md:h-[400px] bg-gray-200 rounded-lg">
              {/* This will be replaced with an actual image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/assets/our_story.png"
                  alt="hello260 Story"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative h-80 md:h-[400px] bg-gray-200 rounded-lg">
              {/* This will be replaced with an actual image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/assets/our_mission.png"
                  alt="hello260 Mission"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="heading-lg">Our Mission</h2>
              <p className="text-gray-700">
              hello260 is a leading pharmaceutical provider dedicated to improving the health and well-being of our community. We are committed to offering high-quality medicines, expert health advice, and exceptional customer service.
              </p>
              <p className="text-gray-700">
              Founded on the principles of integrity and care, we strive to be more than just a pharmacy; we are your partners in health. Our team of qualified pharmacists and healthcare professionals is here to support you with personalized care and attention.
              </p>
              <p className="text-gray-700">
              We believe that access to quality healthcare is a fundamental right. That's why we work tirelessly to ensure our products are affordable, accessible, and of the highest standard.
              </p>
            </div>
          </div>
        </div>
      </section>


      
      {/* Hero Section */}
      <section className="bg-hello260-cream py-16 md:py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="heading-xl">Our Location</h1>
              <p className="text-lg text-gray-700">
              hello260 is conveniently located in Lusaka, Zambia, making quality healthcare accessible to our community. Our modern facility is designed to provide a comfortable and welcoming environment for all our customers.
              </p>
              <p className="text-lg text-gray-700">
              We stock a wide range of prescription medicines, over-the-counter products, vitamins, and supplements. Whether you need a specific medication or general health advice, our doors are open to serve you.
              </p>
            </div>
            <div className="relative h-80 md:h-[400px] bg-gray-200 rounded-lg">
              {/* This will be replaced with an actual image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/assets/our_location.png"
                  alt="hello260 Location"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-hello260-green py-20">
        <div className="container-custom text-white">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="heading-lg mb-4">Our Values</h2>
            <p className="text-gray-100 text-lg">
              These core principles guide everything we do at hello260
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Integrity",
                description: "We operate with the highest standards of honesty and ethics in all our interactions.",
                icon: <Leaf className="h-10 w-10 stroke-[1.5]" />,
                color: "from-green-500/30 to-transparent",
              },
              {
                title: "Care",
                description: "We genuinely care about the health and well-being of every patient we serve.",
                icon: <Users className="h-10 w-10 stroke-[1.5]" />,
                color: "from-blue-500/30 to-transparent",
              },
              {
                title: "Quality",
                description: "We guarantee the quality and safety of all our pharmaceutical products.",
                icon: <Award className="h-10 w-10 stroke-[1.5]" />,
                color: "from-yellow-500/30 to-transparent",
              },
              {
                title: "Excellence",
                description: "We strive for excellence in our service delivery and professional advice.",
                icon: <Sparkles className="h-10 w-10 stroke-[1.5]" />,
                color: "from-purple-500/30 to-transparent",
              },
            ].map((value, index) => (
              <div 
                key={index} 
                className="group relative text-center p-8 rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${value.color}`}></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 text-white">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section id="journey" className="py-16">
        <div className="container-custom">
          <h2 className="heading-lg text-center mb-12">Our Journey</h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-hello260-green-light/30"></div>
            
            <div className="space-y-12">
              {[
                {
                  year: "2022",
                  title: "The Beginning",
                  description: "Established hello260 Pharmacy with a vision to provide accessible healthcare to our community.",
                },
                {
                  year: "2023",
                  title: "Growing Services",
                  description: "Expanded our services to include health consultations and a wider range of essential medications.",
                },
                {
                  year: "2024",
                  title: "Excellence Award",
                  description: "Recognized for outstanding pharmaceutical service and patient care in Lusaka.",
                },
                {
                  year: "2025",
                  title: "Digital Transformation",
                  description: "Launched our online store to bring healthcare products directly to your doorstep.",
                },
              ].map((milestone, index) => (
                <div key={index} className="relative flex flex-col md:flex-row">
                  <div className={`md:w-1/2 ${
                    index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:ml-auto"
                  }`}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="inline-block bg-hello260-green-light/20 px-3 py-1 rounded-full text-hello260-green font-medium text-sm mb-3">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute top-8 left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full bg-hello260-green"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="bg-gray-50 py-16">
        <div className="container-custom">
          <h2 className="heading-lg text-center mb-4">Our Team</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Meet some of the amazing women who make hello260 possible
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Peter Chewe",
                role: "Team Member",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Peter",
              },
              {
                name: "Martin Nyemba",
                role: "Team Member",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Martin",
              },
              {
                name: "Anurag Gupta",
                role: "Team Member",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anurag",
              },
              {
                name: "Oneous Mality",
                role: "Team Member",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oneous",
              }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="h-48 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4">
                  {/* This will be replaced with actual team member images */}
                  <img 
                    src={member.image.startsWith('/') || member.image.startsWith('http') ? member.image : `/team/${member.image}.jpg`}
                    alt={`${member.name} - ${member.role}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-hello260-green">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-hello260-cream">
        <div className="container-custom text-center">
          <h2 className="heading-lg mb-4">Join Our Journey</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Through our efforts, hello260 stands as a beacon of empowerment, sustainability, and innovation, inspiring positive change for women and the environment alike.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products">
              <Button className="bg-hello260-green hover:bg-hello260-green/90 text-white">
                Shop Our Products
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-hello260-green text-hello260-green hover:bg-hello260-green hover:text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
