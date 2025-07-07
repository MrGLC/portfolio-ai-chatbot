import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Container,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const navItems = [
  { name: 'Home', path: '/', section: 'Luxury Solutions' },
  { name: 'Services', path: '/consulting', section: 'Services' },
  { name: 'Portfolio', path: '/projects', section: 'Royal Gallery' },
  { name: 'About', path: '/about', section: 'Expertise' },
  { name: 'Contact', path: '/contact', section: 'Royal Connection' },
];

export const Navigation: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink: React.FC<{ item: typeof navItems[0], isMobile?: boolean }> = ({ 
    item, 
    isMobile = false 
  }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <MotionBox
        position="relative"
        onMouseEnter={() => setHoveredItem(item.name)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <Button
          as={RouterLink}
          to={item.path}
          variant="ghost"
          size={isMobile ? 'lg' : 'sm'}
          color={isActive ? 'brand.accent' : 'brand.cream'}
          fontWeight={isActive ? '700' : '400'}
          fontSize={{ base: 'xs', md: 'sm' }}
          textTransform="uppercase"
          letterSpacing="0.5px"
          bg="transparent"
          px={3}
          _hover={{
            color: 'brand.accent',
            bg: 'transparent',
          }}
          _after={{
            content: '""',
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            width: isActive ? '100%' : '0',
            height: '2px',
            bg: 'brand.accent',
            transition: 'width 0.3s ease',
          }}
          _active={{ transform: 'none' }}
        >
          {item.name}
        </Button>
        
        {/* Hover effect for non-active items */}
        {!isActive && (
          <MotionBox
            position="absolute"
            bottom="-2px"
            left="0"
            width="100%"
            height="2px"
            bg="brand.accent"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            style={{ originX: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </MotionBox>
    );
  };

  return (
    <MotionBox
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={scrolled ? "rgba(220, 20, 60, 0.95)" : "linear-gradient(to bottom, #DC143C, rgba(220, 20, 60, 0.95))"}
      backdropFilter="blur(10px)"
      boxShadow={scrolled ? "0 4px 20px rgba(0, 0, 0, 0.1)" : "none"}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      py={scrolled ? 3 : 4}
    >
      <Container maxW="1400px">
        <Flex h={scrolled ? "50px" : "60px"} alignItems="center" justifyContent="space-between" transition="all 0.3s">
          {/* Logo/Brand */}
          <MotionBox
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <RouterLink to="/">
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="700"
                color="brand.cream"
                fontFamily="heading"
                letterSpacing="0.5px"
                _hover={{ color: 'brand.accent' }}
                transition="color 0.3s"
              >
                Royal Portfolio
              </Text>
            </RouterLink>
          </MotionBox>

          {/* Desktop Navigation */}
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </HStack>

          {/* CTA Button */}
          <HStack spacing={4}>
            <Button
              as={RouterLink}
              to="/contact"
              variant="primary"
              size="sm"
              display={{ base: 'none', md: 'flex' }}
            >
              Get Started
            </Button>

            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              variant="ghost"
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              color="brand.cream"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            />
          </HStack>
        </Flex>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent bg="brand.surface" borderLeft="1px solid" borderColor="brand.border">
          <DrawerCloseButton color="brand.text" />
          <DrawerBody pt={16}>
            <VStack spacing={6} align="stretch">
              {navItems.map((item) => (
                <NavLink key={item.name} item={item} isMobile />
              ))}
              
              <Box pt={8}>
                <Button
                  as={RouterLink}
                  to="/contact"
                  variant="primary"
                  size="lg"
                  width="full"
                  onClick={onClose}
                >
                  Get Started
                </Button>
              </Box>
              
              <Box pt={4}>
                <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
                  Where contemporary elegance meets timeless sophistication
                </Text>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </MotionBox>
  );
};