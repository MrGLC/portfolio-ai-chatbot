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
} from '@chakra-ui/react';
import { EmailIcon, PhoneIcon, TimeIcon, CalendarIcon, ExternalLinkIcon, CheckIcon } from '@chakra-ui/icons';
// Icons already imported from Chakra UI
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MotionBox = motion(Box);
const MotionCard = motion(Card);


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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <>
      {/* Hero Section with Red Background */}
      <Box bg="brand.secondary" py={20}>
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Text
                fontSize="sm"
                fontWeight="300"
                letterSpacing="2px"
                textTransform="uppercase"
                color="white"
                opacity={0.9}
                mb={4}
              >
                {t('contact.hero.subtitle')}
              </Text>
              <Heading size="4xl" color="white" mb={4} fontFamily="heading">
                {t('contact.hero.title')}
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.900" maxW="800px" mx="auto" mb={6}>
                {t('contact.hero.description')}
              </Text>
              <HStack spacing={4} justify="center">
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

      {/* Main Content Section */}
      <Box bg="brand.primary">
        <Container maxW="7xl" py={20}>
          <VStack spacing={16} align="stretch">
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
                {/* Contact Form - White/Cream Card */}
                <MotionCard
                  bg="white"
                  boxShadow="xl"
                  borderRadius="16px"
                  overflow="hidden"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <CardBody p={8}>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Heading size="lg" color="brand.text" mb={2} fontFamily="heading">
                          {t('contact.form.title')}
                        </Heading>
                        <Text color="brand.textSecondary">
                          {t('contact.form.description')}
                        </Text>
                      </Box>

                      <Box as="form" onSubmit={handleSubmit}>
                        <VStack spacing={4}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
                            <FormControl isRequired>
                              <FormLabel color="brand.text" fontSize="sm" fontWeight="600">{t('contact.form.labels.name')}</FormLabel>
                              <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                variant="filled"
                                placeholder={t('contact.form.placeholders.fullName')}
                                size="lg"
                              />
                            </FormControl>

                            <FormControl isRequired>
                              <FormLabel color="brand.text" fontSize="sm" fontWeight="600">{t('contact.form.labels.email')}</FormLabel>
                              <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                variant="filled"
                                placeholder={t('contact.form.placeholders.email')}
                                size="lg"
                              />
                            </FormControl>
                          </SimpleGrid>

                          <FormControl>
                            <FormLabel color="brand.text" fontSize="sm" fontWeight="600">
                              {t('contact.form.labels.company')} <Text as="span" fontSize="xs" color="brand.textSecondary">{t('contact.form.labels.companyOptional')}</Text>
                            </FormLabel>
                            <Input
                              name="company"
                              value={formData.company}
                              onChange={handleInputChange}
                              variant="filled"
                              placeholder={t('contact.form.placeholders.companyName')}
                              size="lg"
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel color="brand.text" fontSize="sm" fontWeight="600">{t('contact.form.labels.service')}</FormLabel>
                            <Select
                              name="service"
                              value={formData.service}
                              onChange={handleInputChange}
                              variant="filled"
                              placeholder={t('contact.form.placeholders.selectService')}
                              size="lg"
                            >
                              {services.map((service) => (
                                <option key={service} value={service}>
                                  {service}
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
                            <FormControl isRequired>
                              <FormLabel color="brand.text" fontSize="sm" fontWeight="600">{t('contact.form.labels.budget')}</FormLabel>
                              <Select
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                variant="filled"
                                placeholder={t('contact.form.placeholders.selectBudget')}
                                size="lg"
                              >
                                {budgetRanges.map((range) => (
                                  <option key={range.value} value={range.value}>
                                    {range.label}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            <FormControl isRequired>
                              <FormLabel color="brand.text" fontSize="sm" fontWeight="600">{t('contact.form.labels.timeline')}</FormLabel>
                              <Select
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleInputChange}
                                variant="filled"
                                placeholder={t('contact.form.placeholders.selectTimeline')}
                                size="lg"
                              >
                                {timelines.map((timeline) => (
                                  <option key={timeline.value} value={timeline.value}>
                                    {timeline.label}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                          </SimpleGrid>

                          <FormControl isRequired>
                            <FormLabel color="brand.text" fontSize="sm" fontWeight="600">{t('contact.form.labels.message')}</FormLabel>
                            <Textarea
                              name="message"
                              value={formData.message}
                              onChange={handleInputChange}
                              variant="filled"
                              placeholder={t('contact.form.placeholders.message')}
                              rows={5}
                              size="lg"
                            />
                          </FormControl>

                          <VStack spacing={3} width="full">
                            <Button
                              type="submit"
                              variant="secondary"
                              size="lg"
                              width="full"
                              rightIcon={<EmailIcon />}
                            >
                              {t('contact.form.submit')}
                            </Button>
                            <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
                              {t('contact.form.consultationNote')}
                            </Text>
                          </VStack>
                        </VStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </MotionCard>

                {/* Contact Information */}
                <VStack spacing={6} align="stretch">
                  {/* Quick Contact Info */}
                  <Box>
                    <Heading size="md" mb={4} fontFamily="heading">{t('contact.info.title')}</Heading>
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
                </VStack>
              </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Bottom CTA Section with alternating background */}
      <Box bg="brand.cream" py={20}>
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl" fontFamily="heading" color="brand.text">
              {t('contact.cta.title')}
            </Heading>
            <Text fontSize="lg" color="brand.textSecondary" maxW="600px">
              {t('contact.cta.description')}
            </Text>
            <HStack spacing={4}>
              <Button
                as="a"
                href="mailto:ingbmluisgomez@gmail.com"
                variant="secondary"
                size="lg"
                leftIcon={<EmailIcon />}
              >
                {t('contact.cta.emailButton')}
              </Button>
              <Button
                as="a"
                href="tel:+526143447013"
                variant="outline"
                size="lg"
                leftIcon={<PhoneIcon />}
              >
                {t('contact.cta.callButton')}
              </Button>
            </HStack>
            <Text fontSize="sm" color="brand.textSecondary" fontStyle="italic">
              {t('contact.cta.quote')}
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  );
};