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
import { useTranslation } from 'react-i18next';
import { 
  ArrowForwardIcon,
  EmailIcon,
  PhoneIcon,
  ExternalLinkIcon,
  TimeIcon,
  CheckCircleIcon,
  StarIcon
} from '@chakra-ui/icons';
import { durations, easings, delays, variants, transitions } from '../theme/animations';

const MotionBox = motion(Box);
const MotionCard = motion(Card);




export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  const contactInfo = [
    { icon: EmailIcon, label: t('about.contact.email.label'), value: t('about.contact.email.value'), href: `mailto:${t('about.contact.email.value')}` },
    { icon: PhoneIcon, label: t('about.contact.phone.label'), value: t('about.contact.phone.value'), href: 'tel:+526143447013' },
    { icon: ExternalLinkIcon, label: t('about.contact.linkedin.label'), value: t('about.contact.linkedin.value'), href: 'https://linkedin.com/in/gomezgg/' },
    { icon: ExternalLinkIcon, label: t('about.contact.github.label'), value: t('about.contact.github.value'), href: 'https://github.com/MrGLC' },
    { icon: ExternalLinkIcon, label: t('about.contact.website.label'), value: t('about.contact.website.value'), href: 'https://la-realeza.com' },
  ];

  const valueProps = [
    {
      icon: StarIcon,
      title: t('about.valueProposition.items.fastDelivery.title'),
      description: t('about.valueProposition.items.fastDelivery.description'),
    },
    {
      icon: StarIcon,
      title: t('about.valueProposition.items.costEffective.title'),
      description: t('about.valueProposition.items.costEffective.description'),
    },
    {
      icon: CheckCircleIcon,
      title: t('about.valueProposition.items.responsive.title'),
      description: t('about.valueProposition.items.responsive.description'),
    },
    {
      icon: TimeIcon,
      title: t('about.valueProposition.items.timeEfficient.title'),
      description: t('about.valueProposition.items.timeEfficient.description'),
    },
  ];

  const skillCategories = [
    {
      key: 'machineLearning',
      title: t('about.technicalExpertise.categories.machineLearning.title'),
      skills: t('about.technicalExpertise.categories.machineLearning.skills', { returnObjects: true }) as string[]
    },
    {
      key: 'nlpAiAgents',
      title: t('about.technicalExpertise.categories.nlpAiAgents.title'),
      skills: t('about.technicalExpertise.categories.nlpAiAgents.skills', { returnObjects: true }) as string[]
    },
    {
      key: 'orchestrationDeployment',
      title: t('about.technicalExpertise.categories.orchestrationDeployment.title'),
      skills: t('about.technicalExpertise.categories.orchestrationDeployment.skills', { returnObjects: true }) as string[]
    },
    {
      key: 'frontendDevelopment',
      title: t('about.technicalExpertise.categories.frontendDevelopment.title'),
      skills: t('about.technicalExpertise.categories.frontendDevelopment.skills', { returnObjects: true }) as string[]
    }
  ];

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
            transition={{ duration: durations.slower, ease: easings.smooth }}
          >
            <VStack spacing={6} textAlign="center">
              <Text variant="luxury" color="brand.accent" fontSize="sm">
                {t('about.hero.role')}
              </Text>
              <Heading 
                size="4xl" 
                color="white"
                fontWeight="800"
                letterSpacing="-0.03em"
              >
                {t('about.hero.name')}
              </Heading>
              <Text 
                fontSize="xl" 
                color="whiteAlpha.900" 
                maxW="700px"
                lineHeight="1.8"
              >
                {t('about.hero.description')}
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
                  {t('about.hero.badges.location')}
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
                  {t('about.hero.badges.english')}
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
                  {t('about.hero.getInTouch')}
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
                  {t('about.hero.viewProjects')}
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
            transition={{ duration: durations.slow, ease: easings.smooth }}
          >
            <VStack spacing={16} align="stretch">
              {/* Bio Section */}
              <Box textAlign="center">
                <Heading size="3xl" color="brand.text" mb={6}>
                  {t('about.bio.title')}
                </Heading>
                <Card 
                  bg="brand.surface" 
                  boxShadow="0 4px 16px rgba(0, 0, 0, 0.08)"
                  borderRadius="16px"
                >
                  <CardBody p={{ base: 6, md: 10 }}>
                    <VStack spacing={6} align="stretch">
                      {(t('about.bio.paragraphs', { returnObjects: true }) as string[]).map((paragraph, index) => (
                        <Text key={index} color="brand.textSecondary" lineHeight="1.8" fontSize="lg">
                          {paragraph}
                        </Text>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </Box>

              {/* Contact Information */}
              <Box>
                <Heading size="2xl" color="brand.text" mb={8} textAlign="center">
                  {t('about.contact.title')}
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
                          transition={{ delay: index * delays.staggerNormal, duration: durations.normal, ease: easings.smooth }}
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
                              transition={transitions.normal}
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
              {t('about.technicalExpertise.title')}
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {skillCategories.map((category, index) => (
                <MotionCard
                  key={category.key}
                  bg="brand.cream"
                  boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)"
                  borderRadius="16px"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * delays.staggerNormal, duration: durations.normal, ease: easings.smooth }}
                >
                  <CardBody p={{ base: 6, md: 8 }}>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md" color="brand.secondary">
                        {category.title}
                      </Heading>
                      <Wrap spacing={3}>
                        {category.skills.map((skill) => (
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
                {t('about.valueProposition.title')}
              </Heading>
              <Text fontSize="xl" color="brand.textSecondary" maxW="700px" mx="auto">
                {t('about.valueProposition.subtitle')}
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
                  transition={{ delay: index * delays.staggerNormal, duration: durations.normal, ease: easings.smooth }}
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
                    {t('about.finalCta.title')}
                  </Heading>
                  <Text fontSize="lg" color="whiteAlpha.900" maxW="600px">
                    {t('about.finalCta.description')}
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
                      transition={transitions.normal}
                      rightIcon={<EmailIcon />}
                      as="a"
                      href="mailto:ingbmluisgomez@gmail.com"
                    >
                      {t('about.finalCta.startProject')}
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
                        {t('about.finalCta.connectLinkedIn')}
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