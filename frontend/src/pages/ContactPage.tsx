import React, { useState } from 'react';
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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Icon,
  Link,
  Badge,
  Divider,
  Stack,
  Flex,
} from '@chakra-ui/react';
import { EmailIcon, PhoneIcon, CalendarIcon, ExternalLinkIcon, CheckIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Kicker } from '../components/Kicker';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

// Handoff dark band tokens (README "Design Tokens" + §8 Contacto)
const DARK_GRADIENT = 'linear-gradient(165deg, #1c0710 0%, #330a1c 55%, #190610 100%)';
const GLASS_PANEL_BG = 'rgba(255,255,255,.035)';
const GLASS_PANEL_BORDER = 'rgba(243,233,216,.14)';
const INPUT_BG = 'rgba(255,255,255,.04)';
const INPUT_BORDER = 'rgba(243,233,216,.18)';
const ERROR_COLOR = '#ff8aa3';
const SUCCESS_GREEN = '#5fd29b';
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Shared styling for inputs/selects/textarea on the dark glass panel
const darkFieldProps = {
  variant: 'unstyled' as const,
  bg: INPUT_BG,
  border: '1px solid',
  borderColor: INPUT_BORDER,
  borderRadius: '8px',
  color: 'brand.creamText',
  px: 4,
  py: 3,
  transition: 'border-color .25s ease',
  _hover: { borderColor: 'rgba(243,233,216,.32)' },
  _focus: { borderColor: 'brand.accent', outline: 'none' },
  _placeholder: { color: 'rgba(243,233,216,.45)' },
};

// 12px caps gold labels per handoff form spec
const darkLabelProps = {
  color: 'brand.accent',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  mb: 2,
};


export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  
  const contactMethods = [
    {
      icon: EmailIcon,
      title: t('contact.methods.email.title'),
      description: t('contact.methods.email.description'),
      value: 'ingbmluisgomez@gmail.com',
      link: 'mailto:ingbmluisgomez@gmail.com',
      responseTime: t('contact.methods.email.responseTime'),
    },
    {
      icon: PhoneIcon,
      title: t('contact.methods.phone.title'),
      description: t('contact.methods.phone.description'),
      value: '+52 614 344 7013',
      link: 'tel:+526143447013',
      responseTime: t('contact.methods.phone.responseTime'),
    },
    {
      icon: ExternalLinkIcon,
      title: t('contact.methods.linkedin.title'),
      description: t('contact.methods.linkedin.description'),
      value: 'linkedin.com/in/gomezgg',
      link: 'https://linkedin.com/in/gomezgg',
      responseTime: t('contact.methods.linkedin.responseTime'),
    },
    {
      icon: ExternalLinkIcon,
      title: t('contact.methods.github.title'),
      description: t('contact.methods.github.description'),
      value: 'github.com/MrGLC',
      link: 'https://github.com/MrGLC',
      responseTime: t('contact.methods.github.responseTime'),
    },
  ];

  const services = [
    t('contact.services.aiConsulting'),
    t('contact.services.computerVision'),
    t('contact.services.machineLearning'),
    t('contact.services.medicalAI'),
    t('contact.services.nlp'),
    t('contact.services.aiWorkflow'),
    t('contact.services.customTraining'),
    t('contact.services.mvpDevelopment'),
    t('contact.services.other'),
  ];

  const budgetRanges = [
    { value: '<3k', label: t('contact.budgetRanges.under3k') },
    { value: '3k-10k', label: t('contact.budgetRanges.3kTo10k') },
    { value: '10k-25k', label: t('contact.budgetRanges.10kTo25k') },
    { value: '25k-50k', label: t('contact.budgetRanges.25kTo50k') },
    { value: '50k+', label: t('contact.budgetRanges.over50k') },
  ];

  const timelines = [
    { value: 'immediate', label: t('contact.timelines.immediate') },
    { value: '2weeks', label: t('contact.timelines.2weeks') },
    { value: '1month', label: t('contact.timelines.1month') },
    { value: '1-3months', label: t('contact.timelines.1to3months') },
    { value: '3months+', label: t('contact.timelines.over3months') },
  ];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    budget: '',
    timeline: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [sent, setSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the field's error as the user types
    if (name === 'name' || name === 'email' || name === 'message') {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handoff validation: name non-empty, email regex, message non-empty
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!formData.name.trim()) nextErrors.name = t('contact.form.errors.name');
    if (!EMAIL_REGEX.test(formData.email)) nextErrors.email = t('contact.form.errors.email');
    if (!formData.message.trim()) nextErrors.message = t('contact.form.errors.message');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    // Submit stays local for now — wire to backend/email service later
    console.log('Form submitted:', formData);
    setSent(true);
  };

  return (
    <>
      {/* Hero Section with Red Background */}
      <Box bg="brand.secondary" py={{ base: 16, md: 24 }}>
        <Container maxW="1180px">
          <VStack spacing={8} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box mb={4}>
                <Kicker centered color="brand.goldBright">
                  {t('contact.hero.subtitle')}
                </Kicker>
              </Box>
              <Heading as="h1" textStyle="pageTitle" color="white" mb={4}>
                {t('contact.hero.title')}
              </Heading>
              <Text textStyle="lead" color="whiteAlpha.900" maxW="800px" mx="auto" mb={6}>
                {t('contact.hero.description')}
              </Text>
              <HStack spacing={4} justify="center" flexWrap="wrap" rowGap={2}>
                <Badge
                  bg="brand.accent"
                  color="brand.text" 
                  px={4} 
                  py={2} 
                  borderRadius="full"
                  fontSize="md"
                  fontWeight="600"
                >
                  {t('contact.hero.badge1')}
                </Badge>
                <Badge 
                  bg="whiteAlpha.200" 
                  color="white" 
                  px={4} 
                  py={2} 
                  borderRadius="full"
                  fontSize="md"
                >
                  {t('contact.hero.badge2')}
                </Badge>
              </HStack>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Form band — handoff §8: dark gradient, glass panel, gold labels.
          Only this band goes dark; the rest of the page stays light. */}
      <Box position="relative" overflow="hidden" background={DARK_GRADIENT}>
        {/* Decorative radial glows: crimson top-right, gold bottom-left */}
        <Box
          position="absolute"
          top="-140px"
          right="-120px"
          w="520px"
          h="520px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(193,14,53,.25), transparent 65%)"
          pointerEvents="none"
          aria-hidden="true"
        />
        <Box
          position="absolute"
          bottom="-160px"
          left="-140px"
          w="560px"
          h="560px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(194,160,92,.14), transparent 65%)"
          pointerEvents="none"
          aria-hidden="true"
        />

        <Container maxW="1180px" py="clamp(80px, 12vh, 140px)" position="relative">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 12, lg: 16 }} alignItems="center">
            {/* Left: heading + direct email with gold underline (handoff §8) */}
            <VStack align="flex-start" spacing={6}>
              <Kicker color="brand.accent">{t('contact.info.title')}</Kicker>
              <Heading as="h2" textStyle="sectionTitle" color="brand.creamText">
                {t('contact.form.title')}
              </Heading>
              <Text textStyle="lead" color="rgba(243,233,216,.72)">
                {t('contact.form.description')}
              </Text>
              <Link
                href="mailto:ingbmluisgomez@gmail.com"
                fontFamily="heading"
                fontWeight={600}
                fontSize="clamp(19px, 2.4vw, 28px)"
                color="brand.creamText"
                borderBottom="1px solid"
                borderColor="brand.accent"
                pb={1}
                wordBreak="break-all"
                _hover={{ color: 'brand.goldBright', textDecoration: 'none' }}
              >
                ingbmluisgomez@gmail.com
              </Link>
              <HStack spacing={6} pt={2}>
                <Link
                  href="https://linkedin.com/in/gomezgg"
                  isExternal
                  fontSize="sm"
                  fontWeight={600}
                  color="rgba(243,233,216,.8)"
                  _hover={{ color: 'brand.goldBright', textDecoration: 'none' }}
                >
                  LinkedIn
                </Link>
                <Link
                  href="https://github.com/MrGLC"
                  isExternal
                  fontSize="sm"
                  fontWeight={600}
                  color="rgba(243,233,216,.8)"
                  _hover={{ color: 'brand.goldBright', textDecoration: 'none' }}
                >
                  GitHub
                </Link>
              </HStack>
            </VStack>

            {/* Right: glass form panel */}
            <MotionBox
              bg={GLASS_PANEL_BG}
              border="1px solid"
              borderColor={GLASS_PANEL_BORDER}
              borderRadius="14px"
              backdropFilter="blur(6px)"
              p={{ base: 6, md: 8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {sent ? (
                /* Success state replaces the form (handoff Interactions) */
                <VStack spacing={5} py={12} textAlign="center">
                  <Flex
                    w="64px"
                    h="64px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={SUCCESS_GREEN}
                    align="center"
                    justify="center"
                  >
                    <CheckIcon color={SUCCESS_GREEN} boxSize={6} />
                  </Flex>
                  <Heading fontFamily="heading" fontWeight={600} fontSize="26px" color="brand.creamText">
                    {t('contact.form.success')}
                  </Heading>
                  <Text color="rgba(243,233,216,.7)" fontSize="sm">
                    {t('contact.form.successSubtext')}
                  </Text>
                </VStack>
              ) : (
                <Box as="form" onSubmit={handleSubmit} noValidate>
                  <VStack spacing={5}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} width="full">
                      <FormControl isInvalid={!!errors.name}>
                        <FormLabel {...darkLabelProps}>{t('contact.form.labels.name')}</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder={t('contact.form.placeholders.fullName')}
                          {...darkFieldProps}
                        />
                        {errors.name && (
                          <Text fontSize="12px" color={ERROR_COLOR} mt={1}>{errors.name}</Text>
                        )}
                      </FormControl>

                      <FormControl isInvalid={!!errors.email}>
                        <FormLabel {...darkLabelProps}>{t('contact.form.labels.email')}</FormLabel>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t('contact.form.placeholders.email')}
                          {...darkFieldProps}
                        />
                        {errors.email && (
                          <Text fontSize="12px" color={ERROR_COLOR} mt={1}>{errors.email}</Text>
                        )}
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel {...darkLabelProps}>
                        {t('contact.form.labels.company')}{' '}
                        <Text as="span" fontSize="10px" color="rgba(243,233,216,.5)" textTransform="none">
                          {t('contact.form.labels.companyOptional')}
                        </Text>
                      </FormLabel>
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.placeholders.companyName')}
                        {...darkFieldProps}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel {...darkLabelProps}>{t('contact.form.labels.service')}</FormLabel>
                      <Select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.placeholders.selectService')}
                        iconColor="rgba(243,233,216,.6)"
                        sx={{ '> option': { color: '#181428', background: '#fff' } }}
                        {...darkFieldProps}
                      >
                        {services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} width="full">
                      <FormControl>
                        <FormLabel {...darkLabelProps}>{t('contact.form.labels.budget')}</FormLabel>
                        <Select
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          placeholder={t('contact.form.placeholders.selectBudget')}
                          iconColor="rgba(243,233,216,.6)"
                          sx={{ '> option': { color: '#181428', background: '#fff' } }}
                          {...darkFieldProps}
                        >
                          {budgetRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel {...darkLabelProps}>{t('contact.form.labels.timeline')}</FormLabel>
                        <Select
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleInputChange}
                          placeholder={t('contact.form.placeholders.selectTimeline')}
                          iconColor="rgba(243,233,216,.6)"
                          sx={{ '> option': { color: '#181428', background: '#fff' } }}
                          {...darkFieldProps}
                        >
                          {timelines.map((timeline) => (
                            <option key={timeline.value} value={timeline.value}>
                              {timeline.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>

                    <FormControl isInvalid={!!errors.message}>
                      <FormLabel {...darkLabelProps}>{t('contact.form.labels.message')}</FormLabel>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.placeholders.message')}
                        rows={4}
                        {...darkFieldProps}
                      />
                      {errors.message && (
                        <Text fontSize="12px" color={ERROR_COLOR} mt={1}>{errors.message}</Text>
                      )}
                    </FormControl>

                    <VStack spacing={3} width="full">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        width="full"
                        rightIcon={<EmailIcon />}
                      >
                        {t('contact.form.submit')}
                      </Button>
                      <Text fontSize="sm" color="rgba(243,233,216,.55)" textAlign="center">
                        {t('contact.form.consultationNote')}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              )}
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Contact information — stays light */}
      <Box bg="brand.primary">
        <Container maxW="1180px" py={{ base: 12, md: 20 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="start">
                  {/* Quick Contact Info */}
                  <Box>
                    <Heading textStyle="cardTitle" as="h2" mb={4}>{t('contact.info.title')}</Heading>
                    <VStack spacing={4} align="stretch">
                      {contactMethods.map((method, index) => (
                        <MotionCard
                          key={method.title}
                          bg="brand.cream"
                          borderRadius="12px"
                          overflow="hidden"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                          }}
                        >
                          <CardBody p={5}>
                            <HStack spacing={4} align="start">
                              <Box
                                w="48px"
                                h="48px"
                                bg="brand.secondary"
                                borderRadius="8px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                              >
                                <Icon as={method.icon} w={5} h={5} color="white" />
                              </Box>
                              <VStack align="start" spacing={1} flex={1}>
                                <HStack justify="space-between" width="full">
                                  <Text fontWeight="600" color="brand.text" fontSize="md">
                                    {method.title}
                                  </Text>
                                  <Badge 
                                    bg="brand.accent" 
                                    color="brand.text" 
                                    size="sm"
                                    px={2}
                                    borderRadius="full"
                                  >
                                    {method.responseTime}
                                  </Badge>
                                </HStack>
                                <Text fontSize="sm" color="brand.textSecondary">
                                  {method.description}
                                </Text>
                                <Link
                                  href={method.link}
                                  color="brand.secondary"
                                  fontSize="sm"
                                  fontWeight="500"
                                  _hover={{ color: 'brand.redDark' }}
                                  display="inline-flex"
                                  alignItems="center"
                                  gap={1}
                                >
                                  {method.value}
                                  <ExternalLinkIcon w={3} h={3} />
                                </Link>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </MotionCard>
                      ))}
                    </VStack>
                  </Box>

                  {/* Additional Info Cards */}
                  <Stack spacing={4}>
                    {/* Location & Availability */}
                    <Card bg="white" boxShadow="md" borderRadius="12px">
                      <CardBody p={6}>
                        <VStack spacing={4} align="start">
                          <HStack>
                            <Icon as={CalendarIcon} color="brand.secondary" />
                            <Text fontWeight="600" color="brand.text" fontSize="lg">
                              {t('contact.info.locationAvailability.title')}
                            </Text>
                          </HStack>
                          <Divider borderColor="brand.border" />
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} width="full">
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="600" color="brand.text" fontSize="sm">{t('contact.info.locationAvailability.location')}</Text>
                              <Text color="brand.textSecondary" fontSize="sm">{t('contact.info.locationAvailability.locationValue')}</Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="600" color="brand.text" fontSize="sm">{t('contact.info.locationAvailability.timezone')}</Text>
                              <Text color="brand.textSecondary" fontSize="sm">{t('contact.info.locationAvailability.timezoneValue')}</Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="600" color="brand.text" fontSize="sm">{t('contact.info.locationAvailability.workingHours')}</Text>
                              <Text color="brand.textSecondary" fontSize="sm">{t('contact.info.locationAvailability.workingHoursValue')}</Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="600" color="brand.text" fontSize="sm">{t('contact.info.locationAvailability.responseTime')}</Text>
                              <Text color="brand.textSecondary" fontSize="sm">{t('contact.info.locationAvailability.responseTimeValue')}</Text>
                            </VStack>
                          </SimpleGrid>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Website & Portfolio */}
                    <Card bg="white" boxShadow="md" borderRadius="12px">
                      <CardBody p={6}>
                        <VStack spacing={4} align="start">
                          <HStack>
                            <Icon as={ExternalLinkIcon} color="brand.secondary" />
                            <Text fontWeight="600" color="brand.text" fontSize="lg">
                              {t('contact.info.portfolio.title')}
                            </Text>
                          </HStack>
                          <Divider borderColor="brand.border" />
                          <Link
                            href="https://la-realeza.com"
                            color="brand.secondary"
                            fontWeight="500"
                            _hover={{ color: 'brand.redDark' }}
                            display="inline-flex"
                            alignItems="center"
                            gap={2}
                            isExternal
                          >
                            la-realeza.com
                            <ExternalLinkIcon />
                          </Link>
                          <Text fontSize="sm" color="brand.textSecondary">
                            {t('contact.info.portfolio.description')}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* What Happens Next - with golden accent */}
                    <Card bg="brand.accent" borderRadius="12px" boxShadow="lg">
                      <CardBody p={6}>
                        <VStack spacing={4} align="start">
                          <HStack>
                            <Icon as={CheckIcon} color="brand.text" />
                            <Text fontWeight="600" color="brand.text" fontSize="lg">
                              {t('contact.nextSteps.title')}
                            </Text>
                          </HStack>
                          <VStack align="start" spacing={3} fontSize="sm" color="brand.text">
                            <HStack align="start">
                              <Text fontWeight="600">1.</Text>
                              <Text>{t('contact.nextSteps.steps.0')}</Text>
                            </HStack>
                            <HStack align="start">
                              <Text fontWeight="600">2.</Text>
                              <Text>{t('contact.nextSteps.steps.1')}</Text>
                            </HStack>
                            <HStack align="start">
                              <Text fontWeight="600">3.</Text>
                              <Text>{t('contact.nextSteps.steps.2')}</Text>
                            </HStack>
                            <HStack align="start">
                              <Text fontWeight="600">4.</Text>
                              <Text>{t('contact.nextSteps.steps.3')}</Text>
                            </HStack>
                          </VStack>
                          <Box bg="brand.text" opacity={0.1} height="1px" width="full" />
                          <Text fontSize="xs" color="brand.text" fontWeight="500">
                            {t('contact.nextSteps.consultationFee')}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Stack>
              </SimpleGrid>
        </Container>
      </Box>

      {/* Bottom CTA Section with alternating background */}
      <Box bg="brand.cream" py={{ base: 12, md: 20 }}>
        <Container maxW="1180px">
          <VStack spacing={8} textAlign="center">
            <Heading textStyle="sectionTitle" color="brand.text">
              {t('contact.cta.title')}
            </Heading>
            <Text textStyle="lead" color="brand.textSecondary" maxW="600px">
              {t('contact.cta.description')}
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} w={{ base: 'full', sm: 'auto' }}>
              <Button
                as="a"
                href="mailto:ingbmluisgomez@gmail.com"
                variant="secondary"
                size="lg"
                w={{ base: 'full', sm: 'auto' }}
                leftIcon={<EmailIcon />}
              >
                {t('contact.cta.emailButton')}
              </Button>
              <Button
                as="a"
                href="tel:+526143447013"
                variant="outline"
                size="lg"
                w={{ base: 'full', sm: 'auto' }}
                leftIcon={<PhoneIcon />}
              >
                {t('contact.cta.callButton')}
              </Button>
            </Stack>
            <Text fontSize="sm" color="brand.textSecondary" fontStyle="italic">
              {t('contact.cta.quote')}
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  );
};