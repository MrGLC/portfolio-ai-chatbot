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
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, 
  StarIcon, 
  TimeIcon,
  PhoneIcon,
  CalendarIcon,
  ChevronRightIcon
} from '@chakra-ui/icons';
import {
  InfoIcon,
  ViewIcon,
  ChatIcon,
  ArrowForwardIcon,
  SettingsIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const services = [
  {
    title: 'AI Strategy Consulting',
    icon: InfoIcon,
    description: 'Help businesses integrate AI effectively into their operations',
    features: [
      'AI readiness assessment',
      'Strategic roadmap development',
      'ROI analysis and projections',
      'Technology stack recommendations',
      'Risk mitigation planning',
    ],
  },
  {
    title: 'Custom ML Model Development',
    icon: SettingsIcon,
    description: 'Build tailored solutions specific to your business needs',
    features: [
      'Custom algorithm development',
      'Model training and optimization',
      'Performance benchmarking',
      'Integration with existing systems',
      'Ongoing model maintenance',
    ],
  },
  {
    title: 'Computer Vision Solutions',
    icon: ViewIcon,
    description: 'Advanced image and video analysis for real-world applications',
    features: [
      'Object detection and tracking',
      'Image classification',
      'OCR and document processing',
      'Video analytics',
      'Quality inspection systems',
    ],
  },
  {
    title: 'NLP Implementation',
    icon: ChatIcon,
    description: 'LangChain, LangGraph, Pydantic-powered language solutions',
    features: [
      'Chatbot development',
      'Document understanding',
      'Sentiment analysis',
      'Language translation',
      'Text generation and summarization',
    ],
  },
  {
    title: 'Data Analysis & Insights',
    icon: StarIcon,
    description: 'Extract actionable value from your data',
    features: [
      'Predictive analytics',
      'Business intelligence dashboards',
      'Data pipeline development',
      'Statistical modeling',
      'Real-time analytics',
    ],
  },
  {
    title: 'Training & Workshops',
    icon: CalendarIcon,
    description: 'Upskill your team with hands-on AI training',
    features: [
      'Custom curriculum development',
      'Hands-on coding workshops',
      'AI literacy programs',
      'Tool-specific training',
      'Best practices seminars',
    ],
  },
  {
    title: 'MCP Development',
    icon: ExternalLinkIcon,
    description: 'Make your company AI-compatible with Model Context Protocol',
    features: [
      'ChatGPT/Claude integration',
      'Custom MCP server development',
      'API wrapper creation',
      'Security implementation',
      'Documentation and training',
    ],
  },
  {
    title: 'Full Platform Development',
    icon: ArrowForwardIcon,
    description: 'Build from scratch with AI in mind',
    features: [
      'AI-first architecture design',
      'Full-stack development',
      'Cloud infrastructure setup',
      'DevOps and MLOps',
      'Scalable deployment',
    ],
  },
];

const process = [
  {
    step: 1,
    title: 'Discovery Call',
    description: 'Understand your needs through a paid consultation',
    icon: InfoIcon,
    duration: '1 hour',
  },
  {
    step: 2,
    title: 'MVP Development',
    description: '2-week rapid prototype to validate your idea',
    icon: SettingsIcon,
    duration: '2 weeks',
  },
  {
    step: 3,
    title: 'Deployment & Support',
    description: 'Implementation and ongoing development',
    icon: CheckCircleIcon,
    duration: 'Ongoing',
  },
];

export const ConsultingPage: React.FC = () => {
  return (
    <Box>
      {/* Hero Section with Red Background */}
      <Box
        position="relative"
        bg="linear-gradient(135deg, #C41E3A 0%, #DC143C 100%)"
        color="white"
        overflow="hidden"
      >
        <Container maxW="7xl" py={{ base: 20, md: 32 }} position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Heading size="4xl" mb={4}>
                AI Consulting Services
              </Heading>
              <Text fontSize="xl" maxW="800px" mx="auto" opacity={0.95}>
                Transform your business with cutting-edge AI solutions. 
                From strategy to deployment, we deliver measurable results fast.
              </Text>
            </MotionBox>
            
            <HStack spacing={4} mt={8}>
              <Button
                size="lg"
                bg="white"
                color="#C41E3A"
                _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                Get Started Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                View Pricing
              </Button>
            </HStack>
          </VStack>
        </Container>

        {/* Diagonal Transition */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height="100px"
          bg="#FAF0E6"
          transform="skewY(-2deg)"
          transformOrigin="top left"
        />
      </Box>

      {/* Services Section - Cream Background */}
      <Box bg="#FAF0E6" pt={20} pb={32} position="relative">
        <Container maxW="7xl">
          <VStack spacing={12}>
            <Box textAlign="center">
              <Heading size="3xl" color="#1A1A1A" mb={4}>
                Our Services
              </Heading>
              <Text fontSize="lg" color="#666666" maxW="600px" mx="auto">
                Comprehensive AI solutions tailored to your business needs
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} width="full">
              {services.map((service, index) => (
                <MotionCard
                  key={index}
                  bg="white"
                  borderRadius="16px"
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                  }}
                  transitionDuration="0.3s"
                  overflow="hidden"
                >
                  <CardBody p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Box
                        w="60px"
                        h="60px"
                        bg="linear-gradient(135deg, #C41E3A, #DC143C)"
                        borderRadius="12px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mb={2}
                      >
                        <Icon as={service.icon} w={8} h={8} color="white" />
                      </Box>
                      
                      <Heading size="md" color="#1A1A1A">
                        {service.title}
                      </Heading>
                      
                      <Text color="#666666" fontSize="sm" minH="60px">
                        {service.description}
                      </Text>
                      
                      <List spacing={2}>
                        {service.features.slice(0, 3).map((feature, i) => (
                          <ListItem key={i} fontSize="xs" color="#666666">
                            <Icon as={CheckCircleIcon} color="#C41E3A" mr={2} />
                            {feature}
                          </ListItem>
                        ))}
                      </List>
                      
                      <Button
                        variant="ghost"
                        color="#C41E3A"
                        rightIcon={<ChevronRightIcon />}
                        mt={2}
                      >
                        Learn More
                      </Button>
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>

        {/* Diagonal Transition to White */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height="100px"
          bg="white"
          transform="skewY(-2deg)"
          transformOrigin="top left"
        />
      </Box>

      {/* Process Section - White Background */}
      <Box bg="white" pt={20} pb={32} position="relative">
        <Container maxW="7xl">
          <VStack spacing={12}>
            <Box textAlign="center">
              <Heading size="3xl" color="#1A1A1A" mb={4}>
                Our Streamlined Process
              </Heading>
              <Text fontSize="lg" color="#666666" maxW="600px" mx="auto">
                From idea to implementation in weeks, not months
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} width="full">
              {process.map((step, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <VStack
                    align="center"
                    spacing={4}
                    p={8}
                    position="relative"
                  >
                    {index < process.length - 1 && (
                      <Box
                        position="absolute"
                        right={{ base: '50%', md: '-40px' }}
                        top={{ base: 'auto', md: '50px' }}
                        bottom={{ base: '-40px', md: 'auto' }}
                        w={{ base: '2px', md: '80px' }}
                        h={{ base: '80px', md: '2px' }}
                        bg="#C41E3A"
                        opacity={0.3}
                        transform={{ base: 'translateX(50%)', md: 'none' }}
                      />
                    )}
                    
                    <Box
                      w="80px"
                      h="80px"
                      bg="linear-gradient(135deg, #C41E3A, #DC143C)"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="0 8px 24px rgba(196, 30, 58, 0.3)"
                    >
                      <Icon as={step.icon} w={10} h={10} color="white" />
                    </Box>
                    
                    <VStack spacing={2} textAlign="center">
                      <Badge bg="#C41E3A" color="white" px={3} py={1} borderRadius="full">
                        Step {step.step}
                      </Badge>
                      <Heading size="lg" color="#1A1A1A">
                        {step.title}
                      </Heading>
                      <Text color="#666666" fontSize="sm">
                        {step.description}
                      </Text>
                      <Text color="#C41E3A" fontWeight="bold" fontSize="sm">
                        {step.duration}
                      </Text>
                    </VStack>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>

        {/* Diagonal Transition to Red */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height="100px"
          bg="linear-gradient(135deg, #C41E3A 0%, #DC143C 100%)"
          transform="skewY(-2deg)"
          transformOrigin="top left"
        />
      </Box>

      {/* Pricing Section - Red Background */}
      <Box
        bg="linear-gradient(135deg, #C41E3A 0%, #DC143C 100%)"
        color="white"
        pt={20}
        pb={32}
        position="relative"
      >
        <Container maxW="7xl">
          <VStack spacing={12}>
            <Box textAlign="center">
              <Heading size="3xl" mb={4}>
                Transparent Pricing
              </Heading>
              <Text fontSize="lg" opacity={0.95} maxW="600px" mx="auto">
                Flexible options designed to fit your budget and timeline
              </Text>
            </Box>

            <Card
              bg="whiteAlpha.100"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.300"
              borderRadius="24px"
              p={8}
              maxW="800px"
              mx="auto"
            >
              <CardBody>
                <VStack spacing={8}>
                  <Box textAlign="center">
                    <Heading size="2xl" mb={2}>
                      Custom Quote
                    </Heading>
                    <Text fontSize="lg" opacity={0.9}>
                      All services are customizable to your needs
                    </Text>
                  </Box>

                  <Box
                    bg="whiteAlpha.200"
                    p={6}
                    borderRadius="16px"
                    width="full"
                  >
                    <VStack spacing={4}>
                      <HStack justify="space-between" width="full">
                        <Text fontWeight="bold">MVP Development</Text>
                        <Text fontWeight="bold" fontSize="xl">$2,000 - $3,000</Text>
                      </HStack>
                      <Text fontSize="sm" opacity={0.9}>
                        2-week rapid prototype with full documentation and deployment support
                      </Text>
                    </VStack>
                  </Box>

                  <List spacing={3} width="full">
                    <ListItem>
                      <Icon as={CheckCircleIcon} mr={2} />
                      Quick turnaround - Start immediately
                    </ListItem>
                    <ListItem>
                      <Icon as={CheckCircleIcon} mr={2} />
                      Cost-effective solutions
                    </ListItem>
                    <ListItem>
                      <Icon as={CheckCircleIcon} mr={2} />
                      Flexible payment terms
                    </ListItem>
                    <ListItem>
                      <Icon as={CheckCircleIcon} mr={2} />
                      Satisfaction guaranteed
                    </ListItem>
                  </List>

                  <Button
                    size="lg"
                    bg="white"
                    color="#C41E3A"
                    width="full"
                    _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    Get Your Custom Quote
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      {/* Final CTA Section - Cream Background */}
      <Box bg="#FAF0E6" py={20}>
        <Container maxW="7xl">
          <Card
            bg="white"
            borderRadius="24px"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.1)"
            overflow="hidden"
          >
            <CardBody p={{ base: 8, md: 12 }}>
              <VStack spacing={8} textAlign="center">
                <Heading size="2xl" color="#1A1A1A">
                  Ready to Transform Your Business with AI?
                </Heading>
                <Text fontSize="lg" color="#666666" maxW="600px">
                  Available for immediate start. Let's build something amazing together.
                </Text>
                
                <HStack spacing={4}>
                  <Button
                    size="lg"
                    bg="linear-gradient(135deg, #C41E3A, #DC143C)"
                    color="white"
                    leftIcon={<CalendarIcon />}
                    _hover={{ transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    Schedule Discovery Call
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    color="#C41E3A"
                    borderColor="#C41E3A"
                    leftIcon={<PhoneIcon />}
                    _hover={{ bg: '#C41E3A', color: 'white' }}
                  >
                    Contact Now
                  </Button>
                </HStack>

                <Text fontSize="sm" color="#666666" fontStyle="italic">
                  First consultation: $150/hour - Applied to project cost if we proceed
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};