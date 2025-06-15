import React, { useState } from 'react';
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
  { name: 'Home', path: '/', section: 'AI Solutions' },
  { name: 'About', path: '/about', section: 'Expertise' },
  { name: 'Projects', path: '/projects', section: 'Portfolio' },
  { name: 'Consulting', path: '/consulting', section: 'Services' },
  { name: 'Contact', path: '/contact', section: 'Let\'s Connect' },
];

export const Navigation: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          as={RouterLink}
          to={item.path}
          variant="ghost"
          size={isMobile ? 'lg' : 'md'}
          color={isActive ? 'brand.accent' : 'brand.text'}
          fontWeight={isActive ? '700' : '500'}
          fontSize={isMobile ? 'lg' : 'md'}
          _hover={{
            color: 'brand.accent',
            bg: 'brand.surface',
          }}
          _active={{ transform: 'translateY(0)' }}
          borderRadius="8px"
          px={4}
          py={2}
        >
          {item.name}
        </Button>
        
        {/* Active indicator */}
        {isActive && (
          <MotionBox
            position="absolute"
            bottom="-4px"
            left="50%"
            width="20px"
            height="2px"
            bg="brand.accent"
            borderRadius="1px"
            initial={{ x: '-50%', scale: 0 }}
            animate={{ x: '-50%', scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Hover tooltip */}
        {hoveredItem === item.name && !isMobile && (
          <MotionBox
            position="absolute"
            top="100%"
            left="50%"
            transform="translateX(-50%)"
            mt={2}
            px={3}
            py={1}
            bg="brand.secondary"
            color="brand.textSecondary"
            fontSize="xs"
            borderRadius="6px"
            border="1px solid"
            borderColor="brand.border"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            whiteSpace="nowrap"
          >
            {item.section}
            <Box
              position="absolute"
              top="-4px"
              left="50%"
              width="8px"
              height="8px"
              bg="brand.secondary"
              borderLeft="1px solid"
              borderTop="1px solid"
              borderColor="brand.border"
              transform="translateX(-50%) rotate(45deg)"
            />
          </MotionBox>
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
      bg="rgba(13, 14, 14, 0.95)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="brand.border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxW="7xl">
        <Flex h="80px" alignItems="center" justifyContent="space-between">
          {/* Logo/Brand */}
          <MotionBox
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <RouterLink to="/">
              <Flex alignItems="center" gap={3}>
                <Box
                  w="32px"
                  h="32px"
                  bg="linear-gradient(135deg, #00ABE4, #7ACFD6)"
                  borderRadius="8px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="white"
                    fontFamily="mono"
                  >
                    LG
                  </Text>
                </Box>
                <VStack align="start" spacing={0}>
                  <Text
                    fontSize="lg"
                    fontWeight="700"
                    color="brand.text"
                    lineHeight="1"
                  >
                    Luis Alberto Gomez
                  </Text>
                  <Text
                    fontSize="xs"
                    color="brand.accent"
                    fontWeight="500"
                    lineHeight="1"
                  >
                    AI Consulting Excellence
                  </Text>
                </VStack>
              </Flex>
            </RouterLink>
          </MotionBox>

          {/* Desktop Navigation */}
          <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </HStack>

          {/* CTA Button */}
          <HStack spacing={4}>
            <MotionButton
              as={RouterLink}
              to="/contact"
              variant="primary"
              size="md"
              display={{ base: 'none', md: 'flex' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule Consultation
            </MotionButton>

            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              variant="ghost"
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              color="brand.text"
              _hover={{ bg: 'brand.surface' }}
            />
          </HStack>
        </Flex>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent bg="brand.secondary" borderLeft="1px solid" borderColor="brand.border">
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
                  Schedule Consultation
                </Button>
              </Box>
              
              <Box pt={4}>
                <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
                  Ready to transform your business with AI?
                </Text>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </MotionBox>
  );
};