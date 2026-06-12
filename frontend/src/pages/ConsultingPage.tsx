import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Stack,
  SimpleGrid,
  Grid,
  Card,
  CardBody,
  Button,
  Icon,
  List,
  ListItem,
  Flex,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  PhoneIcon,
  CalendarIcon,
} from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Kicker } from '../components/Kicker';

const MotionBox = motion.div;

export const ConsultingPage: React.FC = () => {
  const { t } = useTranslation();

  // Hairline-cell services (handoff §6): numerals 01-08 in Bodoni gold
  const services = [
    'aiStrategy',
    'mlDevelopment',
    'computerVision',
    'nlp',
    'dataAnalysis',
    'training',
    'mcp',
    'platformDev',
  ];

  // Process steps: numbered gold-border circles (current content uses "Paso 1/2/3")
  const process = [
    { step: '1', key: 'discovery' },
    { step: '2', key: 'mvp' },
    { step: '3', key: 'deployment' },
  ];
  return (
    <Box>
      {/* Hero Section with Red Background */}
      <Box
        position="relative"
        bgGradient="linear(135deg, red.600, brand.secondary)"
        color="white"
        overflow="hidden"
      >
        <Container maxW="1180px" py={{ base: 16, md: 24 }} position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box mb={5}>
                <Kicker centered color="brand.goldBright">
                  {t('consulting.hero.kicker')}
                </Kicker>
              </Box>
              <Heading as="h1" textStyle="pageTitle" mb={4}>
                {t('consulting.hero.title')}
              </Heading>
              <Text textStyle="lead" maxW="800px" mx="auto" opacity={0.95}>
                {t('consulting.hero.description')}
              </Text>
            </MotionBox>
            
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={8} w={{ base: 'full', sm: 'auto' }}>
              <Button
                size="lg"
                bg="white"
                color="red.600"
                w={{ base: 'full', sm: 'auto' }}
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
                w={{ base: 'full', sm: 'auto' }}
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                {t('consulting.hero.viewPricingButton')}
              </Button>
            </Stack>
          </VStack>
        </Container>

        {/* Diagonal Transition */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height="100px"
          bg="brand.creamSoft"
          transform="skewY(-2deg)"
          transformOrigin="top left"
        />
      </Box>

      {/* Services Section - Cream Background, hairline-cell grid (handoff §6) */}
      <Box bg="brand.creamSoft" pt={{ base: 8, md: 20 }} pb={{ base: 28, md: 32 }} position="relative">
        <Container maxW="1180px">
          <VStack spacing={{ base: 6, md: 12 }}>
            <VStack spacing={{ base: 3, md: 4 }} textAlign="center">
              <Kicker centered>{t('consulting.hero.kicker')}</Kicker>
              <Heading textStyle="sectionTitle" color="brand.text">
                {t('consulting.servicesSection.title')}
              </Heading>
              <Text textStyle="lead" color="brand.textMuted" maxW="600px" mx="auto">
                {t('consulting.servicesSection.subtitle')}
              </Text>
            </VStack>

            {/* Cells joined by hairlines: 1px gaps over a faint ink wrapper */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
              gap="1px"
              bg="rgba(24,20,40,.1)"
              borderRadius="12px"
              overflow="hidden"
              width="full"
            >
              {services.map((serviceKey, index) => (
                <Box
                  key={serviceKey}
                  bg="brand.cream"
                  p={{ base: 5, md: 7 }}
                  transition="background .3s ease"
                  _hover={{ bg: 'brand.bgCard' }}
                >
                  <Text
                    fontFamily="heading"
                    fontWeight={600}
                    fontSize="38px"
                    lineHeight={1}
                    color="brand.accent"
                    mb={3}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <Heading as="h3" fontFamily="heading" fontWeight={600} fontSize="19px" color="brand.text" mb={2}>
                    {t(`consulting.services.${serviceKey}.title`)}
                  </Heading>
                  <Text color="brand.textMuted" fontSize="sm" lineHeight="1.65">
                    {t(`consulting.services.${serviceKey}.description`)}
                  </Text>
                  <List spacing={1.5} mt={3} display={{ base: 'none', md: 'block' }}>
                    {Object.keys(t(`consulting.services.${serviceKey}.features`, { returnObjects: true })).slice(0, 3).map((featureKey, i) => (
                      <ListItem key={i} fontSize="xs" color="brand.textMuted">
                        <Icon as={CheckCircleIcon} color="brand.secondary" mr={2} />
                        {t(`consulting.services.${serviceKey}.features.${featureKey}`)}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </Grid>
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

      {/* Process Section - White Background, gold-circle steps (handoff §6) */}
      <Box bg="white" pt={{ base: 12, md: 20 }} pb={32} position="relative">
        <Container maxW="1180px">
          <VStack spacing={12}>
            <Box textAlign="center">
              <Heading textStyle="sectionTitle" color="brand.text" mb={4}>
                {t('consulting.process.title')}
              </Heading>
              <Text textStyle="lead" color="brand.textMuted" maxW="600px" mx="auto">
                {t('consulting.process.subtitle')}
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 10, md: 8 }} width="full">
              {process.map((step, index) => (
                <MotionBox
                  key={step.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4} textAlign={{ base: 'center', md: 'left' }}>
                    {/* 34px gold-border circle with the step number */}
                    <Flex
                      w="34px"
                      h="34px"
                      borderRadius="full"
                      border="1px solid"
                      borderColor="brand.accent"
                      align="center"
                      justify="center"
                      fontFamily="heading"
                      fontWeight={600}
                      fontSize="15px"
                      color="brand.goldRich"
                      flexShrink={0}
                    >
                      {step.step}
                    </Flex>
                    <Heading as="h3" fontSize="18px" fontFamily="body" fontWeight={600} color="brand.text">
                      {t(`consulting.process.steps.${step.key}.title`)}
                    </Heading>
                    <Text color="brand.textMuted" fontSize="14px" lineHeight="1.65">
                      {t(`consulting.process.steps.${step.key}.description`)}
                    </Text>
                    <Text color="brand.secondary" fontWeight="600" fontSize="sm">
                      {t(`consulting.process.steps.${step.key}.duration`)}
                    </Text>
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
          bgGradient="linear(135deg, red.600, brand.secondary)"
          transform="skewY(-2deg)"
          transformOrigin="top left"
        />
      </Box>

      {/* Pricing Section - Red Background */}
      <Box
        bgGradient="linear(135deg, red.600, brand.secondary)"
        color="white"
        pt={{ base: 12, md: 20 }}
        pb={{ base: 12, md: 20 }}
        position="relative"
      >
        <Container maxW="1180px">
          <VStack spacing={12}>
            <Box textAlign="center">
              <Heading textStyle="sectionTitle" mb={4}>
                {t('consulting.pricing.title')}
              </Heading>
              <Text textStyle="lead" opacity={0.95} maxW="600px" mx="auto">
                {t('consulting.pricing.subtitle')}
              </Text>
            </Box>

            <Card
              bg="whiteAlpha.100"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.300"
              borderRadius="24px"
              p={{ base: 4, md: 8 }}
              maxW="800px"
              w="full"
              mx="auto"
            >
              <CardBody>
                <VStack spacing={8}>
                  <Box textAlign="center">
                    <Heading as="h3" textStyle="cardTitle" mb={2}>
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
                    color="red.600"
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
      <Box bg="brand.creamSoft" py={{ base: 12, md: 20 }}>
        <Container maxW="1180px">
          <Card
            bg="white"
            borderRadius="24px"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.1)"
            overflow="hidden"
          >
            <CardBody p={{ base: 8, md: 12 }}>
              <VStack spacing={8} textAlign="center">
                <Heading textStyle="sectionTitle" color="brand.text">
                  {t('consulting.finalCta.title')}
                </Heading>
                <Text fontSize="lg" color="brand.textMuted" maxW="600px">
                  {t('consulting.finalCta.description')}
                </Text>
                
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} w={{ base: 'full', sm: 'auto' }}>
                  <Button
                    size="lg"
                    bgGradient="linear(135deg, red.600, brand.secondary)"
                    color="white"
                    w={{ base: 'full', sm: 'auto' }}
                    leftIcon={<CalendarIcon />}
                    _hover={{ transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    {t('consulting.finalCta.scheduleButton')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    color="red.600"
                    borderColor="red.600"
                    w={{ base: 'full', sm: 'auto' }}
                    leftIcon={<PhoneIcon />}
                    _hover={{ bg: 'red.600', color: 'white' }}
                  >
                    {t('consulting.finalCta.contactButton')}
                  </Button>
                </Stack>

                <Text fontSize="sm" color="brand.textMuted" fontStyle="italic">
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