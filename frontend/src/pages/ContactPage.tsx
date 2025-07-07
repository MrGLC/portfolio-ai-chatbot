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
} from '@chakra-ui/react';
import { EmailIcon, PhoneIcon, TimeIcon, CalendarIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const contactMethods = [
  {
    icon: EmailIcon,
    title: 'Email',
    description: 'Drop me a line anytime',
    value: 'luis@example.com',
    link: 'mailto:luis@example.com',
    responseTime: '< 24 hours',
  },
  {
    icon: CalendarIcon,
    title: 'Schedule Consultation',
    description: 'Book a free 30-min call',
    value: 'calendly.com/luis-ai-consulting',
    link: 'https://calendly.com/placeholder',
    responseTime: 'Same day',
  },
  {
    icon: PhoneIcon,
    title: 'Phone',
    description: 'For urgent inquiries',
    value: '+1 (555) 123-4567',
    link: 'tel:+15551234567',
    responseTime: 'Business hours',
  },
];

const services = [
  'AI Strategy Consultation',
  'Computer Vision Solutions',
  'Machine Learning Implementation',
  'Medical AI Development',
  'Custom AI Training',
  'Other (please specify)',
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
      <Container maxW="7xl" py={20}>
        <>
          <VStack spacing={16} align="stretch">
            {/* Header */}
            <>
              <Box textAlign="center">
                <Heading size="4xl" color="brand.text" mb={4}>
                  Let's Transform Your Business
                </Heading>
                <Text fontSize="xl" color="brand.textSecondary" maxW="800px" mx="auto">
                  Ready to leverage AI for competitive advantage? Schedule a free consultation 
                  to explore how we can drive growth and efficiency in your organization.
                </Text>
              </Box>
            </>

            <>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
                {/* Contact Form */}
                <>
                  <MotionCard
                    bg="brand.secondary"
                    border="1px solid"
                    borderColor="brand.border"
                    borderRadius="16px"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="lg" color="brand.text" mb={2}>
                    Start Your AI Journey
                  </Heading>
                  <Text color="brand.textSecondary">
                    Fill out the form below and I'll get back to you within 24 hours.
                  </Text>
                </Box>

                <Box as="form" onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
                      <FormControl isRequired>
                        <FormLabel color="brand.text" fontSize="sm">Name</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          bg="brand.surface"
                          border="1px solid"
                          borderColor="brand.border"
                          color="brand.text"
                          _focus={{ borderColor: 'brand.accent' }}
                          placeholder="Your full name"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="brand.text" fontSize="sm">Email</FormLabel>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          bg="brand.surface"
                          border="1px solid"
                          borderColor="brand.border"
                          color="brand.text"
                          _focus={{ borderColor: 'brand.accent' }}
                          placeholder="your@email.com"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel color="brand.text" fontSize="sm">Company</FormLabel>
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        bg="brand.surface"
                        border="1px solid"
                        borderColor="brand.border"
                        color="brand.text"
                        _focus={{ borderColor: 'brand.accent' }}
                        placeholder="Your company name"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="brand.text" fontSize="sm">Service Interest</FormLabel>
                      <Select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        bg="brand.surface"
                        border="1px solid"
                        borderColor="brand.border"
                        color="brand.text"
                        _focus={{ borderColor: 'brand.accent' }}
                        placeholder="Select a service"
                      >
                        {services.map((service) => (
                          <option key={service} value={service} style={{ backgroundColor: '#1A1A1A', color: '#F0F0F0' }}>
                            {service}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
                      <FormControl>
                        <FormLabel color="brand.text" fontSize="sm">Budget Range</FormLabel>
                        <Select
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          bg="brand.surface"
                          border="1px solid"
                          borderColor="brand.border"
                          color="brand.text"
                          _focus={{ borderColor: 'brand.accent' }}
                          placeholder="Select budget"
                        >
                          <option value="<10k" style={{ backgroundColor: '#1A1A1A', color: '#F0F0F0' }}>Less than $10k</option>
                          <option value="10k-50k" style={{ backgroundColor: '#1A1A1A', color: '#F0F0F0' }}>$10k - $50k</option>
                          <option value="50k-100k" style={{ backgroundColor: '#1A1A1A', color: '#F0F0F0' }}>$50k - $100k</option>
                          <option value="100k+" style={{ backgroundColor: '#1A1A1A', color: '#F0F0F0' }}>$100k+</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel color="brand.text" fontSize="sm">Timeline</FormLabel>
                        <Select
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleInputChange}
                          bg="brand.surface"
                          border="1px solid"
                          borderColor="brand.border"
                          color="brand.text"
                          _focus={{ borderColor: 'brand.accent' }}
                          placeholder="Select timeline"
                        >
                          <option value="asap" style={{ backgroundColor: '#1A1A1A', color: '#F0F0F0' }}>ASAP</option>
                          <option value="1-3months" style={{ backgroundColor: '#1A1A1A', color: '#F0F0F0' }}>1-3 months</option>
                          <option value="3-6months" style={{ backgroundColor: '#1A1A1A', color: '#F0F0F0' }}>3-6 months</option>
                          <option value="6months+" style={{ backgroundColor: '#1A1A1A', color: '#F0F0F0' }}>6+ months</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>

                    <FormControl isRequired>
                      <FormLabel color="brand.text" fontSize="sm">Project Details</FormLabel>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        bg="brand.surface"
                        border="1px solid"
                        borderColor="brand.border"
                        color="brand.text"
                        _focus={{ borderColor: 'brand.accent' }}
                        placeholder="Tell me about your project, challenges, and goals..."
                        rows={5}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      width="full"
                      rightIcon={<EmailIcon />}
                    >
                      Send Message
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
                  </MotionCard>
                </>

                {/* Contact Information */}
                <>
                  <VStack spacing={8} align="stretch">
                    {/* Contact Methods */}
                    <>
                      <VStack spacing={6}>
                        {contactMethods.map((method, index) => (
                          <>
                            <MotionCard
                              bg="brand.secondary"
                              border="1px solid"
                              borderColor="brand.border"
                              borderRadius="12px"
                              width="full"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              _hover={{
                                borderColor: 'brand.accent',
                                transform: 'translateY(-2px)',
                              }}
                              transitionDuration="0.3s"
                            >
                  <CardBody p={6}>
                    <HStack spacing={4}>
                      <Box
                        w="48px"
                        h="48px"
                        bg="linear-gradient(135deg, #00ABE4, #7ACFD6)"
                        borderRadius="12px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={method.icon} w={5} h={5} color="white" />
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                          <Text fontWeight="600" color="brand.text">
                            {method.title}
                          </Text>
                          <Badge colorScheme="green" size="sm">
                            {method.responseTime}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="brand.textSecondary">
                          {method.description}
                        </Text>
                        <Link
                          href={method.link}
                          color="brand.accent"
                          fontSize="sm"
                          fontWeight="500"
                          _hover={{ color: 'brand.accentCyan' }}
                        >
                          {method.value}
                        </Link>
                      </VStack>
                    </HStack>
                  </CardBody>
                            </MotionCard>
                          </>
                        ))}
                      </VStack>
                    </>

                    {/* Availability */}
                    <>
                      <Card bg="brand.secondary" border="1px solid" borderColor="brand.border">
                        <CardBody p={6}>
                          <VStack spacing={4} align="start">
                            <HStack>
                              <Icon as={TimeIcon} color="brand.accent" />
                              <Text fontWeight="600" color="brand.text">
                                Availability
                              </Text>
                            </HStack>
                            <VStack align="start" spacing={2} fontSize="sm">
                              <Text color="brand.textSecondary">
                                <Text as="span" fontWeight="600" color="brand.text">Monday - Friday:</Text> 9:00 AM - 6:00 PM PST
                              </Text>
                              <Text color="brand.textSecondary">
                                <Text as="span" fontWeight="600" color="brand.text">Response Time:</Text> Within 24 hours
                              </Text>
                              <Text color="brand.textSecondary">
                                <Text as="span" fontWeight="600" color="brand.text">Emergency Support:</Text> Available for active projects
                              </Text>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </>

                    {/* Next Steps */}
                    <>
                      <Card bg="linear-gradient(135deg, #00ABE4, #7ACFD6)" borderRadius="12px">
                        <CardBody p={6}>
                          <VStack spacing={4} align="start">
                            <Text fontWeight="600" color="white" fontSize="lg">
                              What Happens Next?
                            </Text>
                            <VStack align="start" spacing={2} fontSize="sm" color="whiteAlpha.900">
                              <Text>1. I'll review your requirements within 24 hours</Text>
                              <Text>2. Schedule a free 30-minute consultation call</Text>
                              <Text>3. Provide a custom proposal and timeline</Text>
                              <Text>4. Begin your AI transformation journey</Text>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </>
                  </VStack>
                </>
              </SimpleGrid>
            </>
          </VStack>
        </>
      </Container>
    </>
  );
};