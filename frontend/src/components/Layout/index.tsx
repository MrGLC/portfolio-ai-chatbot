import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import ChatWidget from '../ChatWidget';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bg="brand.primary">
      <Navigation />
      
      <Box as="main" pt={{ base: "92px", md: "92px" }}>
        {children}
      </Box>
      
      <Footer />
      
      {/* Fixed Position Elements */}
      <ScrollToTop />
      <ChatWidget />
    </Box>
  );
};