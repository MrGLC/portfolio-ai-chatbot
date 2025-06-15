import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Icon,
  List,
  ListItem,
  ListIcon,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { CheckCircleIcon, StarIcon, TimeIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { DebugWrapper } from '../components/DebugSystem';

const MotionCard = motion(Card);

const services = [
  {
    title: 'AI Strategy Consultation',
    price: 'Starting at $5,000',
    duration: '2-4 weeks',
    description: 'Comprehensive AI readiness assessment and strategic roadmap development.',
    features: [
      'AI Maturity Assessment',
      'Custom Implementation Roadmap',
      'ROI Projections & Business Case',
      'Technology Stack Recommendations',
      'Team Training Plan',
      'Risk Mitigation Strategy',
    ],
    recommended: false,
  },
  {
    title: 'Proof of Concept Development',
    price: 'Starting at $15,000',
    duration: '4-8 weeks',
    description: 'Rapid prototype development to validate AI solution feasibility.',
    features: [
      'Problem Definition & Scoping',
      'Data Analysis & Preparation',
      'MVP Model Development',
      'Performance Validation',
      'Technical Documentation',
      'Scalability Assessment',
      'Live Demo & Presentation',
    ],
    recommended: true,
  },
  {
    title: 'Full AI Implementation',
    price: 'Custom Pricing',
    duration: '3-12 months',
    description: 'End-to-end AI solution development and deployment.',
    features: [
      'Production-Ready Models',
      'MLOps Pipeline Setup',
      'Cloud Infrastructure',
      'API Development',
      'Quality Assurance',
      'Performance Monitoring',
      'Team Training & Handover',
      '6 Months Support',
    ],
    recommended: false,
  },
];

const process = [
  {
    step: 1,
    title: 'Discovery & Assessment',
    description: 'Understanding your business challenges, data landscape, and AI readiness.',
    icon: StarIcon,
  },
  {
    step: 2,
    title: 'Strategy & Planning',
    description: 'Developing a comprehensive AI strategy with clear deliverables and timelines.',
    icon: StarIcon,
  },
  {
    step: 3,
    title: 'Development & Testing',
    description: 'Building and validating AI solutions with rigorous testing and optimization.',
    icon: TimeIcon,
  },
  {
    step: 4,
    title: 'Deployment & Support',
    description: 'Deploying to production with ongoing monitoring and optimization support.',
    icon: CheckCircleIcon,
  },
];

export const ConsultingPage: React.FC = () => {
  return (
    <DebugWrapper name="ConsultingPage Root" type="section" layer={0}>
      <Container maxW="7xl" py={20}>
        <DebugWrapper name="Consulting Content Container" type="container" layer={1}>
          <VStack spacing={16} align="stretch">
            {/* Header */}
            <DebugWrapper name="Consulting Header" type="component" layer={2}>
              <Box textAlign="center">
                <Heading size="4xl" color="brand.text" mb={4}>
                  AI Consulting Services
                </Heading>
                <Text fontSize="xl" color="brand.textSecondary" maxW="800px" mx="auto">
                  Strategic AI consulting and implementation services designed to deliver 
                  measurable business impact and competitive advantage.
                </Text>
              </Box>
            </DebugWrapper>

            {/* Service Tiers */}
            <DebugWrapper name="Service Tiers Section" type="container" layer={2}>
              <Box>
                <DebugWrapper name="Service Tiers Title" type="element" layer={3}>
                  <Heading size="2xl" color="brand.text" mb={8} textAlign="center">
                    Service Packages
                  </Heading>
                </DebugWrapper>
                <DebugWrapper name="Service Cards Grid" type="container" layer={3}>
                  <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                    {services.map((service, index) => (
                      <DebugWrapper key={service.title} name={`Service Card: ${service.title}`} type="component" layer={4}>
                        <MotionCard
                          bg="brand.secondary"
                          border="2px solid"
                          borderColor={service.recommended ? 'brand.accent' : 'brand.border'}
                          borderRadius="16px"
                          position="relative"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          _hover={{
                            borderColor: 'brand.accent',
                            transform: 'translateY(-8px)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                          }}
                          transitionDuration="0.3s"
                        >
                {service.recommended && (
                  <Badge
                    position="absolute"
                    top="-12px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="brand.accent"
                    color="white"
                    px={4}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="600"
                  >
                    Most Popular
                  </Badge>
                )}
                
                <CardBody p={8}>
                  <VStack align="stretch" spacing={6}>
                    {/* Header */}
                    <Box textAlign="center">
                      <Heading size="lg" color="brand.text" mb={2}>
                        {service.title}
                      </Heading>
                      <Text color="brand.textSecondary" mb={4}>
                        {service.description}
                      </Text>
                      <Text fontSize="3xl" fontWeight="bold" color="brand.accent" mb={1}>
                        {service.price}
                      </Text>
                      <Text fontSize="sm" color="brand.textSecondary">
                        {service.duration}
                      </Text>
                    </Box>

                    <Divider borderColor="brand.border" />

                    {/* Features */}
                    <List spacing={3}>
                      {service.features.map((feature, i) => (
                        <ListItem key={i} display="flex" alignItems="center">
                          <ListIcon as={CheckCircleIcon} color="brand.accentCyan" />
                          <Text color="brand.text" fontSize="sm">
                            {feature}
                          </Text>
                        </ListItem>
                      ))}
                    </List>

                    {/* CTA */}
                    <Button
                      variant={service.recommended ? 'primary' : 'secondary'}
                      size="lg"
                      width="full"
                    >
                      Get Started
                    </Button>
                  </VStack>
                </CardBody>
                        </MotionCard>
                      </DebugWrapper>
                    ))}
                  </SimpleGrid>
                </DebugWrapper>
              </Box>
            </DebugWrapper>

            {/* Process */}
            <DebugWrapper name="Process Section" type="container" layer={2}>
              <Box>
                <DebugWrapper name="Process Title" type="element" layer={3}>
                  <Heading size="2xl" color="brand.text" mb={8} textAlign="center">
                    Our Process
                  </Heading>
                </DebugWrapper>
                <DebugWrapper name="Process Steps Grid" type="container" layer={3}>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                    {process.map((step, index) => (
                      <DebugWrapper key={step.step} name={`Process Step ${step.step}: ${step.title}`} type="component" layer={4}>
                        <MotionCard
                          bg="brand.secondary"
                          border="1px solid"
                          borderColor="brand.border"
                          borderRadius="16px"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          _hover={{
                            borderColor: 'brand.accent',
                            transform: 'translateY(-4px)',
                          }}
                          transitionDuration="0.3s"
                        >
                <CardBody p={6} textAlign="center">
                  <VStack spacing={4}>
                    <Box
                      w="60px"
                      h="60px"
                      bg="linear-gradient(135deg, #00ABE4, #7ACFD6)"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      position="relative"
                    >
                      <Icon as={step.icon} w={6} h={6} color="white" />
                      <Box
                        position="absolute"
                        top="-8px"
                        right="-8px"
                        w="24px"
                        h="24px"
                        bg="brand.accent"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="bold"
                        color="white"
                      >
                        {step.step}
                      </Box>
                    </Box>
                    <Heading size="md" color="brand.text">
                      {step.title}
                    </Heading>
                    <Text color="brand.textSecondary" fontSize="sm" lineHeight="1.6">
                      {step.description}
                    </Text>
                  </VStack>
                </CardBody>
                        </MotionCard>
                      </DebugWrapper>
                    ))}
                  </SimpleGrid>
                </DebugWrapper>
              </Box>
            </DebugWrapper>

            {/* ROI Section */}
            <DebugWrapper name="ROI Section" type="component" layer={2}>
              <Card bg="brand.secondary" border="1px solid" borderColor="brand.border">
                <CardBody p={8}>
                  <VStack spacing={8}>
                    <DebugWrapper name="ROI Title" type="element" layer={3}>
                      <Heading size="2xl" color="brand.text" textAlign="center">
                        Proven ROI & Business Impact
                      </Heading>
                    </DebugWrapper>
                    
                    <DebugWrapper name="ROI Metrics Grid" type="container" layer={3}>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} width="full">
                        <DebugWrapper name="ROI Metric 1" type="component" layer={4}>
                          <VStack>
                            <Text fontSize="4xl" fontWeight="bold" color="brand.accent">
                              $2M+
                            </Text>
                            <Text color="brand.textSecondary" textAlign="center">
                              Total cost savings generated for clients
                            </Text>
                          </VStack>
                        </DebugWrapper>
                        <DebugWrapper name="ROI Metric 2" type="component" layer={4}>
                          <VStack>
                            <Text fontSize="4xl" fontWeight="bold" color="brand.accentCyan">
                              40%
                            </Text>
                            <Text color="brand.textSecondary" textAlign="center">
                              Average efficiency improvement
                            </Text>
                          </VStack>
                        </DebugWrapper>
                        <DebugWrapper name="ROI Metric 3" type="component" layer={4}>
                          <VStack>
                            <Text fontSize="4xl" fontWeight="bold" color="brand.accent">
                              6 months
                            </Text>
                            <Text color="brand.textSecondary" textAlign="center">
                              Average time to ROI realization
                            </Text>
                          </VStack>
                        </DebugWrapper>
                      </SimpleGrid>
                    </DebugWrapper>

                    <DebugWrapper name="ROI CTA Button" type="element" layer={3}>
                      <Button variant="primary" size="lg">
                        Schedule Free AI Assessment
                      </Button>
                    </DebugWrapper>
                  </VStack>
                </CardBody>
              </Card>
            </DebugWrapper>
          </VStack>
        </DebugWrapper>
      </Container>
    </DebugWrapper>
  );
};