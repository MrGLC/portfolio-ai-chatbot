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
    { name: 'AI Strategy Consulting', path: '/consulting#strategy' },
    { name: 'Machine Learning Solutions', path: '/consulting#ml' },
    { name: 'Computer Vision', path: '/consulting#cv' },
    { name: 'Natural Language Processing', path: '/consulting#nlp' },
  ],
  'Portfolio': [
    { name: 'Medical AI Projects', path: '/projects#medical' },
    { name: 'Business Intelligence', path: '/projects#bi' },
    { name: 'Automation Solutions', path: '/projects#automation' },
    { name: 'Research Papers', path: '/projects#research' },
  ],
  'Resources': [
    { name: 'AI Assessment Tool', path: '/assessment' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Blog', path: '/blog' },
    { name: 'Whitepapers', path: '/resources' },
  ],
};

const socialLinks = [
  { name: 'LinkedIn', url: 'https://linkedin.com/in/placeholder', color: '#0A66C2' },
  { name: 'GitHub', url: 'https://github.com/placeholder', color: '#F0F0F0' },
  { name: 'Research Gate', url: 'https://researchgate.net/profile/placeholder', color: '#00D0B6' },
  { name: 'Email', url: 'mailto:luis@example.com', color: '#00ABE4' },
];

export const Footer: React.FC = () => {
  return (
    <MotionBox
      as="footer"
      bg="brand.secondary"
      borderTop="1px solid"
      borderColor="brand.border"
      mt={20}
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
              <Text fontSize="xl" fontWeight="700" color="brand.text" mb={2}>
                Luis Alberto Gomez
              </Text>
              <Text fontSize="sm" color="brand.accent" fontWeight="600" mb={4}>
                AI Consulting Excellence
              </Text>
              <Text fontSize="sm" color="brand.textSecondary" lineHeight="1.6">
                Transforming businesses through cutting-edge AI solutions, 
                machine learning implementations, and strategic consulting.
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
                  color="brand.textSecondary"
                  _hover={{
                    color: social.color,
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
              <Text fontSize="sm" fontWeight="600" color="brand.text" mb={2}>
                {category}
              </Text>
              {links.map((link) => (
                <Link
                  key={link.name}
                  as={RouterLink}
                  to={link.path}
                  fontSize="sm"
                  color="brand.textSecondary"
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

        <Divider borderColor="brand.border" mb={8} />

        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          gap={4}
        >
          <Text fontSize="sm" color="brand.textSecondary">
            © 2024 Luis Alberto Gomez Celaya. All rights reserved.
          </Text>
          
          <HStack spacing={6} fontSize="sm">
            <Link
              as={RouterLink}
              to="/privacy"
              color="brand.textSecondary"
              _hover={{ color: 'brand.accent' }}
            >
              Privacy Policy
            </Link>
            <Link
              as={RouterLink}
              to="/terms"
              color="brand.textSecondary"
              _hover={{ color: 'brand.accent' }}
            >
              Terms of Service
            </Link>
            <Text color="brand.textSecondary">
              Built with ⚡ React & AI
            </Text>
          </HStack>
        </Flex>
      </Container>
    </MotionBox>
  );
};