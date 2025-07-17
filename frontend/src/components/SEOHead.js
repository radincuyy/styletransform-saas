import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title = 'StyleTransform - AI Style Transformation',
  description = 'Transform your style with AI-powered image generation. Upload your photo and see how you\'d look with different hairstyles, clothing, and accessories.',
  keywords = 'AI style transformation, image generation, style transfer, AI fashion, virtual styling, photo editing',
  image = '/logo512.png',
  url = window.location.href,
  type = 'website',
  author = 'StyleTransform',
  siteName = 'StyleTransform'
}) => {
  const fullTitle = title.includes('StyleTransform') ? title : `${title} | StyleTransform`;
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const fullImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      <meta property="twitter:creator" content="@styletransform" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="StyleTransform" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "StyleTransform",
          "description": description,
          "url": fullUrl,
          "applicationCategory": "PhotographyApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free tier with 5 generations"
          },
          "author": {
            "@type": "Organization",
            "name": "StyleTransform"
          },
          "publisher": {
            "@type": "Organization",
            "name": "StyleTransform"
          }
        })}
      </script>
    </Helmet>
  );
};

// Predefined SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: 'StyleTransform - AI Style Transformation',
    description: 'Transform your style with AI-powered image generation. Upload your photo and see how you\'d look with different hairstyles, clothing, and accessories.',
    keywords: 'AI style transformation, image generation, style transfer, AI fashion, virtual styling'
  },
  
  login: {
    title: 'Login - StyleTransform',
    description: 'Sign in to your StyleTransform account to access AI-powered style transformation tools.',
    keywords: 'login, sign in, StyleTransform account'
  },
  
  register: {
    title: 'Sign Up - StyleTransform',
    description: 'Create your free StyleTransform account and start transforming your style with AI technology.',
    keywords: 'sign up, register, create account, free trial'
  },
  
  dashboard: {
    title: 'Dashboard - StyleTransform',
    description: 'Your StyleTransform dashboard. Generate AI-powered style transformations and manage your account.',
    keywords: 'dashboard, style generation, AI transformation, user account'
  },
  
  monitoring: {
    title: 'System Monitoring - StyleTransform',
    description: 'System monitoring dashboard for StyleTransform application performance and analytics.',
    keywords: 'monitoring, system health, analytics, performance'
  }
};

export default SEOHead;