import React, { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import EnhancedChatbot from './pages/chatbot/EnhancedChatbot';
import { homeAPI, aboutAPI, projectsAPI } from './services/api';

// Debug component wrapper that adds visual indicators
const DebugWrapper = ({ name, layer = 0, type = 'component', children, className = '' }) => {
  const colors = [
    'border-red-500 bg-red-50',
    'border-blue-500 bg-blue-50',
    'border-green-500 bg-green-50',
    'border-purple-500 bg-purple-50',
    'border-yellow-500 bg-yellow-50',
    'border-pink-500 bg-pink-50',
  ];
  
  const borderColor = colors[layer % colors.length];
  
  return (
    <div className={`relative border-4 ${borderColor} p-2 m-2 ${className}`}>
      <div className="absolute -top-6 left-0 bg-black text-white px-2 py-1 text-xs font-mono z-50">
        {name} | Layer: {layer} | Type: {type}
      </div>
      <div className="absolute -top-6 right-0 bg-orange-600 text-white px-2 py-1 text-xs font-mono z-50">
        {type === 'section' ? 'SECTION' : type === 'container' ? 'CONTAINER' : 'COMPONENT'}
      </div>
      {children}
    </div>
  );
};

// Component tree display
const ComponentTree = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  const tree = [
    { name: 'App.js (Root)', level: 0 },
    { name: '├─ Navigation (Fixed Header)', level: 1 },
    { name: '├─ Home Section', level: 1 },
    { name: '│  ├─ Hero Container', level: 2 },
    { name: '│  │  ├─ Text Content', level: 3 },
    { name: '│  │  └─ Visual Demo Box', level: 3 },
    { name: '│  └─ Features Grid', level: 2 },
    { name: '│     ├─ Custom Chatbots Card', level: 3 },
    { name: '│     ├─ AI Integration Card', level: 3 },
    { name: '│     └─ Fast Development Card', level: 3 },
    { name: '├─ About Section', level: 1 },
    { name: '│  ├─ Bio Container', level: 2 },
    { name: '│  ├─ Skills Grid', level: 2 },
    { name: '│  ├─ Stats Cards', level: 2 },
    { name: '│  └─ Approach Steps', level: 2 },
    { name: '├─ Projects Section', level: 1 },
    { name: '│  └─ Project Cards Grid', level: 2 },
    { name: '├─ Chatbot Demo Section', level: 1 },
    { name: '│  └─ EnhancedChatbot Component', level: 2 },
    { name: '└─ CTA Section', level: 1 },
  ];
  
  return (
    <div className="fixed top-20 right-4 bg-black text-green-400 p-4 rounded-lg font-mono text-xs z-50 max-w-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-green-300 mb-2"
      >
        {isOpen ? '[-]' : '[+]'} Component Tree
      </button>
      {isOpen && (
        <div className="space-y-1">
          {tree.map((item, index) => (
            <div key={index} style={{ paddingLeft: `${item.level * 16}px` }}>
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Grid overlay for visual alignment
const GridOverlay = () => {
  const [showGrid, setShowGrid] = useState(true);
  
  return (
    <>
      <button
        onClick={() => setShowGrid(!showGrid)}
        className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded z-50 font-mono text-xs"
      >
        {showGrid ? 'Hide' : 'Show'} Grid
      </button>
      {showGrid && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 grid grid-cols-12 gap-0">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-gray-300 opacity-20 h-full">
                <span className="absolute top-2 left-1 text-xs text-gray-600 bg-white px-1">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  const [homeData, setHomeData] = useState(null);
  const [aboutData, setAboutData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showDebugInfo, setShowDebugInfo] = useState(true);

  useEffect(() => {
    // Fetch all data
    homeAPI.getHomeData()
      .then(response => setHomeData(response.data))
      .catch(error => console.error('Error fetching home data:', error));
    
    aboutAPI.getAboutData()
      .then(response => setAboutData(response.data))
      .catch(error => console.error('Error fetching about data:', error));
    
    projectsAPI.getProjects()
      .then(response => setProjects(response.data))
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Debug Controls */}
      <div className="fixed top-4 left-4 bg-black text-white p-4 rounded z-50 space-y-2">
        <h3 className="font-mono text-xs mb-2">DEBUG CONTROLS</h3>
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="block w-full text-left px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
        >
          {showDebugInfo ? 'Hide' : 'Show'} Debug Info
        </button>
        <div className="text-xs space-y-1 mt-2">
          <div>Viewport: {window.innerWidth}x{window.innerHeight}</div>
          <div>Scroll: {window.scrollY}px</div>
        </div>
      </div>

      {/* Component Tree Display */}
      <ComponentTree />
      
      {/* Grid Overlay */}
      <GridOverlay />

      {/* Navigation with debug wrapper */}
      {showDebugInfo ? (
        <DebugWrapper name="Navigation" layer={1} type="component">
          <Navigation />
        </DebugWrapper>
      ) : (
        <Navigation />
      )}
      
      {/* Home Section */}
      <DebugWrapper name="HOME SECTION" layer={1} type="section">
        <section id="home" className="min-h-screen pt-16">
          <DebugWrapper name="Hero Container" layer={2} type="container">
            <div className="relative bg-white pt-20 pb-32 px-4 sm:px-6 lg:px-8">
              <DebugWrapper name="Max Width Container (max-w-7xl)" layer={3} type="container">
                <div className="max-w-7xl mx-auto">
                  <DebugWrapper name="Grid Layout (2 cols on lg)" layer={4} type="container">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                      <DebugWrapper name="Text Content Column" layer={5} type="component">
                        <div className="mb-12 lg:mb-0">
                          <DebugWrapper name="H1 Title" layer={6}>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                              {homeData?.title || 'Welcome to My Portfolio'}
                            </h1>
                          </DebugWrapper>
                          <DebugWrapper name="H2 Subtitle" layer={6}>
                            <h2 className="text-xl sm:text-2xl text-gray-600 mb-8">
                              {homeData?.subtitle || 'Chatbot Developer & AI Solutions Expert'}
                            </h2>
                          </DebugWrapper>
                          <DebugWrapper name="Description Paragraph" layer={6}>
                            <p className="text-lg text-gray-700 mb-8">
                              {homeData?.description || 'I specialize in creating intelligent chatbots and AI-powered solutions'}
                            </p>
                          </DebugWrapper>
                          <DebugWrapper name="CTA Button Group" layer={6}>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <a
                                href="#projects"
                                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary-green hover:bg-dark-green rounded-lg transition-colors duration-200"
                              >
                                View My Work
                              </a>
                              <a
                                href="#chatbot-demo"
                                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-primary-orange bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                              >
                                Try Chatbot Demo
                              </a>
                            </div>
                          </DebugWrapper>
                        </div>
                      </DebugWrapper>
                      <DebugWrapper name="Visual Demo Column" layer={5} type="component">
                        <div className="relative">
                          <DebugWrapper name="Aspect Ratio Container" layer={6}>
                            <div className="aspect-w-16 aspect-h-9">
                              <DebugWrapper name="Gradient Background Box" layer={7}>
                                <div className="bg-gradient-to-br from-primary-green to-primary-orange rounded-2xl p-8 shadow-2xl">
                                  <DebugWrapper name="White Inner Box (Fake Browser)" layer={8}>
                                    <div className="bg-white rounded-lg p-6 space-y-4">
                                      <DebugWrapper name="Browser Dots" layer={9}>
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        </div>
                                      </DebugWrapper>
                                      <DebugWrapper name="Fake Content Lines" layer={9}>
                                        <div className="space-y-2">
                                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                        </div>
                                      </DebugWrapper>
                                    </div>
                                  </DebugWrapper>
                                </div>
                              </DebugWrapper>
                            </div>
                          </DebugWrapper>
                        </div>
                      </DebugWrapper>
                    </div>
                  </DebugWrapper>
                </div>
              </DebugWrapper>
            </div>
          </DebugWrapper>

          {/* Features Section */}
          <DebugWrapper name="Features Container" layer={2} type="container">
            <div className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
              <DebugWrapper name="Features Max Width Container" layer={3} type="container">
                <div className="max-w-7xl mx-auto">
                  <DebugWrapper name="Features Title" layer={4}>
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                      What I Offer
                    </h2>
                  </DebugWrapper>
                  <DebugWrapper name="Features Grid (3 cols)" layer={4} type="container">
                    <div className="grid md:grid-cols-3 gap-8">
                      <DebugWrapper name="Feature Card 1: Custom Chatbots" layer={5} type="component">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                          <DebugWrapper name="Icon Container" layer={6}>
                            <div className="w-12 h-12 bg-primary-green rounded-lg flex items-center justify-center mb-4">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            </div>
                          </DebugWrapper>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Chatbots</h3>
                          <p className="text-gray-600">Tailored conversational AI solutions for your business needs</p>
                        </div>
                      </DebugWrapper>
                      <DebugWrapper name="Feature Card 2: AI Integration" layer={5} type="component">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                          <DebugWrapper name="Icon Container" layer={6}>
                            <div className="w-12 h-12 bg-primary-orange rounded-lg flex items-center justify-center mb-4">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                          </DebugWrapper>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Integration</h3>
                          <p className="text-gray-600">Seamlessly integrate AI capabilities into your existing systems</p>
                        </div>
                      </DebugWrapper>
                      <DebugWrapper name="Feature Card 3: Fast Development" layer={5} type="component">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                          <DebugWrapper name="Icon Container" layer={6}>
                            <div className="w-12 h-12 bg-primary-green rounded-lg flex items-center justify-center mb-4">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          </DebugWrapper>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Development</h3>
                          <p className="text-gray-600">Rapid prototyping and deployment of AI solutions</p>
                        </div>
                      </DebugWrapper>
                    </div>
                  </DebugWrapper>
                </div>
              </DebugWrapper>
            </div>
          </DebugWrapper>
        </section>
      </DebugWrapper>

      {/* About Section */}
      <DebugWrapper name="ABOUT SECTION" layer={1} type="section">
        <section id="about" className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
          <DebugWrapper name="About Content Container (max-w-4xl)" layer={2} type="container">
            <div className="max-w-4xl mx-auto">
              <DebugWrapper name="About Title" layer={3}>
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About Me</h1>
              </DebugWrapper>
              
              {aboutData ? (
                <>
                  <DebugWrapper name="Bio Container" layer={3} type="component">
                    <div className="bg-gradient-to-r from-primary-green/10 to-primary-orange/10 rounded-2xl p-8 mb-12">
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {aboutData.bio}
                      </p>
                      <p className="text-gray-600 mt-4 font-medium">
                        {aboutData.experience}
                      </p>
                    </div>
                  </DebugWrapper>

                  <DebugWrapper name="Skills Section" layer={3} type="container">
                    <div className="mb-12">
                      <DebugWrapper name="Skills Title" layer={4}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                          <span className="bg-primary-green w-1 h-8 mr-3 rounded"></span>
                          Technical Skills
                        </h2>
                      </DebugWrapper>
                      <DebugWrapper name="Skills Grid (4 cols)" layer={4} type="container">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {aboutData.skills.map((skill, index) => (
                            <DebugWrapper key={index} name={`Skill: ${skill}`} layer={5} type="component">
                              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-primary-green hover:shadow-lg transition-all duration-200">
                                <span className="text-gray-700 font-medium">{skill}</span>
                              </div>
                            </DebugWrapper>
                          ))}
                        </div>
                      </DebugWrapper>
                    </div>
                  </DebugWrapper>

                  <DebugWrapper name="Stats Cards Container" layer={3} type="container">
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                      <DebugWrapper name="Stat Card 1" layer={4} type="component">
                        <div className="bg-gradient-to-br from-primary-green to-dark-green text-white rounded-xl p-6 text-center">
                          <div className="text-3xl font-bold mb-2">50+</div>
                          <div className="text-sm">Chatbots Deployed</div>
                        </div>
                      </DebugWrapper>
                      <DebugWrapper name="Stat Card 2" layer={4} type="component">
                        <div className="bg-gradient-to-br from-primary-orange to-dark-orange text-white rounded-xl p-6 text-center">
                          <div className="text-3xl font-bold mb-2">100%</div>
                          <div className="text-sm">Client Satisfaction</div>
                        </div>
                      </DebugWrapper>
                      <DebugWrapper name="Stat Card 3" layer={4} type="component">
                        <div className="bg-gradient-to-br from-primary-green to-primary-orange text-white rounded-xl p-6 text-center">
                          <div className="text-3xl font-bold mb-2">24/7</div>
                          <div className="text-sm">Support Available</div>
                        </div>
                      </DebugWrapper>
                    </div>
                  </DebugWrapper>

                  <DebugWrapper name="Approach Section" layer={3} type="container">
                    <div className="bg-gray-50 rounded-2xl p-8">
                      <DebugWrapper name="Approach Title" layer={4}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                          <span className="bg-primary-orange w-1 h-8 mr-3 rounded"></span>
                          My Approach
                        </h2>
                      </DebugWrapper>
                      <DebugWrapper name="Approach Steps List" layer={4} type="container">
                        <div className="space-y-4">
                          <DebugWrapper name="Step 1" layer={5} type="component">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary-green/20 rounded-full flex items-center justify-center">
                                  <span className="text-primary-green font-bold">1</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <h3 className="font-semibold text-gray-900">Understand Your Needs</h3>
                                <p className="text-gray-600">Deep dive into your business requirements and objectives</p>
                              </div>
                            </div>
                          </DebugWrapper>
                          <DebugWrapper name="Step 2" layer={5} type="component">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary-orange/20 rounded-full flex items-center justify-center">
                                  <span className="text-primary-orange font-bold">2</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <h3 className="font-semibold text-gray-900">Design & Prototype</h3>
                                <p className="text-gray-600">Create a tailored solution with iterative feedback</p>
                              </div>
                            </div>
                          </DebugWrapper>
                          <DebugWrapper name="Step 3" layer={5} type="component">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary-green/20 rounded-full flex items-center justify-center">
                                  <span className="text-primary-green font-bold">3</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <h3 className="font-semibold text-gray-900">Deploy & Optimize</h3>
                                <p className="text-gray-600">Launch your solution and continuously improve performance</p>
                              </div>
                            </div>
                          </DebugWrapper>
                        </div>
                      </DebugWrapper>
                    </div>
                  </DebugWrapper>
                </>
              ) : (
                <DebugWrapper name="Loading Spinner" layer={3} type="component">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
                  </div>
                </DebugWrapper>
              )}
            </div>
          </DebugWrapper>
        </section>
      </DebugWrapper>

      {/* Projects Section */}
      <DebugWrapper name="PROJECTS SECTION" layer={1} type="section">
        <section id="projects" className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
          <DebugWrapper name="Projects Container (max-w-7xl)" layer={2} type="container">
            <div className="max-w-7xl mx-auto">
              <DebugWrapper name="Projects Header" layer={3} type="component">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">My Projects</h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Explore my portfolio of chatbot solutions and AI integrations that have helped businesses enhance their customer experience
                  </p>
                </div>
              </DebugWrapper>

              <DebugWrapper name="Projects Grid (3 cols)" layer={3} type="container">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map(project => (
                    <DebugWrapper key={project.id} name={`Project Card: ${project.title}`} layer={4} type="component">
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                        <DebugWrapper name="Project Image Placeholder" layer={5}>
                          <div className="h-48 bg-gradient-to-br from-primary-green to-primary-orange flex items-center justify-center">
                            <svg className="w-24 h-24 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </div>
                        </DebugWrapper>
                        <DebugWrapper name="Project Content" layer={5} type="container">
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                            <p className="text-gray-600 mb-4">{project.description}</p>
                            <DebugWrapper name="Tech Tags" layer={6}>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {project.technologies.map((tech, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </DebugWrapper>
                            <DebugWrapper name="Project Actions" layer={6}>
                              <div className="flex items-center justify-between">
                                <button className="text-primary-green hover:text-dark-green font-medium text-sm transition-colors">
                                  View Details →
                                </button>
                                {project.link && project.link !== "#" && (
                                  <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-orange hover:text-dark-orange font-medium text-sm transition-colors"
                                  >
                                    Live Demo
                                  </a>
                                )}
                              </div>
                            </DebugWrapper>
                          </div>
                        </DebugWrapper>
                      </div>
                    </DebugWrapper>
                  ))}
                </div>
              </DebugWrapper>

              <DebugWrapper name="More Projects CTA" layer={3} type="component">
                <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Want to see more projects?
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    I've worked on numerous other chatbot implementations and AI solutions. Contact me to discuss your specific needs and see relevant case studies.
                  </p>
                  <button className="bg-gradient-to-r from-primary-green to-primary-orange text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                    Get in Touch
                  </button>
                </div>
              </DebugWrapper>
            </div>
          </DebugWrapper>
        </section>
      </DebugWrapper>

      {/* Enhanced Chatbot Demo Section */}
      <DebugWrapper name="CHATBOT DEMO SECTION" layer={1} type="section">
        <section id="chatbot-demo" className="min-h-screen bg-white py-20">
          <DebugWrapper name="EnhancedChatbot Component" layer={2} type="component">
            <EnhancedChatbot />
          </DebugWrapper>
        </section>
      </DebugWrapper>

      {/* CTA Section */}
      <DebugWrapper name="CTA SECTION (Final)" layer={1} type="section">
        <section className="bg-gradient-to-r from-primary-green to-primary-orange py-16 px-4 sm:px-6 lg:px-8">
          <DebugWrapper name="CTA Content Container" layer={2} type="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Business with AI?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Let's discuss how chatbots can revolutionize your customer experience
              </p>
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-primary-green bg-white hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Get In Touch
              </a>
            </div>
          </DebugWrapper>
        </section>
      </DebugWrapper>
    </div>
  );
}

export default App;