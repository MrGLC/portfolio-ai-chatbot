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
import { 
  CheckCircleIcon, 
  StarIcon,
  ArrowForwardIcon
} from '@chakra-ui/icons';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const HomePage: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Box>
      {/* Hero Section - Full Screen */}
      <MotionBox
        minH="100vh"
        bg="brand.secondary"
        position="relative"
        overflow="hidden"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {/* Background gradient overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="radial-gradient(circle at 30% 50%, rgba(232, 93, 117, 0.3), transparent 40%), 
                      radial-gradient(circle at 70% 80%, rgba(185, 28, 60, 0.3), transparent 50%)"
          opacity={0.3}
          pointerEvents="none"
        />
        
        {/* Animated background shapes */}
        <Box
          position="absolute"
          top="-50%"
          right="-20%"
          width="80%"
          height="80%"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent)"
          filter="blur(40px)"
          animation="float 20s ease-in-out infinite"
        />
        <Box
          position="absolute"
          bottom="-30%"
          left="-20%"
          width="60%"
          height="60%"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(220, 20, 60, 0.1), transparent)"
          filter="blur(40px)"
          animation="float 15s ease-in-out infinite reverse"
        />
        
        <Container maxW="1400px" position="relative" zIndex={1} h="100vh">
          <Flex
            h="100%"
            align="center"
            justify={{ base: "center", lg: "flex-start" }}
            pt={{ base: 0, lg: "10vh" }}
          >
            <VStack spacing={8} maxW="800px" align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }}>
              {/* Luxury subtitle */}
              <MotionText
                fontSize={{ base: "xs", md: "sm" }}
                fontWeight="300"
                letterSpacing="3px"
                textTransform="uppercase"
                color="brand.accent"
                opacity={0.9}
                variants={fadeInUp}
                animation="fadeInUp 0.8s ease-out"
                style={{ animationDelay: '0.2s' }}
              >
                Luxury Redefined
              </MotionText>

              {/* Main title */}
              <MotionHeading
                as="h1"
                fontSize={{ base: "5xl", md: "7xl", lg: "8xl" }}
                fontWeight="900"
                lineHeight="1.1"
                color="brand.primary"
                fontFamily="heading"
                letterSpacing="-2px"
                variants={fadeInUp}
                animation="fadeInUp 0.8s ease-out"
                style={{ animationDelay: '0.4s' }}
              >
                Modern Royalty
              </MotionHeading>

              {/* Description */}
              <MotionText
                fontSize={{ base: "lg", md: "xl" }}
                color="brand.cream"
                lineHeight="1.8"
                fontWeight="300"
                maxW="600px"
                variants={fadeInUp}
                animation="fadeInUp 0.8s ease-out"
                style={{ animationDelay: '0.6s' }}
                textAlign={{ base: "center", lg: "left" }}
              >
                Where contemporary elegance meets timeless sophistication. 
                Crafting exceptional experiences with a regal touch.
              </MotionText>

              {/* CTA Buttons */}
              <MotionBox
                variants={fadeInUp}
                animation="fadeInUp 0.8s ease-out"
                style={{ animationDelay: '0.8s' }}
              >
                <HStack spacing={4} justify={{ base: "center", lg: "flex-start" }} wrap="wrap">
                  <Button
                    as={RouterLink}
                    to="/projects"
                    variant="primary"
                    size="lg"
                  >
                    Explore Portfolio
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/contact"
                    variant="outline"
                    size="lg"
                    borderColor="brand.cream"
                    color="brand.cream"
                    _hover={{
                      bg: 'brand.cream',
                      color: 'brand.secondary',
                    }}
                  >
                    Get in Touch
                  </Button>
                </HStack>
              </MotionBox>
            </VStack>
          </Flex>
        </Container>
      </MotionBox>

      {/* Services Section */}
      <Box 
        bg="brand.primary" 
        position="relative"
        overflow="hidden"
      >
        {/* Diagonal shape transition */}
        <Box
          position="absolute"
          top="-50px"
          left={0}
          right={0}
          height="100px"
          bg="brand.secondary"
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
                What We Offer
              </Text>
              <Heading 
                size="3xl" 
                color="brand.text" 
                fontFamily="heading"
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              >
                Royal Services
              </Heading>
            </VStack>

            {/* Services Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
              {[
                {
                  title: "Brand Strategy",
                  description: "Crafting compelling brand narratives that resonate with your audience and establish market dominance.",
                  icon: StarIcon,
                },
                {
                  title: "Web Design", 
                  description: "Creating stunning digital experiences that captivate visitors and convert them into loyal customers.",
                  icon: CheckCircleIcon,
                },
                {
                  title: "UI/UX Design",
                  description: "Designing intuitive interfaces that delight users and drive engagement through thoughtful interaction.",
                  icon: ArrowForwardIcon,
                },
                {
                  title: "Digital Marketing",
                  description: "Amplifying your brand's voice across digital channels to reach and engage your target audience.",
                  icon: StarIcon,
                },
                {
                  title: "Consulting",
                  description: "Providing strategic insights and expert guidance to transform your business vision into reality.",
                  icon: CheckCircleIcon,
                },
                {
                  title: "Development",
                  description: "Building robust, scalable solutions that power your digital presence with cutting-edge technology.",
                  icon: ArrowForwardIcon,
                }
              ].map((feature, index) => (
                <MotionCard
                  key={index}
                  bg="brand.surface"
                  borderRadius="12px"
                  p={8}
                  textAlign="center"
                  position="relative"
                  overflow="hidden"
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    bg: 'linear-gradient(90deg, var(--chakra-colors-brand-secondary), var(--chakra-colors-brand-accent))',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.5s ease',
                  }}
                  _hover={{
                    transform: 'translateY(-10px)',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
                    _before: {
                      transform: 'translateX(0)',
                    },
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
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
                    transition="all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
                    _groupHover={{
                      bg: 'brand.accent',
                      transform: 'rotateY(360deg)',
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
                    Learn More
                  </Button>
                </MotionCard>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Portfolio Preview Section */}
      <Box bg="brand.secondary" py={{ base: 20, md: 32 }}>
        <Container maxW="1400px">
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
                Our Work
              </Text>
              <Heading 
                size="3xl" 
                color="brand.primary" 
                fontFamily="heading"
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              >
                Royal Gallery
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  viewport={{ once: true }}
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
                      {item % 3 === 0 ? 'Branding' : item % 3 === 1 ? 'Web Design' : 'Marketing'}
                    </Text>
                    <Heading size="md" color="brand.primary" fontFamily="heading">
                      Royal Project {item}
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
              View Full Portfolio
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Contact CTA Section */}
      <Box 
        bg="brand.primary" 
        py={{ base: 20, md: 32 }}
        position="relative"
        overflow="hidden"
      >
        {/* Background decoration */}
        <Box
          position="absolute"
          top="-50%"
          right="-50%"
          width="100%"
          height="100%"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(255, 215, 0, 0.05), transparent)"
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
                Ready to Experience Excellence?
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} color="brand.textSecondary" maxW="2xl">
                Let's craft your exceptional journey together with the sophistication 
                and precision your business deserves.
              </Text>
            </VStack>
            
            <Button
              as={RouterLink}
              to="/contact"
              variant="secondary"
              size="lg"
            >
              Send Royal Message
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};