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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  StarIcon
} from '@chakra-ui/icons';
// Debug system removed - clean production code

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const HomePage: React.FC = () => {
  return (
    <>
      <Box>
        {/* Hero Section */}
        <>
          <MotionBox
            minH="100vh"
            display="flex"
            alignItems="center"
            bg="linear-gradient(135deg, rgba(13, 14, 14, 0.95), rgba(26, 26, 26, 0.9))"
            position="relative"
            overflow="hidden"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            {/* Background geometric pattern */}
            <>
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                opacity={0.1}
                backgroundImage="linear-gradient(45deg, transparent 30%, rgba(0, 171, 228, 0.1) 50%, transparent 70%)"
              />
            </>
            
            <>
              <Container maxW="7xl" position="relative" zIndex={1}>
                <>
                  <Flex
                    direction={{ base: 'column', lg: 'row' }}
                    align="center"
                    gap={12}
                    minH="80vh"
                  >
                    {/* Left Column - Main Content */}
                    <>
                      <VStack align="start" spacing={8} flex={1} maxW="600px">
                        <>
                          <MotionBox variants={fadeInUp}>
                            <Badge
                              colorScheme="blue"
                              variant="solid"
                              px={4}
                              py={2}
                              borderRadius="full"
                              fontSize="sm"
                              fontWeight="600"
                              bg="brand.accent"
                              color="white"
                              mb={4}
                            >
                              AI Consulting Excellence
                            </Badge>
                          </MotionBox>
                        </>

                        <>
                          <MotionHeading
                            size="4xl"
                            color="brand.text"
                            lineHeight="1.1"
                            variants={fadeInUp}
                          >
                            Transform Your Business with{' '}
                            <Text as="span" color="brand.accent">
                              Cutting-Edge AI
                            </Text>{' '}
                            Solutions
                          </MotionHeading>
                        </>

                        <>
                          <MotionText
                            fontSize="xl"
                            color="brand.textSecondary"
                            lineHeight="1.6"
                            variants={fadeInUp}
                          >
                            Specializing in Computer Vision, Medical AI, and Machine Learning 
                            implementations that deliver quantifiable business impact. 
                            <Text as="span" color="brand.accentCyan" fontWeight="600">
                              {' '}$2M+ in cost savings generated for clients.
                            </Text>
                          </MotionText>
                        </>

                        <>
                          <MotionBox variants={fadeInUp}>
                            <HStack spacing={4} wrap="wrap">
                              <Button
                                as={RouterLink}
                                to="/consulting"
                                variant="primary"
                                size="lg"
                                rightIcon={<StarIcon />}
                              >
                                Get Free AI Assessment
                              </Button>
                              <Button
                                as={RouterLink}
                                to="/projects"
                                variant="secondary"
                                size="lg"
                                rightIcon={<CheckCircleIcon />}
                              >
                                View Portfolio
                              </Button>
                            </HStack>
                          </MotionBox>
                        </>

                        {/* Trust Indicators */}
                        <>
                          <MotionBox variants={fadeInUp}>
                            <HStack spacing={8} pt={4}>
                              <VStack spacing={1} align="start">
                                <Text fontSize="2xl" fontWeight="bold" color="brand.text">
                                  50+
                                </Text>
                                <Text fontSize="sm" color="brand.textSecondary">
                                  AI Projects Delivered
                                </Text>
                              </VStack>
                              <VStack spacing={1} align="start">
                                <Text fontSize="2xl" fontWeight="bold" color="brand.text">
                                  100%
                                </Text>
                                <Text fontSize="sm" color="brand.textSecondary">
                                  Client Satisfaction
                                </Text>
                              </VStack>
                              <VStack spacing={1} align="start">
                                <Text fontSize="2xl" fontWeight="bold" color="brand.text">
                                  24/7
                                </Text>
                                <Text fontSize="sm" color="brand.textSecondary">
                                  Support Available
                                </Text>
                              </VStack>
                            </HStack>
                          </MotionBox>
                        </>
                      </VStack>
                    </>

                    {/* Right Column - Interactive Demo */}
                    <>
                      <MotionBox 
                        flex={1} 
                        maxW="500px"
                        variants={fadeInUp}
                      >
                        <>
                          <Card
                bg="brand.secondary"
                border="1px solid"
                borderColor="brand.border"
                borderRadius="16px"
                overflow="hidden"
                _hover={{
                  borderColor: 'brand.accent',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0, 171, 228, 0.2)',
                }}
                transitionDuration="0.3s"
              >
                <CardBody p={8}>
                  <VStack spacing={6} align="stretch">
                    <HStack justify="space-between" align="center">
                      <Text fontSize="lg" fontWeight="600" color="brand.text">
                        AI Performance Dashboard
                      </Text>
                      <Badge colorScheme="green" variant="solid">
                        Live
                      </Badge>
                    </HStack>

                    <SimpleGrid columns={2} spacing={4}>
                      <Stat
                        bg="brand.surface"
                        p={4}
                        borderRadius="8px"
                        border="1px solid"
                        borderColor="brand.border"
                      >
                        <StatNumber color="brand.accent" fontSize="2xl">
                          94.7%
                        </StatNumber>
                        <StatLabel color="brand.textSecondary" fontSize="sm">
                          Model Accuracy
                        </StatLabel>
                        <StatHelpText color="brand.accentCyan">
                          +2.3% this month
                        </StatHelpText>
                      </Stat>

                      <Stat
                        bg="brand.surface"
                        p={4}
                        borderRadius="8px"
                        border="1px solid"
                        borderColor="brand.border"
                      >
                        <StatNumber color="brand.accentCyan" fontSize="2xl">
                          127ms
                        </StatNumber>
                        <StatLabel color="brand.textSecondary" fontSize="sm">
                          Inference Time
                        </StatLabel>
                        <StatHelpText color="green.400">
                          -15ms optimized
                        </StatHelpText>
                      </Stat>
                    </SimpleGrid>

                    <Box
                      h="120px"
                      bg="brand.surface"
                      borderRadius="8px"
                      border="1px solid"
                      borderColor="brand.border"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      position="relative"
                      overflow="hidden"
                    >
                      <Text color="brand.textSecondary" fontSize="sm">
                        [Live ML Pipeline Visualization]
                      </Text>
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="linear-gradient(45deg, transparent 30%, rgba(0, 171, 228, 0.1) 50%, transparent 70%)"
                        className="shimmer"
                      />
                    </Box>

                    <Button
                      variant="ghost"
                      size="sm"
                      color="brand.accent"
                      _hover={{ bg: 'brand.surface' }}
                    >
                      View Interactive Demo →
                    </Button>
                  </VStack>
                </CardBody>
                          </Card>
                        </>
                      </MotionBox>
                    </>
                  </Flex>
                </>
              </Container>
            </>
          </MotionBox>
        </>

        {/* Expertise Areas Section */}
        <>
          <Container maxW="7xl" py={20}>
        <MotionBox
          textAlign="center"
          mb={16}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <MotionHeading
            size="3xl"
            color="brand.text"
            mb={4}
            variants={fadeInUp}
          >
            AI Expertise Areas
          </MotionHeading>
          <MotionText
            fontSize="lg"
            color="brand.textSecondary"
            maxW="600px"
            mx="auto"
            variants={fadeInUp}
          >
            Specialized solutions across multiple AI domains with proven business impact
          </MotionText>
        </MotionBox>

            <>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {[
            {
              icon: StarIcon,
              title: 'Computer Vision',
              description: 'Medical imaging analysis, object detection, and visual quality control systems',
              metrics: '40% faster diagnosis',
              color: 'brand.accent',
            },
            {
              icon: CheckCircleIcon,
              title: 'Machine Learning',
              description: 'Custom ML models, predictive analytics, and automated decision systems',
              metrics: '$2M+ cost savings',
              color: 'brand.accentCyan',
            },
            {
              icon: StarIcon,
              title: 'AI Strategy',
              description: 'AI readiness assessment, implementation roadmaps, and team training',
              metrics: '100% project success',
              color: 'brand.accent',
            },
          ].map((service, index) => (
            <MotionCard
              key={service.title}
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              bg="brand.secondary"
              border="1px solid"
              borderColor="brand.border"
              borderRadius="16px"
              _hover={{
                borderColor: service.color,
                transform: 'translateY(-8px)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              }}
              transitionDuration="0.3s"
            >
              <CardBody p={8}>
                <VStack align="start" spacing={6}>
                  <Box
                    w="48px"
                    h="48px"
                    bg={`linear-gradient(135deg, ${service.color}, ${service.color}90)`}
                    borderRadius="12px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <service.icon w={6} h={6} color="white" />
                  </Box>

                  <VStack align="start" spacing={3}>
                    <Heading size="lg" color="brand.text">
                      {service.title}
                    </Heading>
                    <Text color="brand.textSecondary" lineHeight="1.6">
                      {service.description}
                    </Text>
                    <Badge
                      colorScheme="blue"
                      variant="subtle"
                      bg={`${service.color}20`}
                      color={service.color}
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {service.metrics}
                    </Badge>
                  </VStack>

                  <Button
                    variant="ghost"
                    color={service.color}
                    size="sm"
                    _hover={{ bg: `${service.color}10` }}
                  >
                    Learn More →
                  </Button>
                </VStack>
              </CardBody>
            </MotionCard>
          ))}
                </SimpleGrid>
            </>
          </Container>
        </>

        {/* CTA Section */}
        <>
          <MotionBox
            bg="linear-gradient(135deg, #00ABE4, #7ACFD6)"
            py={20}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
        <Container maxW="4xl" textAlign="center">
          <VStack spacing={8}>
            <Heading size="3xl" color="white">
              Ready to Transform Your Business?
            </Heading>
            <Text fontSize="xl" color="whiteAlpha.900" maxW="600px">
              Schedule a free consultation to discuss how AI can drive growth 
              and efficiency in your organization.
            </Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/contact"
                size="lg"
                bg="white"
                color="brand.accent"
                _hover={{
                  bg: 'whiteAlpha.900',
                  transform: 'translateY(-2px)',
                }}
                rightIcon={<CheckCircleIcon />}
              >
                Schedule Consultation
              </Button>
              <Button
                as={RouterLink}
                to="/projects"
                variant="ghost"
                size="lg"
                color="white"
                border="2px solid"
                borderColor="whiteAlpha.300"
                _hover={{
                  bg: 'whiteAlpha.200',
                  borderColor: 'white',
                }}
              >
                View Case Studies
              </Button>
            </HStack>
          </VStack>
            </Container>
          </MotionBox>
        </>
      </Box>
    </>
  );
};