import React, { useState } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Flex,
  IconButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { ExternalLinkIcon, ViewIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

interface Project {
  id: number;
  title: string;
  description: string;
  fullDescription?: string;
  technologies: string[];
  category: string;
  image?: string;
  gradient: string;
  techStack: string[];
}

const projects: Project[] = [
  {
    id: 1,
    title: 'AI Chatbot Platform',
    description: 'Advanced conversational AI platform with natural language understanding and multi-channel support.',
    fullDescription: 'This platform leverages state-of-the-art NLP models to provide intelligent conversational experiences. Built with transformer-based architectures, it supports multiple languages and can be deployed across various channels including web, mobile, and voice assistants.',
    technologies: ['Natural Language Processing', 'Conversational AI', 'Multi-lingual'],
    category: 'NLP',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    techStack: ['Python', 'Transformers', 'FastAPI', 'Redis', 'Docker'],
  },
  {
    id: 2,
    title: 'Medical Image Analysis',
    description: 'Deep learning system for automated medical image diagnosis with high accuracy and explainability.',
    fullDescription: 'A sophisticated computer vision system designed for medical professionals. It uses convolutional neural networks to analyze X-rays, MRIs, and CT scans, providing detailed analysis and highlighting areas of concern with explainable AI techniques.',
    technologies: ['Medical AI', 'Deep Learning', 'Diagnostic Imaging'],
    category: 'Computer Vision',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    techStack: ['PyTorch', 'OpenCV', 'DICOM', 'AWS HealthLake', 'Kubernetes'],
  },
  {
    id: 3,
    title: 'Sales Prediction Model',
    description: 'Machine learning model for accurate sales forecasting using historical data and market indicators.',
    fullDescription: 'This predictive analytics solution combines time series analysis with external market indicators to forecast sales with high accuracy. It includes automated feature engineering and model retraining pipelines.',
    technologies: ['Predictive Analytics', 'Time Series', 'AutoML'],
    category: 'Machine Learning',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    techStack: ['Scikit-learn', 'XGBoost', 'Airflow', 'PostgreSQL', 'Grafana'],
  },
  {
    id: 4,
    title: 'Document Processing System',
    description: 'Intelligent document understanding system for automated data extraction and classification.',
    fullDescription: 'An end-to-end document processing pipeline that uses OCR, NLP, and machine learning to extract, classify, and validate information from various document types including invoices, contracts, and forms.',
    technologies: ['Document AI', 'OCR', 'Information Extraction'],
    category: 'NLP',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    techStack: ['Tesseract', 'spaCy', 'TensorFlow', 'MongoDB', 'RabbitMQ'],
  },
  {
    id: 5,
    title: 'Inventory Optimization',
    description: 'AI-driven inventory management system reducing costs while maintaining optimal stock levels.',
    fullDescription: 'This system uses reinforcement learning and demand forecasting to optimize inventory levels across multiple warehouses. It considers factors like seasonality, lead times, and storage costs to minimize holding costs while preventing stockouts.',
    technologies: ['Reinforcement Learning', 'Supply Chain', 'Optimization'],
    category: 'Machine Learning',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    techStack: ['TensorFlow', 'OR-Tools', 'Apache Spark', 'Cassandra', 'Tableau'],
  },
  {
    id: 6,
    title: 'Customer Segmentation',
    description: 'Advanced clustering algorithms for precise customer segmentation and personalized marketing.',
    fullDescription: 'Using unsupervised learning techniques, this system analyzes customer behavior patterns to create meaningful segments. It integrates with marketing platforms to enable personalized campaigns and improve customer engagement.',
    technologies: ['Clustering', 'Behavioral Analytics', 'Marketing AI'],
    category: 'Data Analysis',
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    techStack: ['Python', 'Pandas', 'Plotly', 'BigQuery', 'Looker'],
  },
];

const categories = ['All', 'Machine Learning', 'Computer Vision', 'NLP', 'Data Analysis', 'Full Stack'];

export const ProjectsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    onOpen();
  };

  return (
    <>
      {/* Hero Section with Red Background */}
      <Box bg="red.700" position="relative" overflow="hidden">
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-br, red.700, red.900)"
          opacity={0.9}
        />
        <Container maxW="7xl" position="relative" py={{ base: 16, md: 24 }}>
          <VStack spacing={8} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Heading
                size={{ base: "2xl", md: "4xl" }}
                color="white"
                fontWeight="bold"
                letterSpacing="tight"
              >
                Royal AI Solutions Portfolio
              </Heading>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="whiteAlpha.900"
                maxW="800px"
                mx="auto"
              >
                Transforming businesses with cutting-edge artificial intelligence solutions. 
                Explore our collection of innovative projects across multiple domains.
              </Text>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Filter Section with Cream Background */}
      <Box bg="#FFF8E7" py={8}>
        <Container maxW="7xl">
          <Wrap spacing={4} justify="center">
            {categories.map((category) => (
              <WrapItem key={category}>
                <Button
                  size="md"
                  variant={selectedCategory === category ? 'solid' : 'outline'}
                  colorScheme={selectedCategory === category ? 'red' : 'gray'}
                  bg={selectedCategory === category ? 'red.600' : 'transparent'}
                  color={selectedCategory === category ? 'white' : 'gray.700'}
                  borderColor="gray.300"
                  onClick={() => setSelectedCategory(category)}
                  _hover={{
                    bg: selectedCategory === category ? 'red.700' : 'gray.100',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                  fontWeight="600"
                >
                  {category}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </Container>
      </Box>

      {/* Projects Grid with Alternating Background */}
      <Box bg="white" py={16}>
        <Container maxW="7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={8}
              >
                {filteredProjects.map((project, index) => (
                  <MotionCard
                    key={project.id}
                    bg="white"
                    overflow="hidden"
                    borderRadius="xl"
                    boxShadow="lg"
                    cursor="pointer"
                    onClick={() => handleProjectClick(project)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    _hover={{
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '2xl',
                    }}
                    position="relative"
                    transitionDuration="0.3s"
                  >
                    {/* Gradient Placeholder Image */}
                    <Box
                      h="200px"
                      bgGradient={project.gradient}
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        inset={0}
                        bg="blackAlpha.200"
                        opacity={0}
                        transition="opacity 0.3s"
                        _hover={{ opacity: 1 }}
                      />
                      <Badge
                        position="absolute"
                        top={4}
                        right={4}
                        colorScheme="red"
                        bg="red.600"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {project.category}
                      </Badge>
                    </Box>

                    <CardBody p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Box>
                          <Heading size="md" color="gray.800" mb={2}>
                            {project.title}
                          </Heading>
                          <Text color="gray.600" fontSize="sm" lineHeight="tall">
                            {project.description}
                          </Text>
                        </Box>

                        {/* Tech Stack Badges */}
                        <Wrap spacing={2}>
                          {project.techStack.slice(0, 3).map((tech) => (
                            <WrapItem key={tech}>
                              <Tag
                                size="sm"
                                bg="gray.100"
                                color="gray.700"
                                fontWeight="500"
                                borderRadius="full"
                                px={3}
                              >
                                {tech}
                              </Tag>
                            </WrapItem>
                          ))}
                          {project.techStack.length > 3 && (
                            <WrapItem>
                              <Tag
                                size="sm"
                                bg="red.50"
                                color="red.700"
                                fontWeight="500"
                                borderRadius="full"
                                px={3}
                              >
                                +{project.techStack.length - 3} more
                              </Tag>
                            </WrapItem>
                          )}
                        </Wrap>

                        <Button
                          variant="ghost"
                          colorScheme="red"
                          rightIcon={<ChevronRightIcon />}
                          justifyContent="space-between"
                          fontWeight="600"
                          _hover={{ bg: 'red.50' }}
                        >
                          View Details
                        </Button>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                ))}
              </SimpleGrid>
            </motion.div>
          </AnimatePresence>
        </Container>
      </Box>

      {/* CTA Section with Cream Background */}
      <Box bg="#FFF8E7" py={20}>
        <Container maxW="4xl">
          <Card
            bg="white"
            boxShadow="2xl"
            borderRadius="2xl"
            overflow="hidden"
            position="relative"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bgGradient="linear(to-r, red.600, red.700)"
            />
            <CardBody p={{ base: 8, md: 12 }} textAlign="center">
              <VStack spacing={6}>
                <Heading size="xl" color="gray.800">
                  Ready to Transform Your Business?
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="600px">
                  Let's explore how these proven AI methodologies can be tailored 
                  to solve your unique challenges and drive exceptional results.
                </Text>
                <HStack spacing={4}>
                  <Button
                    size="lg"
                    colorScheme="red"
                    bg="red.600"
                    _hover={{ bg: 'red.700' }}
                    rightIcon={<ExternalLinkIcon />}
                  >
                    Schedule Consultation
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    colorScheme="gray"
                    borderWidth={2}
                  >
                    Download Portfolio
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>

      {/* Project Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="white" borderRadius="xl" overflow="hidden">
          {selectedProject && (
            <>
              <Box
                h="250px"
                bgGradient={selectedProject.gradient}
                position="relative"
              >
                <ModalCloseButton
                  color="white"
                  bg="blackAlpha.300"
                  _hover={{ bg: 'blackAlpha.500' }}
                />
              </Box>
              <ModalHeader pt={8} pb={4}>
                <VStack align="start" spacing={2}>
                  <Badge
                    colorScheme="red"
                    bg="red.600"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {selectedProject.category}
                  </Badge>
                  <Heading size="xl" color="gray.800">
                    {selectedProject.title}
                  </Heading>
                </VStack>
              </ModalHeader>
              <ModalBody pb={8}>
                <VStack align="stretch" spacing={6}>
                  <Text color="gray.600" fontSize="md" lineHeight="tall">
                    {selectedProject.fullDescription || selectedProject.description}
                  </Text>

                  <Box>
                    <Heading size="sm" color="gray.700" mb={3}>
                      Key Technologies
                    </Heading>
                    <Wrap spacing={3}>
                      {selectedProject.technologies.map((tech) => (
                        <WrapItem key={tech}>
                          <Tag
                            size="md"
                            bg="gray.100"
                            color="gray.700"
                            fontWeight="500"
                            px={4}
                            py={2}
                          >
                            {tech}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>

                  <Box>
                    <Heading size="sm" color="gray.700" mb={3}>
                      Technical Stack
                    </Heading>
                    <Wrap spacing={2}>
                      {selectedProject.techStack.map((tech) => (
                        <WrapItem key={tech}>
                          <Badge
                            colorScheme="blue"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontWeight="500"
                          >
                            {tech}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>

                  <Flex gap={3} pt={4}>
                    <Button
                      colorScheme="red"
                      bg="red.600"
                      _hover={{ bg: 'red.700' }}
                      size="lg"
                      flex={1}
                    >
                      Request Case Study
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      size="lg"
                      flex={1}
                    >
                      View Demo
                    </Button>
                  </Flex>
                </VStack>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};