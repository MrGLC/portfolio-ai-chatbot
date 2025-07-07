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
import { useTranslation } from 'react-i18next';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export const ConsultingPage: React.FC = () => {
  const { t } = useTranslation();

  const services = [
    {
      key: 'aiStrategy',
      icon: InfoIcon,
    },
    {
      key: 'mlDevelopment',
      icon: SettingsIcon,
    },
    {
      key: 'computerVision',
      icon: ViewIcon,
    },
    {
      key: 'nlp',
      icon: ChatIcon,
    },
    {
      key: 'dataAnalysis',
      icon: StarIcon,
    },
    {
      key: 'training',
      icon: CalendarIcon,
    },
    {
      key: 'mcp',
      icon: ExternalLinkIcon,
    },
    {
      key: 'platformDev',
      icon: ArrowForwardIcon,
    },
  ];

  const process = [
    {
      step: 1,
      key: 'discovery',
      icon: InfoIcon,
    },
    {
      step: 2,
      key: 'mvp',
      icon: SettingsIcon,
    },
    {
      step: 3,
      key: 'deployment',
      icon: CheckCircleIcon,
    },
  ];
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
                {t('consulting.hero.title')}
              </Heading>
              <Text fontSize="xl" maxW="800px" mx="auto" opacity={0.95}>
                {t('consulting.hero.description')}
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
                {t('consulting.hero.getStartedButton')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                {t('consulting.hero.viewPricingButton')}
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
                {t('consulting.servicesSection.title')}
              </Heading>
              <Text fontSize="lg" color="#666666" maxW="600px" mx="auto">
                {t('consulting.servicesSection.subtitle')}
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
                        {t(`consulting.services.${service.key}.title`)}
                      </Heading>
                      
                      <Text color="#666666" fontSize="sm" minH="60px">
                        {t(`consulting.services.${service.key}.description`)}
                      </Text>
                      
                      <List spacing={2}>
                        {Object.keys(t(`consulting.services.${service.key}.features`, { returnObjects: true })).slice(0, 3).map((featureKey, i) => (
                          <ListItem key={i} fontSize="xs" color="#666666">
                            <Icon as={CheckCircleIcon} color="#C41E3A" mr={2} />
                            {t(`consulting.services.${service.key}.features.${featureKey}`)}
                          </ListItem>
                        ))}
                      </List>
                      
                      <Button
                        variant="ghost"
                        color="#C41E3A"
                        rightIcon={<ChevronRightIcon />}
                        mt={2}
                      >
                        {t('consulting.learnMoreButton')}
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
                {t('consulting.process.title')}
              </Heading>
              <Text fontSize="lg" color="#666666" maxW="600px" mx="auto">
                {t('consulting.process.subtitle')}
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
                        {t(`consulting.process.steps.${step.key}.step`)}
                      </Badge>
                      <Heading size="lg" color="#1A1A1A">
                        {t(`consulting.process.steps.${step.key}.title`)}
                      </Heading>
                      <Text color="#666666" fontSize="sm">
                        {t(`consulting.process.steps.${step.key}.description`)}
                      </Text>
                      <Text color="#C41E3A" fontWeight="bold" fontSize="sm">
                        {t(`consulting.process.steps.${step.key}.duration`)}
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
                {t('consulting.pricing.title')}
              </Heading>
              <Text fontSize="lg" opacity={0.95} maxW="600px" mx="auto">
                {t('consulting.pricing.subtitle')}
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
                      {t('consulting.pricing.customQuote.title')}
                    </Heading>
                    <Text fontSize="lg" opacity={0.9}>
                      {t('consulting.pricing.customQuote.subtitle')}
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
                        <Text fontWeight="bold">{t('consulting.pricing.customQuote.mvpTitle')}</Text>
                        <Text fontWeight="bold" fontSize="xl">{t('consulting.pricing.customQuote.mvpPrice')}</Text>
                      </HStack>
                      <Text fontSize="sm" opacity={0.9}>
                        {t('consulting.pricing.customQuote.mvpDescription')}
                      </Text>
                    </VStack>
                  </Box>

                  <List spacing={3} width="full">
                    <ListItem>
                      <Icon as={CheckCircleIcon} mr={2} />
                      {t('consulting.pricing.customQuote.features.turnaround')}
                    </ListItem>
                    <ListItem>
                      <Icon as={CheckCircleIcon} mr={2} />
                      {t('consulting.pricing.customQuote.features.costEffective')}
                    </ListItem>
                    <ListItem>
                      <Icon as={CheckCircleIcon} mr={2} />
                      {t('consulting.pricing.customQuote.features.flexiblePayment')}
                    </ListItem>
                    <ListItem>
                      <Icon as={CheckCircleIcon} mr={2} />
                      {t('consulting.pricing.customQuote.features.satisfaction')}
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
                    {t('consulting.pricing.customQuote.button')}
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
                  {t('consulting.finalCta.title')}
                </Heading>
                <Text fontSize="lg" color="#666666" maxW="600px">
                  {t('consulting.finalCta.description')}
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
                    {t('consulting.finalCta.scheduleButton')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    color="#C41E3A"
                    borderColor="#C41E3A"
                    leftIcon={<PhoneIcon />}
                    _hover={{ bg: '#C41E3A', color: 'white' }}
                  >
                    {t('consulting.finalCta.contactButton')}
                  </Button>
                </HStack>

                <Text fontSize="sm" color="#666666" fontStyle="italic">
                  {t('consulting.finalCta.consultationNote')}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};