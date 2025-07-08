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
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircleIcon, 
  StarIcon,
  ArrowForwardIcon
} from '@chakra-ui/icons';
import { variants, durations, easings, delays, springs, createStaggerAnimation } from '../theme/animations';
import { AnimatedBackground, LightPattern } from '../components/ThreeBackground';

const MotionBox = motion(Box);
const MotionCard = motion.div;
const MotionHeading = motion.h1;
const MotionText = motion.p;
const MotionButton = motion.button;

// Use standardized animations from theme
const staggerAnimation = createStaggerAnimation(delays.staggerSlow, variants.heroFadeIn);

export const HomePage: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { t } = useTranslation();

  return (
    <Box>
      {/* Hero Section - Full Screen */}
      <MotionBox
        minH="85vh"
        bg="transparent"
        position="relative"
        overflow="hidden"
        initial="initial"
        animate="animate"
        variants={staggerAnimation.parent}
      >
        {/* Background overlay for hero - semi-transparent red */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(220, 20, 60, 0.65)"
          bgGradient="linear-gradient(to bottom, rgba(220, 20, 60, 0.75), rgba(220, 20, 60, 0.55))"
          pointerEvents="none"
        />
        
        <Container maxW="1400px" position="relative" zIndex={1} h="85vh">
          <Flex
            h="100%"
            align="flex-start"
            justify={{ base: "center", lg: "flex-start" }}
            pt={{ base: 10, lg: 12 }}
          >
            <VStack spacing={8} maxW="800px" align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }}>
              {/* Luxury subtitle */}
              <Text
                as={MotionText}
                fontSize={{ base: "xs", md: "sm" }}
                fontWeight="300"
                letterSpacing="3px"
                textTransform="uppercase"
                color="brand.accent"
                opacity={0.9}
                variants={staggerAnimation.child}
              >
                {t('home.hero.luxurySubtitle')}
              </Text>

              {/* Main title */}
              <Heading
                as={MotionHeading}
                size="4xl"
                fontSize={{ base: "5xl", md: "7xl", lg: "8xl" }}
                fontWeight="900"
                lineHeight="1.1"
                color="brand.primary"
                fontFamily="heading"
                letterSpacing="-2px"
                variants={staggerAnimation.child}
              >
                {t('home.hero.modernTitle')}
              </Heading>

              {/* Description */}
              <Text
                as={MotionText}
                fontSize={{ base: "lg", md: "xl" }}
                color="brand.cream"
                lineHeight="1.8"
                fontWeight="300"
                maxW="600px"
                variants={staggerAnimation.child}
                textAlign={{ base: "center", lg: "left" }}
              >
                {t('home.hero.description')}
              </Text>

              {/* CTA Buttons */}
              <MotionBox
                variants={staggerAnimation.child}
              >
                <HStack spacing={4} justify={{ base: "center", lg: "flex-start" }} wrap="wrap">
                  <Button
                    as={RouterLink}
                    to="/projects"
                    variant="primary"
                    size="lg"
                  >
                    {t('home.hero.viewPortfolio')}
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/contact"
                    variant="outline"
                    size="lg"
                    borderColor="brand.cream"
                    color="brand.cream"
                    transition={`all ${durations.normal}s cubic-bezier(${easings.smooth.join(',')})`}
                    _hover={{
                      bg: 'brand.cream',
                      color: 'brand.secondary',
                      transform: 'translateY(-2px)',
                    }}
                  >
                    {t('home.hero.getInTouch')}
                  </Button>
                </HStack>
              </MotionBox>
            </VStack>
          </Flex>
        </Container>
      </MotionBox>

      {/* Services Section - White background with pattern */}
      <Box 
        bg="brand.primary" 
        position="relative"
        overflow="hidden"
      >
        {/* Light pattern background for white section */}
        <LightPattern intensity={0.5} />
        
        {/* Diagonal shape transition */}
        <Box
          position="absolute"
          top="-50px"
          left={0}
          right={0}
          height="100px"
          bg="brand.primary"
          transform="skewY(-2deg)"
        />
        
        <Container maxW="1400px" py={{ base: 20, md: 32 }} position="relative">
          <VStack spacing={16}>
            {/* Section Header */}
            <VStack spacing={4} textAlign="center">
              <Text
                fontSize="sm"
                fontWeight="300"
                letterSpacing="2px"
                textTransform="uppercase"
                color="brand.secondary"
              >
                {t('home.services.subtitle')}
              </Text>
              <Heading 
                size="3xl" 
                color="brand.text" 
                fontFamily="heading"
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              >
                {t('home.services.title')}
              </Heading>
            </VStack>

            {/* Services Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
              {[
                {
                  title: t('home.services.strategy.title'),
                  description: t('home.services.strategy.description'),
                  icon: StarIcon,
                },
                {
                  title: t('home.services.webDesign.title'), 
                  description: t('home.services.webDesign.description'),
                  icon: CheckCircleIcon,
                },
                {
                  title: t('home.services.uiux.title'),
                  description: t('home.services.uiux.description'),
                  icon: ArrowForwardIcon,
                },
                {
                  title: t('home.services.marketing.title'),
                  description: t('home.services.marketing.description'),
                  icon: StarIcon,
                },
                {
                  title: t('home.services.consulting.title'),
                  description: t('home.services.consulting.description'),
                  icon: CheckCircleIcon,
                },
                {
                  title: t('home.services.development.title'),
                  description: t('home.services.development.description'),
                  icon: ArrowForwardIcon,
                }
              ].map((feature, index) => (
                <MotionCard
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: durations.normal, ease: easings.smooth }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <Card
                    bg="brand.surface"
                    borderRadius="12px"
                    p={8}
                    textAlign="center"
                    position="relative"
                    overflow="hidden"
                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
                    transition={`all ${durations.normal}s cubic-bezier(${easings.smooth.join(',')})`}
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      bg: 'linear-gradient(90deg, var(--chakra-colors-brand-secondary), var(--chakra-colors-brand-accent))',
                      transform: 'translateX(-100%)',
                      transition: `transform ${durations.slow}s cubic-bezier(${easings.smooth.join(',')})`,
                    }}
                    _hover={{
                      transform: 'translateY(-8px)',
                      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
                      _before: {
                        transform: 'translateX(0)',
                      },
                    }}
                  >
                  <Flex
                    w={16}
                    h={16}
                    mx="auto"
                    mb={6}
                    bg="brand.secondary"
                    borderRadius="50%"
                    align="center"
                    justify="center"
                    transition={`all ${durations.normal}s cubic-bezier(${easings.smooth.join(',')})`}
                    _groupHover={{
                      bg: 'brand.accent',
                      transform: 'scale(1.1)',
                    }}
                  >
                    <Icon as={feature.icon} boxSize={7} color="brand.primary" />
                  </Flex>
                  <Heading size="md" mb={3} fontFamily="heading" color="brand.text">
                    {feature.title}
                  </Heading>
                  <Text color="brand.textSecondary" fontSize="sm" lineHeight="1.6" mb={4}>
                    {feature.description}
                  </Text>
                  <Button
                    variant="link"
                    color="brand.secondary"
                    fontSize="sm"
                    fontWeight="500"
                    rightIcon={<ArrowForwardIcon />}
                    _hover={{ color: 'brand.accent' }}
                  >
                    {t('home.services.learnMore')}
                  </Button>
                  </Card>
                </MotionCard>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Portfolio Preview Section - Red background showing 3D animation */}
      <Box 
        bg="transparent" 
        py={{ base: 20, md: 32 }}
        position="relative"
        overflow="hidden"
      >
        {/* Semi-transparent red overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(220, 20, 60, 0.85)"
          pointerEvents="none"
        />
        <Container maxW="1400px" position="relative" zIndex={1}>
          <VStack spacing={16}>
            {/* Section Header */}
            <VStack spacing={4} textAlign="center">
              <Text
                fontSize="sm"
                fontWeight="300"
                letterSpacing="2px"
                textTransform="uppercase"
                color="brand.accent"
              >
                {t('home.portfolio.subtitle')}
              </Text>
              <Heading 
                size="3xl" 
                color="brand.primary" 
                fontFamily="heading"
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              >
                {t('home.portfolio.title')}
              </Heading>
            </VStack>

            {/* Portfolio Grid - Masonry Style */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <MotionBox
                  key={item}
                  bg="brand.surface"
                  borderRadius="12px"
                  overflow="hidden"
                  cursor="pointer"
                  position="relative"
                  h={{ base: "250px", md: item % 2 === 0 ? "300px" : "250px" }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: durations.normal, ease: easings.smooth }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg={`linear-gradient(135deg, ${item % 2 === 0 ? '#DC143C' : '#FFD700'}, ${item % 2 === 0 ? '#B91C3C' : '#FFED4E'})`}
                    opacity={0.8}
                  />
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    p={6}
                    bg="linear-gradient(to top, rgba(26, 26, 26, 0.9), transparent)"
                  >
                    <Text fontSize="xs" color="brand.accent" textTransform="uppercase" letterSpacing="1px" mb={1}>
                      {item % 3 === 0 ? t('home.portfolio.branding') : item % 3 === 1 ? t('home.portfolio.webDesign') : t('home.portfolio.marketing')}
                    </Text>
                    <Heading size="md" color="brand.primary" fontFamily="heading">
                      {t('home.portfolio.project')} {item}
                    </Heading>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>

            {/* View All Button */}
            <Button
              as={RouterLink}
              to="/projects"
              size="lg"
              variant="primary"
              rightIcon={<ArrowForwardIcon />}
            >
              {t('home.portfolio.viewAll')}
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Contact CTA Section - White background with pattern */}
      <Box 
        bg="brand.primary" 
        py={{ base: 20, md: 32 }}
        position="relative"
        overflow="hidden"
      >
        {/* Light pattern background for white section */}
        <LightPattern intensity={0.3} />
        
        {/* Background decoration */}
        <Box
          position="absolute"
          top="-50%"
          right="-50%"
          width="100%"
          height="100%"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent)"
        />
        
        <Container maxW="4xl" textAlign="center" position="relative">
          <VStack spacing={8}>
            <VStack spacing={4}>
              <Heading 
                size="2xl" 
                color="brand.text" 
                fontFamily="heading"
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              >
                {t('home.cta.title')}
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} color="brand.textSecondary" maxW="2xl">
                {t('home.cta.description')}
              </Text>
            </VStack>
            
            <Button
              as={RouterLink}
              to="/contact"
              variant="secondary"
              size="lg"
            >
              {t('home.cta.button')}
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};