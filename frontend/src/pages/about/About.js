import React, { useEffect, useState } from 'react';
import { aboutAPI } from '../../services/api';

function About() {
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    aboutAPI.getAboutData()
      .then(response => setAboutData(response.data))
      .catch(error => console.error('Error fetching about data:', error));
  }, []);

  return (
    <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About Me</h1>
        
        {aboutData ? (
          <>
            <div className="bg-gradient-to-r from-primary-green/10 to-primary-orange/10 rounded-2xl p-8 mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                {aboutData.bio}
              </p>
              <p className="text-gray-600 mt-4 font-medium">
                {aboutData.experience}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-primary-green w-1 h-8 mr-3 rounded"></span>
                Technical Skills
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {aboutData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-primary-green hover:shadow-lg transition-all duration-200"
                  >
                    <span className="text-gray-700 font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-primary-green to-dark-green text-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-sm">Chatbots Deployed</div>
              </div>
              <div className="bg-gradient-to-br from-primary-orange to-dark-orange text-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-sm">Client Satisfaction</div>
              </div>
              <div className="bg-gradient-to-br from-primary-green to-primary-orange text-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-sm">Support Available</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-primary-orange w-1 h-8 mr-3 rounded"></span>
                My Approach
              </h2>
              <div className="space-y-4">
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
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default About;