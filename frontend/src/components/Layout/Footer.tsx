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
import { LogoMark } from './Navigation';

const MotionBox = motion.create(Box);

const socialLinks = [
  { name: 'LinkedIn', url: 'https://linkedin.com/in/placeholder' },
  { name: 'GitHub', url: 'https://github.com/placeholder' },
  { name: 'Research Gate', url: 'https://researchgate.net/profile/placeholder' },
  { name: 'Email', url: 'mailto:luis@example.com' },
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    // Light variant of the handoff footer: cream band over a hairline top
    <MotionBox
      as="footer"
      bg="brand.creamLight"
      borderTop="1px solid"
      borderColor="rgba(24,20,40,.12)"
      mt={0}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Container maxW="1180px" py={16}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} mb={8}>
          {/* Brand Section */}
          <VStack align="start" spacing={4}>
            <Box>
              <HStack spacing={3} mb={2}>
                {/* 18px rombo, same mark as the nav */}
                <LogoMark size="18px" />
                <Text
                  fontSize="xl"
                  fontWeight="600"
                  color="brand.text"
                  fontFamily="heading"
                >
                  {t('footer.brand.name')}
                </Text>
              </HStack>
              <Text fontSize="sm" color="brand.goldRich" fontWeight="600" mb={4}>
                {t('footer.brand.tagline')}
              </Text>
              <Text fontSize="sm" color="brand.textSecondary" lineHeight="1.6">
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
                  size="md"
                  minW="44px"
                  minH="44px"
                  aria-label={social.name}
                  color="brand.textSecondary"
                  _hover={{
                    color: 'brand.secondary',
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
              <Text
                fontSize="12px"
                fontWeight="600"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="brand.goldRich"
                mb={2}
              >
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
                    color: 'brand.secondary',
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

        <Divider borderColor="rgba(24,20,40,.12)" mb={8} />

        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          gap={4}
        >
          <Text fontSize="sm" color="brand.textMuted">
            {t('footer.copyright')}
          </Text>

          {/* shouldWrapChildren + nowrap: each link stays on one line and the
              row wraps as a whole on narrow screens (no mid-link line breaks) */}
          <HStack spacing={6} fontSize="sm" flexWrap="wrap" justify="center" shouldWrapChildren>
            <Link
              as={RouterLink}
              to="/privacy"
              color="brand.textSecondary"
              whiteSpace="nowrap"
              _hover={{ color: 'brand.secondary' }}
            >
              {t('footer.links.privacyPolicy')}
            </Link>
            <Link
              as={RouterLink}
              to="/terms"
              color="brand.textSecondary"
              whiteSpace="nowrap"
              _hover={{ color: 'brand.secondary' }}
            >
              {t('footer.links.termsOfService')}
            </Link>
            {/* Back to top (handoff §8 footer) */}
            <Link
              as="button"
              type="button"
              onClick={scrollToTop}
              color="brand.goldRich"
              fontWeight="600"
              whiteSpace="nowrap"
              _hover={{ color: 'brand.secondary' }}
            >
              {t('footer.backToTop')}
            </Link>
          </HStack>
        </Flex>
      </Container>
    </MotionBox>
  );
};
