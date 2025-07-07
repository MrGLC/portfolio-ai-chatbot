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

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const contactMethods = [
  {
    icon: EmailIcon,
    title: 'Email',
    description: 'Direct communication',
    value: 'ingbmluisgomez@gmail.com',
    link: 'mailto:ingbmluisgomez@gmail.com',
    responseTime: '< 24 hours',
  },
  {
    icon: PhoneIcon,
    title: 'Phone',
    description: 'Quick consultation',
    value: '+52 614 344 7013',
    link: 'tel:+526143447013',
    responseTime: 'Business hours',
  },
  {
    icon: ExternalLinkIcon,
    title: 'LinkedIn',
    description: 'Professional network',
    value: 'linkedin.com/in/gomezgg',
    link: 'https://linkedin.com/in/gomezgg',
    responseTime: 'Active daily',
  },
  {
    icon: ExternalLinkIcon,
    title: 'GitHub',
    description: 'Code portfolio',
    value: 'github.com/MrGLC',
    link: 'https://github.com/MrGLC',
    responseTime: 'Open source',
  },
];

const services = [
  'AI Consulting & Strategy',
  'Computer Vision Development',
  'Machine Learning Solutions',
  'Medical AI Applications',
  'Natural Language Processing',
  'AI Workflow Automation',
  'Custom AI Model Training',
  'Rapid MVP Development',
  'Other (please specify)',
];

const budgetRanges = [
  { value: '<3k', label: 'Under $3,000 (MVP scope)' },
  { value: '3k-10k', label: '$3,000 - $10,000' },
  { value: '10k-25k', label: '$10,000 - $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k+', label: '$50,000+' },
];

const timelines = [
  { value: 'immediate', label: 'Immediate start (this week)' },
  { value: '2weeks', label: '2-week MVP sprint' },
  { value: '1month', label: 'Within 1 month' },
  { value: '1-3months', label: '1-3 months' },
  { value: '3months+', label: '3+ months' },
];

export const ContactPage: React.FC = () => {
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
                Get Started Today
              </Text>
              <Heading size="4xl" color="white" mb={4} fontFamily="heading">
                Let's Build Your AI Solution
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.900" maxW="800px" mx="auto" mb={6}>
                Schedule a paid consultation to discuss your needs. 
                2-week MVP delivery for $2-3k. Consultation fee applied to project cost.
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
                  Available for Immediate Start
                </Badge>
                <Badge 
                  bg="whiteAlpha.200" 
                  color="white" 
                  px={4} 
                  py={2} 
                  borderRadius="full"
                  fontSize="md"
                >
                  Response within 24 hours
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
                          Request Consultation
                        </Heading>
                        <Text color="brand.textSecondary">
                          Fill out this form to schedule your paid consultation. 
                          We'll discuss your project and create a custom proposal.
                        </Text>
                      </Box>

                      <Box as="form" onSubmit={handleSubmit}>
                        <VStack spacing={4}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
                            <FormControl isRequired>
                              <FormLabel color="brand.text" fontSize="sm" fontWeight="600">Name</FormLabel>
                              <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                variant="filled"
                                placeholder="Your full name"
                                size="lg"
                              />
                            </FormControl>

                            <FormControl isRequired>
                              <FormLabel color="brand.text" fontSize="sm" fontWeight="600">Email</FormLabel>
                              <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                variant="filled"
                                placeholder="your@email.com"
                                size="lg"
                              />
                            </FormControl>
                          </SimpleGrid>

                          <FormControl>
                            <FormLabel color="brand.text" fontSize="sm" fontWeight="600">
                              Company <Text as="span" fontSize="xs" color="brand.textSecondary">(optional)</Text>
                            </FormLabel>
                            <Input
                              name="company"
                              value={formData.company}
                              onChange={handleInputChange}
                              variant="filled"
                              placeholder="Your company name"
                              size="lg"
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel color="brand.text" fontSize="sm" fontWeight="600">Service Interested In</FormLabel>
                            <Select
                              name="service"
                              value={formData.service}
                              onChange={handleInputChange}
                              variant="filled"
                              placeholder="Select a service"
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
                              <FormLabel color="brand.text" fontSize="sm" fontWeight="600">Budget Range</FormLabel>
                              <Select
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                variant="filled"
                                placeholder="Select budget"
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
                              <FormLabel color="brand.text" fontSize="sm" fontWeight="600">Timeline</FormLabel>
                              <Select
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleInputChange}
                                variant="filled"
                                placeholder="Select timeline"
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
                            <FormLabel color="brand.text" fontSize="sm" fontWeight="600">Message</FormLabel>
                            <Textarea
                              name="message"
                              value={formData.message}
                              onChange={handleInputChange}
                              variant="filled"
                              placeholder="Tell me about your project goals, current challenges, and what success looks like for you..."
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
                              Schedule Paid Consultation
                            </Button>
                            <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
                              Consultation fee will be credited towards your project cost
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
                    <Heading size="md" mb={4} fontFamily="heading">Get in Touch</Heading>
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
                              Location & Availability
                            </Text>
                          </HStack>
                          <Divider borderColor="brand.border" />
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} width="full">
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="600" color="brand.text" fontSize="sm">Location</Text>
                              <Text color="brand.textSecondary" fontSize="sm">Mexico (Remote Available)</Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="600" color="brand.text" fontSize="sm">Time Zone</Text>
                              <Text color="brand.textSecondary" fontSize="sm">CST (UTC-6)</Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="600" color="brand.text" fontSize="sm">Working Hours</Text>
                              <Text color="brand.textSecondary" fontSize="sm">9 AM - 6 PM CST</Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="600" color="brand.text" fontSize="sm">Response Time</Text>
                              <Text color="brand.textSecondary" fontSize="sm">Within 24 hours</Text>
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
                              Portfolio & Projects
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
                            View my portfolio website to see completed projects and case studies
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
                              What Happens Next?
                            </Text>
                          </HStack>
                          <VStack align="start" spacing={3} fontSize="sm" color="brand.text">
                            <HStack align="start">
                              <Text fontWeight="600">1.</Text>
                              <Text>I'll review your requirements and respond within 24 hours</Text>
                            </HStack>
                            <HStack align="start">
                              <Text fontWeight="600">2.</Text>
                              <Text>We'll schedule a paid consultation to discuss your needs in detail</Text>
                            </HStack>
                            <HStack align="start">
                              <Text fontWeight="600">3.</Text>
                              <Text>You'll receive a custom proposal with timeline and investment</Text>
                            </HStack>
                            <HStack align="start">
                              <Text fontWeight="600">4.</Text>
                              <Text>Upon approval, we begin your 2-week MVP sprint immediately</Text>
                            </HStack>
                          </VStack>
                          <Box bg="brand.text" opacity={0.1} height="1px" width="full" />
                          <Text fontSize="xs" color="brand.text" fontWeight="500">
                            Consultation fee: $150 (Applied to project cost when you proceed)
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
              Ready to Transform Your Business with AI?
            </Heading>
            <Text fontSize="lg" color="brand.textSecondary" maxW="600px">
              Don't wait to leverage the power of AI. With our 2-week MVP delivery, 
              you can start seeing results faster than you think.
            </Text>
            <HStack spacing={4}>
              <Button
                as="a"
                href="mailto:ingbmluisgomez@gmail.com"
                variant="secondary"
                size="lg"
                leftIcon={<EmailIcon />}
              >
                Email Me Now
              </Button>
              <Button
                as="a"
                href="tel:+526143447013"
                variant="outline"
                size="lg"
                leftIcon={<PhoneIcon />}
              >
                Call Directly
              </Button>
            </HStack>
            <Text fontSize="sm" color="brand.textSecondary" fontStyle="italic">
              "The best time to implement AI was yesterday. The second best time is now."
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  );
};