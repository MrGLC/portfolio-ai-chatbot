import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Button,
  HStack,
  Icon,
  Divider,
  Link,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  ArrowForwardIcon,
  EmailIcon,
  PhoneIcon,
  ExternalLinkIcon,
  TimeIcon,
  CheckCircleIcon,
  StarIcon
} from '@chakra-ui/icons';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const skills = {
  'Machine Learning': [
    'Traditional ML Models',
    'Scikit-learn',
    'XGBoost',
    'Feature Engineering',
    'Model Optimization'
  ],
  'NLP & AI Agents': [
    'LangChain',
    'LangGraph', 
    'Pydantic',
    'GPT Integration',
    'RAG Systems'
  ],
  'Orchestration & Deployment': [
    'Docker',
    'FastAPI',
    'Flask',
    'REST APIs',
    'Cloud Deployment'
  ],
  'Frontend Development': [
    'React',
    'TypeScript',
    'Flutter',
    'Responsive Design',
    'UI/UX'
  ]
};

const contactInfo = [
  { icon: EmailIcon, label: 'Email', value: 'ingbmluisgomez@gmail.com', href: 'mailto:ingbmluisgomez@gmail.com' },
  { icon: PhoneIcon, label: 'Phone', value: '+52 614 344 7013', href: 'tel:+526143447013' },
  { icon: ExternalLinkIcon, label: 'LinkedIn', value: '/in/gomezgg/', href: 'https://linkedin.com/in/gomezgg/' },
  { icon: ExternalLinkIcon, label: 'GitHub', value: '/MrGLC', href: 'https://github.com/MrGLC' },
  { icon: ExternalLinkIcon, label: 'Website', value: 'la-realeza.com', href: 'https://la-realeza.com' },
];

const valueProps = [
  {
    icon: StarIcon,
    title: 'Fast Delivery',
    description: '2-week MVPs from concept to deployment',
  },
  {
    icon: StarIcon,
    title: 'Cost-Effective',
    description: 'Complete MVPs for $2-3k investment',
  },
  {
    icon: CheckCircleIcon,
    title: 'Responsive',
    description: 'Available and communicative throughout projects',
  },
  {
    icon: TimeIcon,
    title: 'Time-Efficient',
    description: 'Quick turnaround without compromising quality',
  },
];

export const AboutPage: React.FC = () => {
  return (
    <Box>
      {/* Hero Section with Royal Red Background */}
      <Box
        bg="linear-gradient(135deg, var(--chakra-colors-brand-secondary) 0%, var(--chakra-colors-brand-redDark) 100%)"
        position="relative"
        overflow="hidden"
      >
        <Container maxW="6xl" py={{ base: 16, md: 24 }} position="relative" zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <VStack spacing={6} textAlign="center">
              <Text variant="luxury" color="brand.accent" fontSize="sm">
                MACHINE LEARNING ENGINEER
              </Text>
              <Heading 
                size="4xl" 
                color="white"
                fontWeight="800"
                letterSpacing="-0.03em"
              >
                Luis Alberto Gomez Celaya
              </Heading>
              <Text 
                fontSize="xl" 
                color="whiteAlpha.900" 
                maxW="700px"
                lineHeight="1.8"
              >
                Building intelligent solutions that deliver real business value through
                modern ML engineering and rapid MVP development
              </Text>
              <HStack spacing={6} pt={4}>
                <Badge 
                  px={4} 
                  py={2} 
                  borderRadius="full" 
                  bg="whiteAlpha.200" 
                  color="white"
                  fontSize="md"
                  fontWeight="600"
                >
                  Mexico Based
                </Badge>
                <Badge 
                  px={4} 
                  py={2} 
                  borderRadius="full" 
                  bg="whiteAlpha.200" 
                  color="white"
                  fontSize="md"
                  fontWeight="600"
                >
                  English C1 Level
                </Badge>
              </HStack>
              <HStack spacing={4} pt={4}>
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowForwardIcon />}
                  as="a"
                  href="mailto:ingbmluisgomez@gmail.com"
                >
                  Get in Touch
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  borderColor="white"
                  color="white"
                  _hover={{
                    bg: 'whiteAlpha.200',
                    borderColor: 'white',
                  }}
                  as="a"
                  href="#projects"
                >
                  View Projects
                </Button>
              </HStack>
            </VStack>
          </MotionBox>
        </Container>
        
        {/* Decorative diagonal transition */}
        <Box
          position="absolute"
          bottom={-1}
          left={0}
          right={0}
          height="120px"
          bg="brand.primary"
          transform="skewY(-3deg)"
          transformOrigin="top left"
        />
      </Box>

      {/* About/Bio Section - Cream Background */}
      <Box bg="brand.primary" py={20}>
        <Container maxW="6xl">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={16} align="stretch">
              {/* Bio Section */}
              <Box textAlign="center">
                <Heading size="3xl" color="brand.text" mb={6}>
                  About Me
                </Heading>
                <Card 
                  bg="brand.surface" 
                  boxShadow="0 4px 16px rgba(0, 0, 0, 0.08)"
                  borderRadius="16px"
                >
                  <CardBody p={{ base: 6, md: 10 }}>
                    <VStack spacing={6} align="stretch">
                      <Text color="brand.textSecondary" lineHeight="1.8" fontSize="lg">
                        I'm a Machine Learning Engineer with 3 years of experience building 
                        intelligent systems that solve real-world problems. With a background in 
                        Biomedical Engineering and hands-on experience at companies like ScaleAI 
                        and SoldaAI, I specialize in transforming complex ML concepts into 
                        production-ready solutions.
                      </Text>
                      <Text color="brand.textSecondary" lineHeight="1.8" fontSize="lg">
                        My expertise spans from developing hospital ML systems to creating 
                        cutting-edge NLP applications with modern frameworks. I've published 
                        research in the field and have a proven track record of delivering 
                        MVPs in just 2 weeks for $2-3k, making advanced AI accessible to 
                        businesses of all sizes.
                      </Text>
                      <Text color="brand.textSecondary" lineHeight="1.8" fontSize="lg">
                        What sets me apart is my commitment to rapid delivery without 
                        compromising quality. I believe in being highly responsive and 
                        available throughout the project lifecycle, ensuring clear 
                        communication and exceptional results.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>

              {/* Contact Information */}
              <Box>
                <Heading size="2xl" color="brand.text" mb={8} textAlign="center">
                  Let's Connect
                </Heading>
                <Card 
                  bg="brand.surface" 
                  boxShadow="0 4px 16px rgba(0, 0, 0, 0.08)"
                  borderRadius="16px"
                >
                  <CardBody p={{ base: 6, md: 8 }}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {contactInfo.map((contact, index) => (
                        <MotionBox
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link 
                            href={contact.href}
                            isExternal
                            _hover={{ textDecoration: 'none' }}
                          >
                            <HStack 
                              spacing={4} 
                              p={4} 
                              borderRadius="12px"
                              bg="brand.cream"
                              transition="all 0.3s ease"
                              _hover={{
                                bg: 'brand.creamDark',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                              }}
                            >
                              <Icon 
                                as={contact.icon} 
                                boxSize={6} 
                                color="brand.secondary"
                              />
                              <Box>
                                <Text fontSize="sm" color="brand.textSecondary">
                                  {contact.label}
                                </Text>
                                <Text fontWeight="600" color="brand.text">
                                  {contact.value}
                                </Text>
                              </Box>
                            </HStack>
                          </Link>
                        </MotionBox>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </Box>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Skills Section - White Background */}
      <Box bg="brand.surface" py={20} position="relative">
        {/* Diagonal transition from cream to white */}
        <Box
          position="absolute"
          top={-119}
          left={0}
          right={0}
          height="120px"
          bg="brand.surface"
          transform="skewY(-3deg)"
          transformOrigin="bottom right"
        />
        
        <Container maxW="6xl">
          <VStack spacing={12} align="stretch">
            <Heading size="3xl" color="brand.text" textAlign="center">
              Technical Expertise
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {Object.entries(skills).map(([category, skillList], index) => (
                <MotionCard
                  key={category}
                  bg="brand.cream"
                  boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)"
                  borderRadius="16px"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CardBody p={{ base: 6, md: 8 }}>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md" color="brand.secondary">
                        {category}
                      </Heading>
                      <Wrap spacing={3}>
                        {skillList.map((skill) => (
                          <WrapItem key={skill}>
                            <Badge 
                              px={3} 
                              py={1.5} 
                              borderRadius="full"
                              bg="brand.surface"
                              color="brand.text"
                              fontSize="sm"
                              fontWeight="500"
                              border="1px solid"
                              borderColor="brand.border"
                            >
                              {skill}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Value Proposition Section - Cream Background */}
      <Box bg="brand.primary" py={20} position="relative">
        {/* Diagonal transition from white to cream */}
        <Box
          position="absolute"
          top={-119}
          left={0}
          right={0}
          height="120px"
          bg="brand.primary"
          transform="skewY(3deg)"
          transformOrigin="bottom left"
        />
        
        <Container maxW="6xl">
          <VStack spacing={12} align="stretch">
            <Box textAlign="center">
              <Heading size="3xl" color="brand.text" mb={4}>
                Why Work With Me
              </Heading>
              <Text fontSize="xl" color="brand.textSecondary" maxW="700px" mx="auto">
                I deliver high-quality ML solutions with unmatched speed and value
              </Text>
            </Box>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {valueProps.map((prop, index) => (
                <MotionCard
                  key={index}
                  bg="brand.surface"
                  boxShadow="0 4px 16px rgba(0, 0, 0, 0.08)"
                  borderRadius="16px"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CardBody p={{ base: 6, md: 8 }}>
                    <HStack spacing={4} align="start">
                      <Box
                        p={3}
                        borderRadius="12px"
                        bg="brand.accent"
                        color="brand.text"
                      >
                        <Icon as={prop.icon} boxSize={6} />
                      </Box>
                      <VStack align="start" spacing={2} flex={1}>
                        <Heading size="md" color="brand.text">
                          {prop.title}
                        </Heading>
                        <Text color="brand.textSecondary">
                          {prop.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>

            {/* CTA Card */}
            <Card 
              bg="linear-gradient(135deg, var(--chakra-colors-brand-secondary) 0%, var(--chakra-colors-brand-redDark) 100%)"
              boxShadow="0 8px 32px rgba(220, 20, 60, 0.2)"
              borderRadius="16px"
              overflow="hidden"
            >
              <CardBody p={{ base: 8, md: 12 }}>
                <VStack spacing={6} textAlign="center">
                  <Heading size="2xl" color="white">
                    Ready to Build Your MVP?
                  </Heading>
                  <Text fontSize="lg" color="whiteAlpha.900" maxW="600px">
                    Let's transform your ideas into production-ready ML solutions. 
                    Get a fully functional MVP in just 2 weeks for $2-3k.
                  </Text>
                  <HStack spacing={4}>
                    <Button
                      size="lg"
                      bg="brand.accent"
                      color="brand.text"
                      _hover={{
                        bg: 'brand.accentLight',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(255, 215, 0, 0.4)',
                      }}
                      rightIcon={<EmailIcon />}
                      as="a"
                      href="mailto:ingbmluisgomez@gmail.com"
                    >
                      Start Your Project
                    </Button>
                    <Link href="https://linkedin.com/in/gomezgg/" isExternal _hover={{ textDecoration: 'none' }}>
                      <Button
                        size="lg"
                        variant="outline"
                        borderColor="white"
                        color="white"
                        _hover={{
                          bg: 'whiteAlpha.200',
                          borderColor: 'white',
                        }}
                      >
                        Connect on LinkedIn
                      </Button>
                    </Link>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};