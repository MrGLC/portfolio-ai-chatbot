import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Collapse,
  useDisclosure,
  Container,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { durations, easings } from '../../theme/animations';

const MotionBox = motion.create(Box);

interface NavItem {
  key: string;
  path: string;
}

const navItems: NavItem[] = [
  { key: 'home', path: '/' },
  { key: 'consulting', path: '/consulting' },
  { key: 'projects', path: '/projects' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
];

// Handoff logo: 26px square rotated 45° (rombo), crimson gradient, gold border
const LogoMark: React.FC = () => (
  <Box
    w="26px"
    h="26px"
    flexShrink={0}
    transform="rotate(45deg)"
    borderRadius="4px"
    bg="linear-gradient(140deg, #c10e35, #7e0a23)"
    border="1px solid"
    borderColor="brand.accent"
    boxShadow="0 6px 14px -6px rgba(193, 14, 53, 0.55)"
    aria-hidden="true"
  />
);

// Handoff hamburger: 3 lines, the third short and crimson
const HamburgerLines: React.FC = () => (
  <VStack spacing="5px" align="flex-start" w="22px">
    <Box w="22px" h="2px" bg="brand.text" borderRadius="full" />
    <Box w="22px" h="2px" bg="brand.text" borderRadius="full" />
    <Box w="12px" h="2px" bg="brand.secondary" borderRadius="full" />
  </VStack>
);

export const Navigation: React.FC = () => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Handoff nav: transparent on top, glass once scrollY > 40
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile panel whenever the route changes (closes on navigate)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const glass = scrolled || isOpen;

  const NavLink: React.FC<{ item: NavItem; isMobile?: boolean }> = ({
    item,
    isMobile = false,
  }) => {
    const isActive = location.pathname === item.path;

    return (
      <MotionBox position="relative">
        <Button
          as={RouterLink}
          to={item.path}
          onClick={isMobile ? onClose : undefined}
          variant="ghost"
          size={isMobile ? 'lg' : 'sm'}
          color={isActive ? 'brand.secondary' : 'brand.text'}
          fontWeight="600"
          fontSize="14px"
          bg="transparent"
          px={3}
          justifyContent={isMobile ? 'flex-start' : 'center'}
          _hover={{
            color: 'brand.secondary',
            bg: 'transparent',
          }}
          _after={{
            content: '""',
            position: 'absolute',
            bottom: '-2px',
            left: isMobile ? '12px' : 0,
            width: isActive ? (isMobile ? '24px' : '100%') : '0',
            height: '1px',
            bg: 'brand.secondary',
            transition: `width ${durations.normal}s cubic-bezier(${easings.smooth.join(',')})`,
          }}
          _active={{ transform: 'none' }}
        >
          {t(`nav.${item.key}`)}
        </Button>

        {/* Hover underline for non-active items (desktop) */}
        {!isActive && !isMobile && (
          <MotionBox
            position="absolute"
            bottom="-2px"
            left="0"
            width="100%"
            height="1px"
            bg="brand.secondary"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            style={{ originX: 0 }}
            transition={{ duration: durations.normal, ease: easings.smooth }}
          />
        )}
      </MotionBox>
    );
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      // Handoff: transparent on top; scrollY > 40 → cream glass + blur + hairline
      bg={glass ? 'rgba(246, 239, 226, 0.82)' : 'transparent'}
      backdropFilter={glass ? 'blur(14px)' : 'blur(0px)'}
      borderBottom="1px solid"
      borderColor={glass ? 'rgba(24, 20, 40, 0.08)' : 'transparent'}
      py={scrolled ? 3 : 4}
      transition="background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease, padding 0.4s ease"
    >
      <Container maxW="1180px" px="clamp(20px, 5vw, 40px)">
        <Flex
          h={scrolled ? '50px' : '60px'}
          alignItems="center"
          justifyContent="space-between"
          transition="height 0.4s ease"
        >
          {/* Logo / Brand: rombo + wordmark in Bodoni 21px */}
          <MotionBox
            whileHover={{ scale: 1.04 }}
            transition={{ duration: durations.fast, ease: easings.smooth }}
          >
            <HStack
              as={RouterLink}
              to="/"
              spacing={3}
              align="center"
              _hover={{ '& .nav-wordmark': { color: 'brand.secondary' } }}
            >
              <LogoMark />
              <Text
                className="nav-wordmark"
                fontSize="21px"
                fontWeight="600"
                color="brand.text"
                fontFamily="heading"
                letterSpacing="0.01em"
                transition="color 0.3s ease"
              >
                Royal Portfolio
              </Text>
            </HStack>
          </MotionBox>

          {/* Desktop Navigation */}
          <HStack spacing={5} display={{ base: 'none', md: 'flex' }} flex={1} justify="center">
            {navItems.map((item) => (
              <NavLink key={item.key} item={item} />
            ))}
          </HStack>

          {/* Right side items */}
          <HStack spacing={4}>
            <Button
              as={RouterLink}
              to="/contact"
              variant="primary"
              size="sm"
              display={{ base: 'none', md: 'flex' }}
            >
              {t('common.getStarted')}
            </Button>

            {/* Language Switcher - Desktop */}
            <Box display={{ base: 'none', md: 'flex' }}>
              <LanguageSwitcher />
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onToggle}
              variant="ghost"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              icon={<HamburgerLines />}
              _hover={{ bg: 'rgba(24, 20, 40, 0.05)' }}
            />
          </HStack>
        </Flex>
      </Container>

      {/* Mobile dropdown panel — cream, stacked links, full-width CTA */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          display={{ base: 'block', md: 'none' }}
          bg="brand.cream"
          borderBottom="1px solid"
          borderColor="rgba(24, 20, 40, 0.08)"
          boxShadow="0 24px 40px -28px rgba(24, 20, 40, 0.35)"
        >
          <Container maxW="1180px" px="clamp(20px, 5vw, 40px)" py={5}>
            <VStack spacing={2} align="stretch">
              {navItems.map((item) => (
                <NavLink key={item.key} item={item} isMobile />
              ))}

              <Box pt={3}>
                <LanguageSwitcher />
              </Box>

              <Box pt={4} pb={2}>
                <Button
                  as={RouterLink}
                  to="/contact"
                  variant="primary"
                  size="lg"
                  width="full"
                  onClick={onClose}
                >
                  {t('common.getStarted')}
                </Button>
              </Box>
            </VStack>
          </Container>
        </Box>
      </Collapse>
    </Box>
  );
};
