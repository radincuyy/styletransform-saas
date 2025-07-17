import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Upload, Wand2, Zap, Palette, Image, Layers } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import analytics from '../utils/analytics';
import SEOHead, { seoConfigs } from '../components/SEOHead';

function Landing() {
  const { currentUser } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Statistics data with animated counters
  const statsData = [
    { number: 52847, label: "Images Generated", icon: "🎨", suffix: "+" },
    { number: 12543, label: "Happy Users", icon: "😊", suffix: "+" },
    { number: 99.9, label: "Uptime", icon: "⚡", suffix: "%" },
    { number: 4.9, label: "User Rating", icon: "⭐", suffix: "/5" }
  ];

  // Counter animation hook
  const [counters, setCounters] = useState(statsData.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);

  // Services data
  const services = [
    {
      icon: <Wand2 className="h-8 w-8 text-blue-500" />,
      title: "Text to Image",
      description: "Generate stunning images from text descriptions. Perfect for character references and creative concepts.",
      link: "/text-to-image",
      color: "blue"
    },
    {
      icon: <Upload className="h-8 w-8 text-green-500" />,
      title: "Image Editor",
      description: "Transform your existing images with AI. Change styles, colors, backgrounds, and more.",
      link: "/image-to-image",
      color: "green"
    }
  ];





  // Demo gallery with real before/after transformation examples
  const demoGallery = [
    {
      id: 1,
      category: "Portrait",
      before: "https://res.cloudinary.com/dtoctrewj/image/upload/v1752735252/pexels-vinicius-wiesehofer-289347-1130626_vtb3ss.jpg",
      after: "https://res.cloudinary.com/dtoctrewj/image/upload/v1752735454/image-to-image-1752735443566_pwrono.jpg",
      style: "Professional Headshot",
      prompt: "Transform casual photo into professional business headshot with studio lighting",
      transformation: "Style Enhancement",
      description: "Casual selfie → Professional headshot"
    },
    {
      id: 2,
      category: "Landscape",
      before: "https://res.cloudinary.com/dtoctrewj/image/upload/v1752757562/pexels-simon73-1323550_i48hxg.jpg",
      after: "https://res.cloudinary.com/dtoctrewj/image/upload/v1752758477/image-to-image-1752758434724_u4tfrq.jpg",
      style: "Fantasy Landscape",
      prompt: "Transform regular mountain landscape into mystical fantasy world with ethereal lighting and magical atmosphere",
      transformation: "Style Transfer",
      description: "Mountain landscape → Fantasy realm"
    },
    {
      id: 3,
      category: "Character",
      before: "https://res.cloudinary.com/dtoctrewj/image/upload/v1752757787/ayo-ogunseinde-6W4F62sN_yI-unsplash_s4rtkq.jpg",
      after: "https://res.cloudinary.com/dtoctrewj/image/upload/v1752758291/image-to-image-1752758270494_r1g7ed.jpg",
      style: "Anime Character",
      prompt: "Transform portrait photo into anime-style character with vibrant colors and detailed anime features",
      transformation: "Style Transfer",
      description: "Portrait photo → Anime character"
    }
  ];

  // Demo gallery modal state
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonSlider, setComparisonSlider] = useState(50);

  // Counter animation function
  const animateCounters = () => {
    if (hasAnimated) return;
    setHasAnimated(true);

    statsData.forEach((stat, index) => {
      let start = 0;
      const end = stat.number;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCounters(prev => {
            const newCounters = [...prev];
            newCounters[index] = end;
            return newCounters;
          });
          clearInterval(timer);
        } else {
          setCounters(prev => {
            const newCounters = [...prev];
            newCounters[index] = Math.floor(start);
            return newCounters;
          });
        }
      }, 16);
    });
  };

  // Handle demo gallery interactions
  const handleViewTransform = (demo) => {
    setSelectedDemo(demo);
    setShowComparison(true);
    setComparisonSlider(50);
    analytics.trackEngagement('demo_gallery_viewed', { demoId: demo.id, style: demo.style });
  };

  const closeComparison = () => {
    setShowComparison(false);
    setSelectedDemo(null);
    setComparisonSlider(50);
  };

  // Track page view and user engagement
  useEffect(() => {
    analytics.trackPageView('/', 'Home - StyleTransform');
    if (currentUser) {
      analytics.setUserId(currentUser.uid);
    }
    analytics.trackEngagement('landing_page_viewed');
  }, [currentUser]);

  // Mouse tracking for 3D effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <SEOHead {...seoConfigs.home} />
      <div className="min-h-screen overflow-hidden">
        {/* 3D Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20"></div>
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl"
            animate={{
              x: mousePosition.x * 20,
              y: mousePosition.y * 20,
              rotate: mousePosition.x * 10
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400/30 to-teal-400/30 rounded-full blur-xl"
            animate={{
              x: mousePosition.x * -15,
              y: mousePosition.y * -15,
              rotate: mousePosition.x * -8
            }}
            transition={{ type: "spring", stiffness: 40, damping: 25 }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-teal-400/30 to-green-400/30 rounded-full blur-xl"
            animate={{
              x: mousePosition.x * 25,
              y: mousePosition.y * -20,
              rotate: mousePosition.y * 12
            }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
          />
        </div>

        {/* Hero Section with 3D Effects */}
        <motion.section
          className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          style={{ y: y1, opacity }}
        >
          {/* Glassmorphism Container */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 border border-white/20 shadow-2xl"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                transform: window.innerWidth > 768 ? `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg)` : 'none'
              }}
            >
              {/* 3D Floating Icons */}
              <div className="absolute -top-6 -left-6">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              </div>

              <div className="absolute -top-6 -right-6">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg"
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
              </div>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Transform Your Style
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400 bg-clip-text text-transparent">
                  with AI Magic
                </span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Upload your photo or describe your vision. Our AI creates stunning transformations
                with professional presets and cutting-edge technology.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {currentUser ? (
                  <motion.div
                    whileHover={{ scale: 1.05, rotateX: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/dashboard"
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                    >
                      <span className="relative z-10">Go to Dashboard</span>
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05, rotateX: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/register"
                        className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                      >
                        <span className="relative z-10">Start Creating</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Link>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, rotateX: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4"
                    >
                      <Link
                        to="/login"
                        className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* 3D Floating Elements */}
          <motion.div
            className="absolute top-1/4 left-10 hidden lg:block"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <Palette className="w-8 h-8 text-purple-300" />
            </div>
          </motion.div>

          <motion.div
            className="absolute top-1/3 right-10 hidden lg:block"
            animate={{
              y: [0, -25, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <Image className="w-8 h-8 text-blue-300" />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-1/4 left-1/4 hidden lg:block"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 15, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <Layers className="w-8 h-8 text-teal-300" />
            </div>
          </motion.div>
        </motion.section>

        {/* 🎯 Statistics Counter Section */}
        <motion.section
          className="py-16 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          onViewportEnter={animateCounters}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-teal-600/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-12"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Trusted by Thousands Worldwide
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Join our growing community of creators and transform your vision into reality
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {statsData.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center group"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div
                    className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl"
                    whileHover={{
                      background: 'rgba(255,255,255,0.15)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
                    }}
                  >
                    {/* 3D Icon */}
                    <motion.div
                      className="text-4xl mb-4"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    >
                      {stat.icon}
                    </motion.div>

                    {/* Animated Counter */}
                    <motion.div
                      className="text-3xl sm:text-4xl font-bold text-white mb-2"
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.suffix === '%' || stat.suffix === '/5'
                        ? counters[index].toFixed(1)
                        : counters[index].toLocaleString()
                      }{stat.suffix}
                    </motion.div>

                    <p className="text-white/80 font-medium text-sm sm:text-base">
                      {stat.label}
                    </p>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 3D Services Section */}
        <motion.section
          className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
          style={{ y: y2 }}
        >
          {/* Background 3D Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-r from-teal-200/30 to-green-200/30 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-6">
                Powerful AI Tools
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Choose from our suite of AI-powered tools to bring your creative vision to life
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ opacity: 0, y: 50, rotateX: -20 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -10,
                    rotateX: 10,
                    scale: 1.02
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* 3D Service Card */}
                  <div className="relative backdrop-blur-xl bg-white/80 rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden">

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color === 'blue'
                      ? 'from-blue-500/5 via-purple-500/5 to-transparent'
                      : 'from-green-500/5 via-teal-500/5 to-transparent'
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                    {/* 3D Icon Container */}
                    <motion.div
                      className={`relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl ${service.color === 'blue'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                        : 'bg-gradient-to-r from-green-500 to-teal-600'
                        } flex items-center justify-center shadow-lg`}
                      whileHover={{
                        rotateX: 360,
                        scale: 1.1
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      {React.cloneElement(service.icon, {
                        className: "h-10 w-10 text-white"
                      })}

                      {/* Icon Glow Effect */}
                      <div className={`absolute inset-0 rounded-2xl ${service.color === 'blue'
                        ? 'bg-gradient-to-r from-blue-400 to-purple-500'
                        : 'bg-gradient-to-r from-green-400 to-teal-500'
                        } opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500`}></div>
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center relative z-10">
                      {service.title}
                    </h3>

                    <p className="text-gray-600 text-center leading-relaxed mb-6 relative z-10">
                      {service.description}
                    </p>

                    {/* 3D CTA Button */}
                    <motion.div
                      className="text-center relative z-10"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={currentUser ? service.link : "/register"}
                        onClick={() => {
                          if (currentUser) {
                            analytics.trackEngagement('service_try_now_clicked', {
                              service: service.title,
                              link: service.link
                            });
                            console.log(`Navigating to ${service.link} for ${service.title}`);
                          } else {
                            analytics.trackEngagement('service_get_started_clicked', {
                              service: service.title,
                              from: 'services_section'
                            });
                            console.log(`User not logged in, redirecting to register from ${service.title}`);
                          }
                        }}
                        className={`group/btn relative inline-flex items-center px-6 py-3 ${service.color === 'blue'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                          : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'
                          } text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                        style={{
                          textDecoration: 'none',
                          touchAction: 'manipulation',
                          userSelect: 'none',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        <span className="relative z-10">
                          {currentUser ? "Try Now" : "Get Started"}
                        </span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        <div className={`absolute inset-0 ${service.color === 'blue'
                          ? 'bg-gradient-to-r from-blue-400 to-purple-500'
                          : 'bg-gradient-to-r from-green-400 to-teal-500'
                          } opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300`}></div>
                      </Link>
                    </motion.div>

                    {/* 3D Border Effect */}
                    <div className={`absolute inset-0 rounded-3xl border-2 ${service.color === 'blue'
                      ? 'border-blue-500/20 group-hover:border-blue-500/40'
                      : 'border-green-500/20 group-hover:border-green-500/40'
                      } transition-colors duration-500 pointer-events-none`}></div>
                  </div>

                  {/* 3D Shadow */}
                  <div className={`absolute inset-0 rounded-3xl ${service.color === 'blue'
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                    : 'bg-gradient-to-r from-green-500/10 to-teal-500/10'
                    } blur-xl transform translate-y-4 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none`}></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 🎬 Interactive Demo Gallery Section */}
        <motion.section
          className="py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-6">
                See the Magic in Action
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Witness stunning transformations created by our AI. From portraits to landscapes,
                see how our technology brings your vision to life.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {demoGallery.map((demo, index) => (
                <motion.div
                  key={demo.id}
                  className="group relative"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className="relative backdrop-blur-xl bg-white/80 rounded-2xl p-6 border border-white/20 shadow-xl overflow-hidden">
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold rounded-full">
                        {demo.category}
                      </span>
                    </div>

                    {/* Before/After Images */}
                    <div className="relative mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <motion.div
                        className="relative w-full aspect-[4/3]"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={demo.before}
                          alt="Before transformation"
                          className="w-full h-full object-cover rounded-xl"
                          style={{
                            objectPosition: 'center center'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face';
                          }}
                        />

                        {/* Hover Overlay with View Transform Button */}
                        <motion.div
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ opacity: 1 }}
                        >
                          <motion.button
                            onClick={() => handleViewTransform(demo)}
                            className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View Transform
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Style Info */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {demo.style}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {demo.description}
                      </p>
                      <div className="text-xs text-purple-600 font-medium">
                        {demo.transformation}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Modal for Before/After Comparison */}
        {showComparison && selectedDemo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeComparison}>
            <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedDemo.style}</h3>
                    <p className="text-purple-100 mt-1">{selectedDemo.description}</p>
                  </div>
                  <button onClick={closeComparison} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    ✕
                  </button>
                </div>
              </div>

              {/* Before/After Comparison */}
              <div className="p-6">
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden mb-6">
                  <div 
                    className="relative w-full min-h-[300px] max-h-[500px] flex cursor-ew-resize" 
                    onMouseMove={(e) => {
                      if (e.buttons === 1) { // Only when mouse is pressed
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                        setComparisonSlider(percentage);
                      }
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                      setComparisonSlider(percentage);
                    }}
                  >
                    {/* Before Image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={selectedDemo.before} 
                        alt="Before transformation" 
                        className="max-w-full max-h-full object-contain"
                        style={{ 
                          width: 'auto',
                          height: 'auto'
                        }}
                      />
                    </div>

                    {/* After Image with Slider */}
                    <div className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{ clipPath: `inset(0 ${100 - comparisonSlider}% 0 0)` }}>
                      <img 
                        src={selectedDemo.after} 
                        alt="After transformation" 
                        className="max-w-full max-h-full object-contain"
                        style={{ 
                          width: 'auto',
                          height: 'auto'
                        }}
                      />
                    </div>

                    {/* Interactive Slider Handle */}
                    <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10 select-none" style={{ left: `${comparisonSlider}%`, transform: 'translateX(-50%)' }}>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize">
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                      </div>
                    </div>

                    {/* Before/After Labels */}
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">Before</div>
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">After</div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">Click or drag to compare</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Link
                    to={currentUser ? "/dashboard" : "/register"}
                    onClick={() => {
                      closeComparison();
                      if (currentUser) {
                        analytics.trackEngagement('demo_try_style_clicked', { 
                          style: selectedDemo.style,
                          category: selectedDemo.category 
                        });
                      } else {
                        analytics.trackEngagement('demo_signup_clicked', { 
                          from: 'demo_modal',
                          style: selectedDemo.style 
                        });
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
                    style={{ textDecoration: 'none' }}
                  >
                    {currentUser ? "Try This Style" : "Sign Up to Try"}
                  </Link>
                  <button onClick={closeComparison} className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 Features Section */}
        <motion.section
          className="py-16 sm:py-20 bg-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                Why Choose StyleTransform?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Experience the future of AI-powered image transformation with our cutting-edge features
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />,
                  title: "Easy Upload",
                  description: "Simply upload your image or describe what you want to create. Our intuitive interface makes it effortless.",
                  color: "blue"
                },
                {
                  icon: <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />,
                  title: "AI Magic",
                  description: "Advanced AI algorithms analyze and transform your images with professional-quality results in seconds.",
                  color: "purple"
                },
                {
                  icon: <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />,
                  title: "24+ Presets",
                  description: "Choose from hairstyles, fashion, accessories, and aesthetic themes. Each preset is professionally crafted.",
                  color: "green"
                },
                {
                  icon: <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />,
                  title: "Lightning Fast",
                  description: "Get your transformed images in under 2 minutes. No waiting, no delays - just instant results.",
                  color: "yellow"
                },
                {
                  icon: <Image className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />,
                  title: "High Quality",
                  description: "Download your images in high resolution, perfect for social media, printing, or professional use.",
                  color: "pink"
                },
                {
                  icon: <Layers className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" />,
                  title: "Multiple Formats",
                  description: "Support for JPG, PNG, WebP formats. Compatible with all devices and platforms.",
                  color: "indigo"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Icon */}
                    <motion.div
                      className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-r ${
                        feature.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        feature.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        feature.color === 'green' ? 'from-green-500 to-green-600' :
                        feature.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                        feature.color === 'pink' ? 'from-pink-500 to-pink-600' :
                        'from-indigo-500 to-indigo-600'
                      } flex items-center justify-center shadow-lg`}
                      whileHover={{ rotateY: 180, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {React.cloneElement(feature.icon, {
                        className: "h-6 w-6 sm:h-8 sm:w-8 text-white"
                      })}
                    </motion.div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
                      {feature.title}
                    </h3>

                    <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Effect */}
                    <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${
                      feature.color === 'blue' ? 'from-blue-500/5 to-blue-600/5' :
                      feature.color === 'purple' ? 'from-purple-500/5 to-purple-600/5' :
                      feature.color === 'green' ? 'from-green-500/5 to-green-600/5' :
                      feature.color === 'yellow' ? 'from-yellow-500/5 to-yellow-600/5' :
                      feature.color === 'pink' ? 'from-pink-500/5 to-pink-600/5' :
                      'from-indigo-500/5 to-indigo-600/5'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 💬 Testimonials Section */}
        <motion.section
          className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                What Our Users Say
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join thousands of satisfied creators who have transformed their vision into reality
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Content Creator",
                  avatar: "https://images.pexels.com/photos/27523299/pexels-photo-27523299.jpeg",
                  text: "StyleTransform completely changed how I create content. The AI transformations are incredibly realistic and save me hours of editing time!",
                  rating: 5,
                  color: "purple"
                },
                {
                  name: "Mike Chen",
                  role: "Digital Artist",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                  text: "The quality is outstanding! I use it for character design and the results always exceed my expectations. Highly recommended!",
                  rating: 5,
                  color: "blue"
                },
                {
                  name: "Emma Davis",
                  role: "Social Media Manager",
                  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                  text: "Perfect for creating engaging social media content. The preset library is amazing and the interface is so user-friendly!",
                  rating: 5,
                  color: "teal"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Stars */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          ⭐
                        </motion.div>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed mb-6 sm:mb-8 italic">
                      "{testimonial.text}"
                    </p>

                    {/* User Info */}
                    <div className="flex items-center justify-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mr-4 border-2 border-gray-100"
                      />
                      <div className="text-center sm:text-left">
                        <h4 className="text-sm sm:text-base font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${
                      testimonial.color === 'purple' ? 'from-purple-500/5 to-purple-600/5' :
                      testimonial.color === 'blue' ? 'from-blue-500/5 to-blue-600/5' :
                      'from-teal-500/5 to-teal-600/5'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ❓ FAQ Section */}
        <motion.section
          className="py-16 sm:py-20 bg-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Everything you need to know about StyleTransform
              </p>
            </motion.div>

            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  question: "How does StyleTransform work?",
                  answer: "Simply upload your image or describe what you want to create. Our AI analyzes your input and generates stunning transformations using advanced machine learning algorithms. You can choose from 24+ professional presets or create custom transformations."
                },
                {
                  question: "What image formats are supported?",
                  answer: "We support JPG, PNG, and WebP formats. Images can be up to 10MB in size. For best results, we recommend high-quality images with good lighting and clear subjects."
                },
                {
                  question: "How long does it take to generate an image?",
                  answer: "Most transformations are completed within 1-2 minutes. Complex transformations may take slightly longer, but you'll always get professional-quality results worth the wait."
                },
                {
                  question: "Can I use the generated images commercially?",
                  answer: "Yes! All images generated through StyleTransform can be used for personal and commercial purposes. You own the rights to your creations and can use them however you'd like."
                },
                {
                  question: "Is there a free trial available?",
                  answer: "Yes! New users get 5 free generations to try our service. No credit card required. You can upgrade to premium for unlimited generations and advanced features."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="group"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                      {faq.question}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          className="py-16 sm:py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 relative overflow-hidden"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
                Ready to Transform?
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-purple-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of creators and start your AI transformation journey today
              </p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                {!currentUser && (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05, rotateX: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/register"
                        className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 font-bold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center text-base sm:text-lg"
                      >
                        <span className="relative z-10">Start Creating Free</span>
                        <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gray-100 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Link>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, rotateX: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4"
                    >
                      <Link
                        to="/login"
                        className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-bold rounded-xl sm:rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-base sm:text-lg"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* 📄 Footer */}
        <footer className="bg-gray-900 text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              {/* Brand */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  StyleTransform
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-6">
                  Transform your style with AI-powered image generation and editing. Create stunning visuals in seconds.
                </p>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">ST</span>
                  </div>
                </div>
              </div>

              {/* Product */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Product</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link to="/text-to-image" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Text to Image</Link></li>
                  <li><Link to="/image-to-image" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Image Editor</Link></li>
                  <li><Link to="/dashboard" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                  <li><span className="text-sm sm:text-base text-gray-400">Preset Library</span></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Company</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><span className="text-sm sm:text-base text-gray-400">About Us</span></li>
                  <li><span className="text-sm sm:text-base text-gray-400">Privacy Policy</span></li>
                  <li><span className="text-sm sm:text-base text-gray-400">Terms of Service</span></li>
                  <li><span className="text-sm sm:text-base text-gray-400">Contact</span></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Support</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><span className="text-sm sm:text-base text-gray-400">Help Center</span></li>
                  <li><span className="text-sm sm:text-base text-gray-400">Documentation</span></li>
                  <li><span className="text-sm sm:text-base text-gray-400">API Reference</span></li>
                  <li><span className="text-sm sm:text-base text-gray-400">Status</span></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-0">
                  © 2024 StyleTransform. All rights reserved.
                </p>
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <span className="text-xs sm:text-sm text-gray-400">Made with ❤️ by Radincuyy</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Landing;