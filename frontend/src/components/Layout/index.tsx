import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import ChatWidget from '../ChatWidget';
import { AnimatedBackground, EnhancedAnimatedBackground, RoyalAnimatedBackground } from '../ThreeBackground';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      {/* Enhanced 3D Background with royal theme */}
      <EnhancedAnimatedBackground intensity={1} variant="royal" />
      
      <Box minH="100vh" position="relative">
        <Navigation />
        
        <Box as="main" pt={{ base: "92px", md: "92px" }} position="relative" zIndex={1}>
          {children}
        </Box>
        
        <Footer />
        
        {/* Fixed Position Elements */}
        <ScrollToTop />
        <ChatWidget />
      </Box>
    </>
  );
};