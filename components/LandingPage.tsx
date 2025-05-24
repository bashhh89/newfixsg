'use client';

import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sg-light-mint to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-sg-bright-green/10 rounded-full mb-6">
                <svg className="w-10 h-10 text-sg-bright-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              
              {/* FREE Badge */}
              <div className="inline-flex items-center justify-center px-4 py-2 bg-sg-bright-green/20 border-2 border-sg-bright-green rounded-full mb-4">
                <span className="text-sg-bright-green font-bold text-lg">100% FREE</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-sg-dark-teal mb-6">
                Discover Your Organization's
                <span className="block text-sg-bright-green">AI Potential</span>
              </h1>
              <p className="text-xl md:text-2xl text-sg-dark-teal/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                Take our comprehensive <strong>FREE</strong> AI Efficiency Scorecard and receive a personalized, 
                AI-generated report with actionable insights to accelerate your digital transformation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="btn-primary-divine text-lg px-8 py-4 shadow-xl hover:shadow-2xl relative"
              >
                Start Your FREE AI Assessment
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <div className="flex items-center text-sg-dark-teal/70">
                <svg className="w-5 h-5 mr-2 text-sg-bright-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Takes 8-10 minutes</span>
              </div>
            </div>

            {/* Trust Indicators with FREE messaging */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-sg-dark-teal/60">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-sg-bright-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                100% FREE - No Cost
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-sg-bright-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure & Confidential
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-sg-bright-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI-Powered Insights
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sg-dark-teal mb-4">
              How It Works
            </h2>
            <p className="text-lg text-sg-dark-teal/80 max-w-2xl mx-auto">
              Our <strong>FREE</strong> AI-powered assessment evaluates your organization across key dimensions 
              and delivers personalized recommendations in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-sg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-sg-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-sg-bright-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-sg-dark-teal mb-4">Assess Your Current State</h3>
              <p className="text-sg-dark-teal/70 leading-relaxed">
                Answer 20 targeted questions about your organization's AI strategy, data readiness, 
                technology stack, team capabilities, and governance practices.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-sg-light-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-sg-light-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-sg-bright-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-sg-dark-teal mb-4">AI-Powered Analysis</h3>
              <p className="text-sg-dark-teal/70 leading-relaxed">
                Our advanced AI analyzes your responses against industry benchmarks and best practices 
                to determine your AI maturity tier and identify key opportunities.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-sg-bright-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-sg-bright-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-sg-bright-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-sg-dark-teal mb-4">Get Your Action Plan</h3>
              <p className="text-sg-dark-teal/70 leading-relaxed">
                Receive a comprehensive, personalized report with strategic recommendations, 
                implementation roadmap, and resources tailored to your industry and maturity level.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-sg-light-mint/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sg-dark-teal mb-4">
              Why Check Your AI Competencies?
            </h2>
            <p className="text-lg text-sg-dark-teal/80 max-w-2xl mx-auto">
              Understanding your AI maturity is crucial for staying competitive and making informed strategic decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-sg-bright-green/20">
              <div className="w-12 h-12 bg-sg-bright-green/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-sg-bright-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sg-dark-teal mb-3">Stay Competitive</h3>
              <p className="text-sg-dark-teal/70">
                Identify where your organization stands compared to industry leaders and discover 
                opportunities to gain competitive advantages through AI adoption.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-sg-bright-green/20">
              <div className="w-12 h-12 bg-sg-orange/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-sg-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sg-dark-teal mb-3">Make Smart Investments</h3>
              <p className="text-sg-dark-teal/70">
                Avoid costly mistakes by understanding your current capabilities and focusing 
                your AI investments on areas that will deliver the highest ROI.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-sg-bright-green/20">
              <div className="w-12 h-12 bg-sg-light-blue/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-sg-light-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sg-dark-teal mb-3">Accelerate Growth</h3>
              <p className="text-sg-dark-teal/70">
                Get a clear roadmap to advance your AI maturity faster, with prioritized 
                actions that build on your existing strengths and address critical gaps.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-sg-bright-green/20">
              <div className="w-12 h-12 bg-sg-bright-green/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-sg-bright-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sg-dark-teal mb-3">Reduce Risk</h3>
              <p className="text-sg-dark-teal/70">
                Identify potential risks and governance gaps before they become problems, 
                ensuring your AI initiatives are built on solid foundations.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-sg-bright-green/20">
              <div className="w-12 h-12 bg-sg-orange/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-sg-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sg-dark-teal mb-3">Align Your Team</h3>
              <p className="text-sg-dark-teal/70">
                Create shared understanding across leadership about AI priorities and 
                build consensus around your organization's AI transformation strategy.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-sg-bright-green/20">
              <div className="w-12 h-12 bg-sg-light-blue/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-sg-light-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sg-dark-teal mb-3">Future-Proof Your Business</h3>
              <p className="text-sg-dark-teal/70">
                Prepare your organization for the AI-driven future by understanding what 
                capabilities you need to develop and how to get there systematically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Discover Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sg-dark-teal mb-4">
              What You'll Discover
            </h2>
            <p className="text-lg text-sg-dark-teal/80 max-w-2xl mx-auto">
              Your personalized AI Efficiency Report will reveal key insights about your organization's AI journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sg-bright-green rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-sg-dark-teal mb-2">Your AI Maturity Tier</h3>
                  <p className="text-sg-dark-teal/70">
                    Discover whether you're a Dabbler, Enabler, or Leader in AI adoption, 
                    with detailed explanations of what this means for your organization.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sg-bright-green rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-sg-dark-teal mb-2">Strengths & Opportunities</h3>
                  <p className="text-sg-dark-teal/70">
                    Identify your organization's AI strengths to build upon and key areas 
                    where focused improvement can drive the biggest impact.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sg-bright-green rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-sg-dark-teal mb-2">Strategic Action Plan</h3>
                  <p className="text-sg-dark-teal/70">
                    Receive a prioritized roadmap with specific recommendations, 
                    implementation steps, and resources to advance your AI capabilities.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sg-bright-green rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-sg-dark-teal mb-2">Industry Benchmarks</h3>
                  <p className="text-sg-dark-teal/70">
                    See how your AI maturity compares to industry standards and 
                    understand what organizations at different tiers typically achieve.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="bg-gradient-to-br from-sg-light-mint to-white p-8 rounded-2xl shadow-xl border border-sg-bright-green/20">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-sg-bright-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-sg-bright-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-sg-dark-teal mb-2">Sample Report Preview</h3>
                  <p className="text-sm text-sg-dark-teal/70 mb-4">
                    Your comprehensive AI assessment report will include:
                  </p>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-sg-dark-teal/80">
                    <div className="w-2 h-2 bg-sg-bright-green rounded-full mr-3"></div>
                    Executive Summary & AI Tier Classification
                  </div>
                  <div className="flex items-center text-sg-dark-teal/80">
                    <div className="w-2 h-2 bg-sg-bright-green rounded-full mr-3"></div>
                    Detailed Strengths & Weakness Analysis
                  </div>
                  <div className="flex items-center text-sg-dark-teal/80">
                    <div className="w-2 h-2 bg-sg-bright-green rounded-full mr-3"></div>
                    Prioritized Strategic Action Plan
                  </div>
                  <div className="flex items-center text-sg-dark-teal/80">
                    <div className="w-2 h-2 bg-sg-bright-green rounded-full mr-3"></div>
                    Industry-Specific Resources & Tools
                  </div>
                  <div className="flex items-center text-sg-dark-teal/80">
                    <div className="w-2 h-2 bg-sg-bright-green rounded-full mr-3"></div>
                    Personalized Learning Path Recommendations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-sg-dark-teal to-sg-dark-teal/90">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-sg-bright-green/20 border-2 border-sg-bright-green rounded-full mb-6">
            <span className="text-sg-bright-green font-bold text-xl">COMPLETELY FREE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Unlock Your AI Potential?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join organizations worldwide who are using AI to transform their operations. 
            Start your <strong>FREE</strong> assessment now and get your personalized roadmap in minutes.
          </p>
          
          <button
            onClick={onGetStarted}
            className="bg-sg-bright-green text-sg-dark-teal font-bold text-lg px-10 py-4 rounded-divine shadow-xl hover:shadow-2xl hover:bg-sg-bright-green/90 transition-all duration-300 transform hover:-translate-y-1"
          >
            Begin Your FREE AI Assessment
            <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-6 text-white/80">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              No Credit Card Required
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant Access
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Download Your Report
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
