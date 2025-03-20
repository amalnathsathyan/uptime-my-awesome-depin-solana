"use client"
import React from 'react';
import { Activity, Shield, Globe, Clock, Server, Lock } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6">
            Decentralized Uptime Monitoring
            <span className="text-emerald-400"> on Solana</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Trust the blockchain, not a single provider. Our decentralized network of validators ensures
            your services are always monitored with unmatched reliability and transparency.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Start Monitoring
            </button>
            <button className="border border-emerald-500 hover:bg-emerald-500/10 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800/50 py-24" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose UptimeGuard?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-emerald-400" />}
              title="Decentralized Security"
              description="No single point of failure. Our network of validators ensures reliable monitoring."
            />
            <FeatureCard
              icon={<Globe className="w-12 h-12 text-emerald-400" />}
              title="Global Coverage"
              description="Monitors deployed worldwide for accurate uptime verification."
            />
            <FeatureCard
              icon={<Clock className="w-12 h-12 text-emerald-400" />}
              title="Real-time Alerts"
              description="Instant notifications when issues are detected by our validator network."
            />
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="container mx-auto px-4 py-24" id="how-it-works">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
              alt="Network Visualization"
              className="rounded-lg shadow-2xl"
            />
          </div>
          <div className="space-y-8">
            <Step
              icon={<Server className="w-6 h-6 text-emerald-400" />}
              title="1. Deploy Validators"
              description="Our network of validators is distributed across the globe, ready to monitor your services."
            />
            <Step
              icon={<Activity className="w-6 h-6 text-emerald-400" />}
              title="2. Continuous Monitoring"
              description="Validators constantly check your service's availability and performance."
            />
            <Step
              icon={<Lock className="w-6 h-6 text-emerald-400" />}
              title="3. Blockchain Verification"
              description="Results are recorded on Solana blockchain, ensuring transparency and immutability."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-500">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join the future of uptime monitoring. Start protecting your services with blockchain-powered reliability.
          </p>
          <button className="bg-white text-emerald-500 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800 p-8 rounded-lg text-center hover:transform hover:-translate-y-1 transition-transform">
      <div className="flex justify-center mb-6">{icon}</div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function Step({ icon, title, description }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-gray-800 p-3 rounded-lg">{icon}</div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export default App;