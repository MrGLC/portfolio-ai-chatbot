import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homeAPI } from '../../services/api';
import ChatWidget from '../../components/ChatWidget';

function Home() {
  const [homeData, setHomeData] = useState(null);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  useEffect(() => {
    homeAPI.getHomeData()
      .then(response => setHomeData(response.data))
      .catch(error => console.error('Error fetching home data:', error));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-12 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {homeData?.title || 'Welcome to My Portfolio'}
              </h1>
              <h2 className="text-xl sm:text-2xl text-gray-600 mb-8">
                {homeData?.subtitle || 'Chatbot Developer & AI Solutions Expert'}
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                {homeData?.description || 'I specialize in creating intelligent chatbots and AI-powered solutions'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/projects"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary-green hover:bg-dark-green rounded-lg transition-colors duration-200"
                >
                  View My Work
                </Link>
                <Link
                  to="/chatbot-demo"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-primary-orange bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                >
                  Try Chatbot Demo
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9">
                <div className="bg-gradient-to-br from-primary-green to-primary-orange rounded-2xl p-8 shadow-2xl">
                  <div className="bg-white rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What I Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-green rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Chatbots</h3>
              <p className="text-gray-600">Tailored conversational AI solutions for your business needs</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-orange rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Integration</h3>
              <p className="text-gray-600">Seamlessly integrate AI capabilities into your existing systems</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-green rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Development</h3>
              <p className="text-gray-600">Rapid prototyping and deployment of AI solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-green to-primary-orange py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business with AI?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Let's discuss how chatbots can revolutionize your customer experience
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-primary-green bg-white hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            Get In Touch
          </Link>
        </div>
      </section>
      
      {/* Chat Widget */}
      <ChatWidget 
        isOpen={chatWidgetOpen} 
        onToggle={() => setChatWidgetOpen(!chatWidgetOpen)} 
      />
    </div>
  );
}

export default Home;