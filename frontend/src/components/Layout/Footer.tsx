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
import { useTranslation } from 'react-i18next';

const MotionBox = motion(Box);

const socialLinks = [
  { name: 'LinkedIn', url: 'https://linkedin.com/in/placeholder', color: '#0A66C2' },
  { name: 'GitHub', url: 'https://github.com/placeholder', color: '#1A1A1A' },
  { name: 'Research Gate', url: 'https://researchgate.net/profile/placeholder', color: '#00D0B6' },
  { name: 'Email', url: 'mailto:luis@example.com', color: '#DC143C' },
];

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  const footerLinksTranslated = {
    [t('footer.sections.services')]: [
      { name: t('footer.links.royalStrategy'), path: '/consulting#strategy' },
      { name: t('footer.links.aiExcellence'), path: '/consulting#ml' },
      { name: t('footer.links.visionSystems'), path: '/consulting#cv' },
      { name: t('footer.links.naturalIntelligence'), path: '/consulting#nlp' },
    ],
    [t('footer.sections.gallery')]: [
      { name: t('footer.links.medicalInnovations'), path: '/projects#medical' },
      { name: t('footer.links.businessIntelligence'), path: '/projects#bi' },
      { name: t('footer.links.automationLuxury'), path: '/projects#automation' },
      { name: t('footer.links.researchExcellence'), path: '/projects#research' },
    ],
    [t('footer.sections.resources')]: [
      { name: t('footer.links.royalAssessment'), path: '/assessment' },
      { name: t('footer.links.caseStudies'), path: '/case-studies' },
      { name: t('footer.links.royalBlog'), path: '/blog' },
      { name: t('footer.links.whitepapers'), path: '/resources' },
    ],
  };

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
                {t('footer.brand.name')}
              </Text>
              <Text fontSize="sm" color="brand.accent" fontWeight="600" mb={4}>
                {t('footer.brand.tagline')}
              </Text>
              <Text fontSize="sm" color="brand.cream" lineHeight="1.6">
                {t('footer.brand.description')}
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
          {Object.entries(footerLinksTranslated).map(([category, links]) => (
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
            {t('footer.copyright')}
          </Text>
          
          <HStack spacing={6} fontSize="sm">
            <Link
              as={RouterLink}
              to="/privacy"
              color="brand.cream"
              _hover={{ color: 'brand.accent' }}
            >
              {t('footer.links.privacyPolicy')}
            </Link>
            <Link
              as={RouterLink}
              to="/terms"
              color="brand.cream"
              _hover={{ color: 'brand.accent' }}
            >
              {t('footer.links.termsOfService')}
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