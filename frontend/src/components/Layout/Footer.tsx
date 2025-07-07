import React from 'react';
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Link,
  Divider,
  SimpleGrid,
  IconButton,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const footerLinks = {
  'Services': [
    { name: 'Royal Strategy', path: '/consulting#strategy' },
    { name: 'AI Excellence', path: '/consulting#ml' },
    { name: 'Vision Systems', path: '/consulting#cv' },
    { name: 'Natural Intelligence', path: '/consulting#nlp' },
  ],
  'Gallery': [
    { name: 'Medical Innovations', path: '/projects#medical' },
    { name: 'Business Intelligence', path: '/projects#bi' },
    { name: 'Automation Luxury', path: '/projects#automation' },
    { name: 'Research Excellence', path: '/projects#research' },
  ],
  'Resources': [
    { name: 'Royal Assessment', path: '/assessment' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Royal Blog', path: '/blog' },
    { name: 'Whitepapers', path: '/resources' },
  ],
};

const socialLinks = [
  { name: 'LinkedIn', url: 'https://linkedin.com/in/placeholder', color: '#0A66C2' },
  { name: 'GitHub', url: 'https://github.com/placeholder', color: '#1A1A1A' },
  { name: 'Research Gate', url: 'https://researchgate.net/profile/placeholder', color: '#00D0B6' },
  { name: 'Email', url: 'mailto:luis@example.com', color: '#DC143C' },
];

export const Footer: React.FC = () => {
  return (
    <MotionBox
      as="footer"
      bg="brand.text"
      mt={0}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Container maxW="7xl" py={16}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} mb={8}>
          {/* Brand Section */}
          <VStack align="start" spacing={4}>
            <Box>
              <Text 
                fontSize="2xl" 
                fontWeight="700" 
                color="brand.primary" 
                mb={2}
                fontFamily="heading"
              >
                Royal Portfolio
              </Text>
              <Text fontSize="sm" color="brand.accent" fontWeight="600" mb={4}>
                Luxury AI Solutions
              </Text>
              <Text fontSize="sm" color="brand.cream" lineHeight="1.6">
                Where contemporary elegance meets timeless sophistication in 
                artificial intelligence and strategic consulting.
              </Text>
            </Box>
            
            <HStack spacing={3}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.name}
                  as={Link}
                  href={social.url}
                  isExternal
                  variant="ghost"
                  size="sm"
                  aria-label={social.name}
                  color="brand.cream"
                  _hover={{
                    color: 'brand.accent',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                  icon={<ExternalLinkIcon />}
                />
              ))}
            </HStack>
          </VStack>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <VStack key={category} align="start" spacing={3}>
              <Text fontSize="sm" fontWeight="600" color="brand.primary" mb={2}>
                {category}
              </Text>
              {links.map((link) => (
                <Link
                  key={link.name}
                  as={RouterLink}
                  to={link.path}
                  fontSize="sm"
                  color="brand.cream"
                  _hover={{
                    color: 'brand.accent',
                    textDecoration: 'none',
                  }}
                  transition="color 0.2s"
                >
                  {link.name}
                </Link>
              ))}
            </VStack>
          ))}
        </SimpleGrid>

        <Divider borderColor="brand.border" opacity={0.2} mb={8} />

        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          gap={4}
        >
          <Text fontSize="sm" color="brand.cream" opacity={0.8}>
            © 2024 Royal Portfolio. Crafted with regal excellence.
          </Text>
          
          <HStack spacing={6} fontSize="sm">
            <Link
              as={RouterLink}
              to="/privacy"
              color="brand.cream"
              _hover={{ color: 'brand.accent' }}
            >
              Privacy Policy
            </Link>
            <Link
              as={RouterLink}
              to="/terms"
              color="brand.cream"
              _hover={{ color: 'brand.accent' }}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              color="brand.accent"
              _hover={{ color: 'brand.accentLight' }}
            >
              regal excellence
            </Link>
          </HStack>
        </Flex>
      </Container>
    </MotionBox>
  );
};