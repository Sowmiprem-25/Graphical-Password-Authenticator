import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Brain, Grid, Lock, ArrowRight, Activity, ScanFace, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="card-hover p-8 border border-gray-100 flex flex-col items-center text-center group"
  >
    <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-secondary blur-3xl mix-blend-multiply" />
          <div className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-accent blur-3xl mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-secondary mb-6 shadow-sm border border-secondary/20 px-4 py-1.5 text-sm uppercase tracking-wider">
              Next-Gen Authentication
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary mb-6 tracking-tight">
              Memory-Assisted <br className="hidden md:block" />
              Graphical Password
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
              Replace traditional text passwords with a secure, brain-friendly graphical sequence mapped to your personal memory cues.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register" className="btn-primary group w-full sm:w-auto text-lg px-8 py-4">
                Get Started Securely
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-outline w-full sm:w-auto text-lg px-8 py-4 bg-white/50 backdrop-blur-sm">
                Login Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How GraPHAuth Works</h2>
            <div className="w-24 h-1 bg-secondary mx-auto rounded-full mb-8" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -z-10" />

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white border-4 border-primary shadow-xl flex items-center justify-center text-2xl font-bold text-primary mb-6 z-10">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Define Cues</h3>
              <p className="text-gray-500">Pick 3-5 personal memory anchors (like 'pet22' or 'A14').</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white border-4 border-secondary shadow-xl flex items-center justify-center text-2xl font-bold text-secondary mb-6 z-10">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Map Images</h3>
              <p className="text-gray-500">Select exactly one unique image for each of your cues.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white border-4 border-accent shadow-xl flex items-center justify-center text-2xl font-bold text-amber-600 mb-6 z-10">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Login Securely</h3>
              <p className="text-gray-500">Click your sequence from a shuffled grid to authenticate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Security Features</h2>
            <div className="w-24 h-1 bg-secondary mx-auto rounded-full mb-8" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="Memory Anchors"
              description="Uses multiple abstract string cues instead of just a birthday or PIN."
              delay={0.1}
            />
            <FeatureCard
              icon={Grid}
              title="Grid Shuffling"
              description="The 4x4 image grid randomizes positions on every login attempt."
              delay={0.2}
            />
            <FeatureCard
              icon={Lock}
              title="Decoy Injection"
              description="Fills the grid with randomized decoy images to thwart shoulder surfing."
              delay={0.3}
            />
            <FeatureCard
              icon={Shield}
              title="Zero Storage"
              description="We never store your raw cues or image sequence—only robust bcrypt hashes."
              delay={0.4}
            />
            <FeatureCard
              icon={Activity}
              title="Rate Limiting & Locks"
              description="Automatically blocks brute force attempts and flags suspicious patterns."
              delay={0.5}
            />
            <FeatureCard
              icon={ScanFace}
              title="Audit Trails"
              description="Comprehensive tracking of login attempts and security events."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Ready to stop typing passwords?</h2>
          <p className="text-xl text-primary-100 mb-10">
            Join the Graphical Authentication revolution today and secure your account faster and more reliably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to="/register" className="btn-accent text-lg px-8 py-4 shadow-lg flex items-center justify-center gap-2 group">
                Create Free Account
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
