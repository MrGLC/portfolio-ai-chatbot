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
  Tag,
} from '@chakra-ui/react';
import { ExternalLinkIcon, ViewIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { DebugWrapper } from '../components/DebugSystem';

const MotionCard = motion(Card);

const projects = [
  {
    id: 1,
    title: 'Medical Imaging AI Diagnostic System',
    description: 'Computer vision system for automated medical image analysis with 94.7% accuracy in diagnostic predictions.',
    impact: '40% faster diagnosis, $500K annual savings',
    technologies: ['PyTorch', 'Computer Vision', 'Medical AI', 'AWS'],
    category: 'Computer Vision',
    status: 'Production',
    type: 'Healthcare',
  },
  {
    id: 2,
    title: 'Predictive Maintenance ML Platform',
    description: 'Machine learning solution for predicting equipment failures in manufacturing environments.',
    impact: '60% reduction in downtime, $1.2M cost savings',
    technologies: ['TensorFlow', 'IoT', 'Time Series', 'GCP'],
    category: 'Machine Learning',
    status: 'Production',
    type: 'Manufacturing',
  },
  {
    id: 3,
    title: 'NLP-Powered Customer Intelligence',
    description: 'Natural language processing system for analyzing customer feedback and sentiment at scale.',
    impact: '85% improvement in response accuracy',
    technologies: ['NLP', 'Transformers', 'Python', 'Azure'],
    category: 'Natural Language Processing',
    status: 'Production',
    type: 'Customer Service',
  },
  {
    id: 4,
    title: 'AI-Driven Financial Risk Assessment',
    description: 'Advanced ML model for real-time financial risk scoring and fraud detection.',
    impact: '50% reduction in false positives',
    technologies: ['Scikit-learn', 'XGBoost', 'Real-time ML', 'Kubernetes'],
    category: 'Machine Learning',
    status: 'Development',
    type: 'Finance',
  },
  {
    id: 5,
    title: 'Computer Vision Quality Control',
    description: 'Automated visual inspection system for manufacturing quality assurance.',
    impact: '99.2% defect detection accuracy',
    technologies: ['OpenCV', 'Deep Learning', 'Edge Computing', 'Docker'],
    category: 'Computer Vision',
    status: 'Production',
    type: 'Manufacturing',
  },
  {
    id: 6,
    title: 'Research: Federated Learning Framework',
    description: 'Novel approach to distributed machine learning while preserving data privacy.',
    impact: 'Published in top-tier AI conference',
    technologies: ['Federated Learning', 'Privacy-Preserving ML', 'Research'],
    category: 'Research',
    status: 'Published',
    type: 'Academic',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Production': return 'green';
    case 'Development': return 'blue';
    case 'Published': return 'purple';
    default: return 'gray';
  }
};

export const ProjectsPage: React.FC = () => {
  return (
    <DebugWrapper name="ProjectsPage Root" type="section" layer={0}>
      <Container maxW="7xl" py={20}>
        <DebugWrapper name="Projects Content Container" type="container" layer={1}>
          <VStack spacing={12} align="stretch">
            {/* Header */}
            <DebugWrapper name="Projects Header" type="component" layer={2}>
              <Box textAlign="center">
                <Heading size="4xl" color="brand.text" mb={4}>
                  AI Project Portfolio
                </Heading>
                <Text fontSize="xl" color="brand.textSecondary" maxW="800px" mx="auto">
                  Showcasing impactful AI solutions across healthcare, manufacturing, 
                  finance, and research with quantifiable business results.
                </Text>
              </Box>
            </DebugWrapper>

            {/* Filter/Category Section - Placeholder */}
            <DebugWrapper name="Filter Buttons" type="component" layer={2}>
              <HStack spacing={4} justify="center" wrap="wrap">
                {['All Projects', 'Computer Vision', 'Machine Learning', 'NLP', 'Research'].map((filter) => (
                  <Button
                    key={filter}
                    variant={filter === 'All Projects' ? 'primary' : 'ghost'}
                    size="sm"
                  >
                    {filter}
                  </Button>
                ))}
              </HStack>
            </DebugWrapper>

            {/* Projects Grid */}
            <DebugWrapper name="Projects Grid Container" type="container" layer={2}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {projects.map((project, index) => (
                  <DebugWrapper key={project.id} name={`Project Card: ${project.title}`} type="component" layer={3}>
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
                        transform: 'translateY(-8px)',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                      }}
                      transitionDuration="0.3s"
                    >
              <CardBody p={6}>
                <VStack align="stretch" spacing={4}>
                  {/* Header */}
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Badge colorScheme={getStatusColor(project.status)} variant="solid">
                        {project.status}
                      </Badge>
                      <Badge variant="outline" colorScheme="blue">
                        {project.type}
                      </Badge>
                    </HStack>
                    <Heading size="md" color="brand.text" mb={2}>
                      {project.title}
                    </Heading>
                    <Text fontSize="sm" color="brand.accent" fontWeight="600" mb={3}>
                      {project.category}
                    </Text>
                  </Box>

                  {/* Description */}
                  <Text color="brand.textSecondary" lineHeight="1.6" fontSize="sm">
                    {project.description}
                  </Text>

                  {/* Impact */}
                  <Box
                    bg="brand.surface"
                    p={3}
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="brand.border"
                  >
                    <Text fontSize="xs" color="brand.textSecondary" mb={1}>
                      BUSINESS IMPACT
                    </Text>
                    <Text fontSize="sm" color="brand.accentCyan" fontWeight="600">
                      {project.impact}
                    </Text>
                  </Box>

                  {/* Technologies */}
                  <Box>
                    <Text fontSize="xs" color="brand.textSecondary" mb={2}>
                      TECHNOLOGIES
                    </Text>
                    <HStack spacing={1} wrap="wrap">
                      {project.technologies.map((tech) => (
                        <Tag
                          key={tech}
                          size="sm"
                          bg="brand.surface"
                          color="brand.text"
                          fontSize="xs"
                        >
                          {tech}
                        </Tag>
                      ))}
                    </HStack>
                  </Box>

                  {/* Actions */}
                  <HStack spacing={2} pt={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      color="brand.accent"
                      leftIcon={<ViewIcon />}
                      _hover={{ bg: 'brand.surface' }}
                    >
                      Case Study
                    </Button>
                    {project.status === 'Production' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        color="brand.textSecondary"
                        leftIcon={<ExternalLinkIcon />}
                        _hover={{ bg: 'brand.surface' }}
                      >
                        Demo
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
                    </MotionCard>
                  </DebugWrapper>
                ))}
              </SimpleGrid>
            </DebugWrapper>

            {/* CTA Section */}
            <DebugWrapper name="Projects CTA Section" type="component" layer={2}>
              <Card bg="brand.secondary" border="1px solid" borderColor="brand.border">
                <CardBody p={8} textAlign="center">
                  <VStack spacing={4}>
                    <DebugWrapper name="CTA Title" type="element" layer={3}>
                      <Heading size="lg" color="brand.text">
                        Interested in Similar Results?
                      </Heading>
                    </DebugWrapper>
                    <DebugWrapper name="CTA Description" type="element" layer={3}>
                      <Text color="brand.textSecondary" maxW="600px">
                        Let's discuss how these proven AI methodologies can be adapted 
                        to solve your specific business challenges.
                      </Text>
                    </DebugWrapper>
                    <DebugWrapper name="CTA Button" type="element" layer={3}>
                      <Button variant="primary" size="lg">
                        Schedule Strategy Session
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