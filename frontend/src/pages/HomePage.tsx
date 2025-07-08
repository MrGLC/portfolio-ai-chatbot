import React from 'react';
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Stat,
  StatNumber,
  StatLabel,
  StatHelpText,
  Icon,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircleIcon, 
  StarIcon,
  ArrowForwardIcon
} from '@chakra-ui/icons';
import { variants, durations, easings, delays, springs, createStaggerAnimation } from '../theme/animations';
import { AnimatedBackground, LightPattern } from '../components/ThreeBackground';
import { ThreeJsChatbot } from '../components/Chatbot/ThreeJsChatbot';

const MotionBox = motion(Box);
const MotionCard = motion.div;
const MotionHeading = motion.h1;
const MotionText = motion.p;
const MotionButton = motion.button;

// Use standardized animations from theme
const staggerAnimation = createStaggerAnimation(delays.staggerSlow, variants.heroFadeIn);

// Smooth scroll reveal animation
const scrollReveal = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Floating animation for elements
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

// Pulse animation for CTAs
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const HomePage: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <Box overflowX="hidden">
      {/* Hero Section - Enhanced with better spacing and hierarchy */}
      <MotionBox
        minH="100vh"
        bg="transparent"
        position="relative"
        overflow="visible"
        initial="initial"
        animate="animate"
        variants={staggerAnimation.parent}
        style={{ y: heroY }}
      >
        {/* Extended red gradient overlay to cover gap */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom="-200px"
          bgGradient="linear(to-b, rgba(139, 0, 0, 0.7), rgba(220, 20, 60, 0.5), rgba(139, 0, 0, 0.3), transparent)"
          pointerEvents="none"
          zIndex={1}
        />
        
        {/* Decorative elements */}
        <Box
          position="absolute"
          top="20%"
          right="-10%"
          width="500px"
          height="500px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent)"
          filter="blur(40px)"
          animation={`${floatAnimation} 8s ease-in-out infinite`}
        />
        
        <Container maxW="1400px" position="relative" zIndex={1} h="100vh">
          <Flex
            h="100%"
            align="flex-start"
            justify={{ base: "center", lg: "space-between" }}
            pt={{ base: "100px", md: "125px" }}
          >
            <VStack 
              spacing={10} 
              maxW="700px" 
              align={{ base: "center", lg: "flex-start" }} 
              textAlign={{ base: "center", lg: "left" }}
              flex={1}
            >
              {/* Enhanced luxury subtitle with better styling */}
              <Text
                as={MotionText}
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="600"
                letterSpacing="4px"
                textTransform="uppercase"
                color="#FFD700"
                variants={staggerAnimation.child}
                position="relative"
                textShadow="0 2px 10px rgba(0,0,0,0.5)"
                _before={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: { base: '50%', lg: '0' },
                  transform: { base: 'translateX(-50%)', lg: 'none' },
                  width: '60px',
                  height: '2px',
                  bg: '#FFD700',
                  opacity: 0.8
                }}
              >
                {t('home.hero.luxurySubtitle')}
              </Text>

              {/* Enhanced main title with better typography */}
              <Heading
                as={MotionHeading}
                fontSize={{ base: "4xl", md: "6xl", lg: "7xl", xl: "8xl" }}
                fontWeight="900"
                lineHeight="0.95"
                color="white"
                fontFamily="heading"
                letterSpacing="-3px"
                variants={staggerAnimation.child}
                textShadow="0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(220,20,60,0.5)"
              >
                {t('home.hero.modernTitle')}
              </Heading>

              {/* Enhanced description with better readability */}
              <Text
                as={MotionText}
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                color="white"
                lineHeight="1.7"
                fontWeight="400"
                maxW="600px"
                variants={staggerAnimation.child}
                textAlign={{ base: "center", lg: "left" }}
                textShadow="0 2px 10px rgba(0,0,0,0.6)"
              >
                {t('home.hero.description')}
              </Text>

              {/* Enhanced CTA Buttons with micro-interactions */}
              <MotionBox
                variants={staggerAnimation.child}
                w="full"
              >
                <HStack 
                  spacing={6} 
                  justify={{ base: "center", lg: "flex-start" }} 
                  wrap="wrap"
                >
                  <Button
                    as={RouterLink}
                    to="/projects"
                    variant="primary"
                    size="lg"
                    px={10}
                    py={7}
                    fontSize="lg"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      bg: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s ease',
                    }}
                    _hover={{
                      transform: 'translateY(-3px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      _before: {
                        left: '100%',
                      }
                    }}
                    animation={`${pulseAnimation} 3s ease-in-out infinite`}
                  >
                    {t('home.hero.viewPortfolio')}
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/contact"
                    variant="outline"
                    size="lg"
                    px={10}
                    py={7}
                    fontSize="lg"
                    borderColor="brand.cream"
                    borderWidth={2}
                    color="brand.cream"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '0%',
                      height: '100%',
                      bg: 'brand.cream',
                      transition: 'width 0.3s ease',
                      zIndex: -1,
                    }}
                    _hover={{
                      color: 'brand.secondary',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 20px 40px rgba(255,255,255,0.2)',
                      _before: {
                        width: '100%',
                      }
                    }}
                  >
                    {t('home.hero.getInTouch')}
                  </Button>
                </HStack>
              </MotionBox>
            </VStack>

            {/* Hero visual element placeholder */}
            {!isMobile && (
              <Box
                flex={1}
                position="relative"
                height="600px"
                display={{ base: 'none', lg: 'block' }}
              >
                {/* Future 3D element or illustration */}
              </Box>
            )}
          </Flex>
        </Container>

        {/* Scroll indicator */}
        <MotionBox
          position="absolute"
          bottom={10}
          left="50%"
          transform="translateX(-50%)"
          variants={staggerAnimation.child}
        >
          <VStack spacing={2} cursor="pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <Text fontSize="sm" color="brand.cream" opacity={0.7}>
              Scroll to explore
            </Text>
            <Box
              w="30px"
              h="50px"
              borderRadius="15px"
              border="2px solid"
              borderColor="brand.cream"
              position="relative"
              opacity={0.7}
            >
              <Box
                position="absolute"
                top="8px"
                left="50%"
                transform="translateX(-50%)"
                w="3px"
                h="10px"
                bg="brand.cream"
                borderRadius="2px"
                animation={`${floatAnimation} 2s ease-in-out infinite`}
              />
            </Box>
          </VStack>
        </MotionBox>
      </MotionBox>

      {/* AI Assistant Section - Interactive Chatbot */}
      <Box 
        bg="brand.primary" 
        position="relative"
        overflow="hidden"
      >
        {/* Red transition overlay at top */}
        <Box
          position="absolute"
          top="-100px"
          left={0}
          right={0}
          height="300px"
          bgGradient="linear(to-b, rgba(139, 0, 0, 0.3), transparent)"
          pointerEvents="none"
          zIndex={2}
        />
        
        {/* Enhanced pattern background */}
        <LightPattern intensity={0.5} />
        
        {/* Smooth transition shape */}
        <Box
          position="absolute"
          top="-100px"
          left={0}
          right={0}
          height="200px"
          bg="brand.primary"
          transform="skewY(-3deg)"
          boxShadow="0 -20px 40px rgba(0,0,0,0.1)"
        />
        
        <Container maxW="1400px" py={{ base: 24, md: 36 }} position="relative" zIndex={3}>
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollReveal}
          >
            <VStack spacing={16}>
              {/* Enhanced section header */}
              <VStack spacing={6} textAlign="center" maxW="800px" mx="auto">
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="500"
                  letterSpacing="3px"
                  textTransform="uppercase"
                  color="brand.secondary"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '3px',
                    bg: 'brand.secondary',
                    borderRadius: 'full',
                  }}
                >
                  {t('home.chatbot.title')}
                </Text>
                <Heading 
                  size="3xl" 
                  color="brand.text" 
                  fontFamily="heading"
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  lineHeight="1.2"
                >
                  {t('home.chatbot.heading')}
                </Heading>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  color="brand.textSecondary"
                  maxW="600px"
                >
                  {t('home.chatbot.description')}
                </Text>
              </VStack>

              {/* Three.js Chatbot Component */}
              <ThreeJsChatbot />
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Portfolio Preview Section - Enhanced interactions */}
      <Box 
        bg="transparent" 
        py={{ base: 24, md: 36 }}
        position="relative"
        overflow="hidden"
      >
        {/* Red overlay to maintain consistency */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, rgba(139, 0, 0, 0.6), rgba(220, 20, 60, 0.4), rgba(139, 0, 0, 0.5))"
          pointerEvents="none"
        />
        
        <Container maxW="1400px" position="relative" zIndex={1}>
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollReveal}
          >
            <VStack spacing={20}>
              {/* Enhanced section header */}
              <VStack spacing={6} textAlign="center" maxW="800px" mx="auto">
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="500"
                  letterSpacing="3px"
                  textTransform="uppercase"
                  color="brand.accent"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '3px',
                    bg: 'brand.accent',
                    borderRadius: 'full',
                  }}
                >
                  {t('home.portfolio.subtitle')}
                </Text>
                <Heading 
                  size="3xl" 
                  color="brand.primary" 
                  fontFamily="heading"
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  lineHeight="1.2"
                >
                  {t('home.portfolio.title')}
                </Heading>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  color="brand.cream"
                  maxW="600px"
                  opacity={0.9}
                >
                  Discover our latest projects and creative solutions
                </Text>
              </VStack>

              {/* Enhanced portfolio grid with better hover effects */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <MotionBox
                    key={item}
                    bg="brand.surface"
                    borderRadius="20px"
                    overflow="hidden"
                    cursor="pointer"
                    position="relative"
                    h={{ base: "300px", md: item % 2 === 0 ? "350px" : "300px" }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ 
                      duration: 0.4,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                    role="group"
                  >
                    {/* Project image/gradient background */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg={`linear-gradient(135deg, ${item % 2 === 0 ? '#DC143C' : '#FFD700'}, ${item % 2 === 0 ? '#8B0000' : '#FFA500'})`}
                      opacity={0.9}
                      transition="transform 0.4s ease"
                      _groupHover={{
                        transform: 'scale(1.1)',
                      }}
                    />
                    
                    {/* Content overlay */}
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      p={8}
                      bg="linear-gradient(to top, rgba(26, 26, 26, 0.95), rgba(26, 26, 26, 0.7), transparent)"
                      transform="translateY(20px)"
                      transition="transform 0.4s ease"
                      _groupHover={{
                        transform: 'translateY(0)',
                      }}
                    >
                      <Badge
                        colorScheme={item % 2 === 0 ? 'red' : 'yellow'}
                        fontSize="xs"
                        px={3}
                        py={1}
                        borderRadius="full"
                        textTransform="uppercase"
                        letterSpacing="1px"
                        mb={3}
                      >
                        {item % 3 === 0 ? t('home.portfolio.branding') : item % 3 === 1 ? t('home.portfolio.webDesign') : t('home.portfolio.marketing')}
                      </Badge>
                      <Heading 
                        size="lg" 
                        color="brand.primary" 
                        fontFamily="heading"
                        mb={2}
                      >
                        {t('home.portfolio.project')} {item}
                      </Heading>
                      <Text
                        color="brand.cream"
                        fontSize="sm"
                        opacity={0}
                        transform="translateY(10px)"
                        transition="all 0.4s ease 0.1s"
                        _groupHover={{
                          opacity: 0.8,
                          transform: 'translateY(0)',
                        }}
                      >
                        Click to explore this project in detail
                      </Text>
                    </Box>

                    {/* Hover indicator */}
                    <Flex
                      position="absolute"
                      top={4}
                      right={4}
                      w={10}
                      h={10}
                      bg="brand.primary"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      opacity={0}
                      transform="scale(0.5)"
                      transition="all 0.3s ease"
                      _groupHover={{
                        opacity: 1,
                        transform: 'scale(1)',
                      }}
                    >
                      <ArrowForwardIcon color="brand.text" />
                    </Flex>
                  </MotionBox>
                ))}
              </SimpleGrid>

              {/* Enhanced view all button */}
              <Button
                as={RouterLink}
                to="/projects"
                size="lg"
                variant="primary"
                rightIcon={<ArrowForwardIcon />}
                px={10}
                py={7}
                fontSize="lg"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  bg: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s ease',
                }}
                _hover={{
                  transform: 'translateY(-3px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  _before: {
                    left: '100%',
                  }
                }}
              >
                {t('home.portfolio.viewAll')}
              </Button>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Contact CTA Section - More compelling design */}
      <Box 
        bg="brand.primary" 
        py={{ base: 24, md: 36 }}
        position="relative"
        overflow="hidden"
      >
        {/* Pattern background */}
        <LightPattern intensity={0.3} />
        
        {/* Decorative elements */}
        <Box
          position="absolute"
          top="-30%"
          right="-20%"
          width="600px"
          height="600px"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(255, 215, 0, 0.08), transparent)"
          filter="blur(60px)"
        />
        <Box
          position="absolute"
          bottom="-30%"
          left="-20%"
          width="600px"
          height="600px"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(220, 20, 60, 0.08), transparent)"
          filter="blur(60px)"
        />
        
        <Container maxW="5xl" textAlign="center" position="relative">
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollReveal}
          >
            <VStack spacing={10}>
              <VStack spacing={6} maxW="900px" mx="auto">
                <Heading 
                  size="2xl" 
                  color="brand.text" 
                  fontFamily="heading"
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl", xl: "6xl" }}
                  lineHeight="1.1"
                >
                  {t('home.cta.title')}
                </Heading>
                <Text 
                  fontSize={{ base: "lg", md: "xl", lg: "2xl" }} 
                  color="brand.textSecondary" 
                  maxW="700px"
                  lineHeight="1.7"
                >
                  {t('home.cta.description')}
                </Text>
              </VStack>
              
              <HStack spacing={6} wrap="wrap" justify="center">
                <Button
                  as={RouterLink}
                  to="/contact"
                  variant="secondary"
                  size="lg"
                  px={12}
                  py={8}
                  fontSize="xl"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    bg: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    transition: 'left 0.5s ease',
                  }}
                  _hover={{
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 20px 40px rgba(220,20,60,0.3)',
                    _before: {
                      left: '100%',
                    }
                  }}
                  animation={`${pulseAnimation} 4s ease-in-out infinite`}
                >
                  {t('home.cta.button')}
                </Button>
                <Button
                  as={RouterLink}
                  to="/about"
                  variant="outline"
                  size="lg"
                  px={12}
                  py={8}
                  fontSize="xl"
                  borderColor="brand.text"
                  borderWidth={2}
                  color="brand.text"
                  _hover={{
                    bg: 'brand.text',
                    color: 'brand.primary',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  }}
                >
                  Learn About Us
                </Button>
              </HStack>
              
              {/* Trust indicators */}
              <HStack spacing={10} mt={10} opacity={0.8}>
                <VStack spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold" color="brand.text">100+</Text>
                  <Text fontSize="sm" color="brand.textSecondary">Projects Completed</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold" color="brand.text">50+</Text>
                  <Text fontSize="sm" color="brand.textSecondary">Happy Clients</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold" color="brand.text">5★</Text>
                  <Text fontSize="sm" color="brand.textSecondary">Average Rating</Text>
                </VStack>
              </HStack>
            </VStack>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};