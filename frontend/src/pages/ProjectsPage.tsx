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
import { useTranslation } from 'react-i18next';
import { durations, easings, delays, variants, transitions, createHoverAnimation } from '../theme/animations';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

interface Project {
  id: number;
  titleKey: string;
  descriptionKey: string;
  fullDescriptionKey: string;
  technologiesKeys: string[];
  category: string;
  categoryKey: string;
  gradient: string;
  techStack: string[];
}

export const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const projects: Project[] = [
    {
      id: 1,
      titleKey: 'projects.projectList.aiChatbot.title',
      descriptionKey: 'projects.projectList.aiChatbot.description',
      fullDescriptionKey: 'projects.projectList.aiChatbot.fullDescription',
      technologiesKeys: [
        'projects.projectList.aiChatbot.technologies.nlp',
        'projects.projectList.aiChatbot.technologies.conversationalAi',
        'projects.projectList.aiChatbot.technologies.multilingual'
      ],
      category: 'NLP',
      categoryKey: 'projects.filters.nlp',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      techStack: ['Python', 'Transformers', 'FastAPI', 'Redis', 'Docker'],
    },
    {
      id: 2,
      titleKey: 'projects.projectList.medicalImage.title',
      descriptionKey: 'projects.projectList.medicalImage.description',
      fullDescriptionKey: 'projects.projectList.medicalImage.fullDescription',
      technologiesKeys: [
        'projects.projectList.medicalImage.technologies.medicalAi',
        'projects.projectList.medicalImage.technologies.deepLearning',
        'projects.projectList.medicalImage.technologies.diagnosticImaging'
      ],
      category: 'Computer Vision',
      categoryKey: 'projects.filters.computerVision',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      techStack: ['PyTorch', 'OpenCV', 'DICOM', 'AWS HealthLake', 'Kubernetes'],
    },
    {
      id: 3,
      titleKey: 'projects.projectList.salesPrediction.title',
      descriptionKey: 'projects.projectList.salesPrediction.description',
      fullDescriptionKey: 'projects.projectList.salesPrediction.fullDescription',
      technologiesKeys: [
        'projects.projectList.salesPrediction.technologies.predictiveAnalytics',
        'projects.projectList.salesPrediction.technologies.timeSeries',
        'projects.projectList.salesPrediction.technologies.autoML'
      ],
      category: 'Machine Learning',
      categoryKey: 'projects.filters.machineLearning',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      techStack: ['Scikit-learn', 'XGBoost', 'Airflow', 'PostgreSQL', 'Grafana'],
    },
    {
      id: 4,
      titleKey: 'projects.projectList.documentProcessing.title',
      descriptionKey: 'projects.projectList.documentProcessing.description',
      fullDescriptionKey: 'projects.projectList.documentProcessing.fullDescription',
      technologiesKeys: [
        'projects.projectList.documentProcessing.technologies.documentAi',
        'projects.projectList.documentProcessing.technologies.ocr',
        'projects.projectList.documentProcessing.technologies.informationExtraction'
      ],
      category: 'NLP',
      categoryKey: 'projects.filters.nlp',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      techStack: ['Tesseract', 'spaCy', 'TensorFlow', 'MongoDB', 'RabbitMQ'],
    },
    {
      id: 5,
      titleKey: 'projects.projectList.inventoryOptimization.title',
      descriptionKey: 'projects.projectList.inventoryOptimization.description',
      fullDescriptionKey: 'projects.projectList.inventoryOptimization.fullDescription',
      technologiesKeys: [
        'projects.projectList.inventoryOptimization.technologies.reinforcementLearning',
        'projects.projectList.inventoryOptimization.technologies.supplyChain',
        'projects.projectList.inventoryOptimization.technologies.optimization'
      ],
      category: 'Machine Learning',
      categoryKey: 'projects.filters.machineLearning',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      techStack: ['TensorFlow', 'OR-Tools', 'Apache Spark', 'Cassandra', 'Tableau'],
    },
    {
      id: 6,
      titleKey: 'projects.projectList.customerSegmentation.title',
      descriptionKey: 'projects.projectList.customerSegmentation.description',
      fullDescriptionKey: 'projects.projectList.customerSegmentation.fullDescription',
      technologiesKeys: [
        'projects.projectList.customerSegmentation.technologies.clustering',
        'projects.projectList.customerSegmentation.technologies.behavioralAnalytics',
        'projects.projectList.customerSegmentation.technologies.marketingAi'
      ],
      category: 'Data Analysis',
      categoryKey: 'projects.filters.dataAnalysis',
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      techStack: ['Python', 'Pandas', 'Plotly', 'BigQuery', 'Looker'],
    },
  ];

  const categories = [
    { value: 'All', key: 'projects.filters.all' },
    { value: 'Machine Learning', key: 'projects.filters.machineLearning' },
    { value: 'Computer Vision', key: 'projects.filters.computerVision' },
    { value: 'NLP', key: 'projects.filters.nlp' },
    { value: 'Data Analysis', key: 'projects.filters.dataAnalysis' },
    { value: 'Full Stack', key: 'projects.filters.fullStack' }
  ];

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
              transition={{ duration: durations.slow, ease: easings.smooth }}
            >
              <Heading
                size={{ base: "2xl", md: "4xl" }}
                color="white"
                fontWeight="bold"
                letterSpacing="tight"
              >
                {t('projects.hero.title')}
              </Heading>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: durations.slow, delay: delays.staggerNormal * 2, ease: easings.smooth }}
            >
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="whiteAlpha.900"
                maxW="800px"
                mx="auto"
              >
                {t('projects.hero.description')}
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
              <WrapItem key={category.value}>
                <Button
                  size="md"
                  variant={selectedCategory === category.value ? 'solid' : 'outline'}
                  colorScheme={selectedCategory === category.value ? 'red' : 'gray'}
                  bg={selectedCategory === category.value ? 'red.600' : 'transparent'}
                  color={selectedCategory === category.value ? 'white' : 'gray.700'}
                  borderColor="gray.300"
                  onClick={() => setSelectedCategory(category.value)}
                  _hover={{
                    bg: selectedCategory === category.value ? 'red.700' : 'gray.100',
                    transform: 'translateY(-2px)',
                  }}
                  transition={transitions.fast}
                  fontWeight="600"
                >
                  {t(category.key)}
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
              transition={{ duration: durations.normal, ease: easings.smooth }}
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
                    transition={{ delay: index * delays.staggerNormal, duration: durations.normal, ease: easings.smooth }}
                    _hover={{
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '2xl',
                    }}
                    position="relative"
                    style={{ transition: transitions.normal }}
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
                        transition={transitions.opacity}
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
                        {t(project.categoryKey)}
                      </Badge>
                    </Box>

                    <CardBody p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Box>
                          <Heading size="md" color="gray.800" mb={2}>
                            {t(project.titleKey)}
                          </Heading>
                          <Text color="gray.600" fontSize="sm" lineHeight="tall">
                            {t(project.descriptionKey)}
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
                                {t('projects.techStack.more', { count: project.techStack.length - 3 })}
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
                          {t('projects.buttons.viewDetails')}
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
                  {t('projects.cta.title')}
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="600px">
                  {t('projects.cta.description')}
                </Text>
                <HStack spacing={4}>
                  <Button
                    size="lg"
                    colorScheme="red"
                    bg="red.600"
                    _hover={{ bg: 'red.700' }}
                    rightIcon={<ExternalLinkIcon />}
                  >
                    {t('projects.cta.scheduleConsultation')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    colorScheme="gray"
                    borderWidth={2}
                  >
                    {t('projects.cta.downloadPortfolio')}
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
                    {t(selectedProject.categoryKey)}
                  </Badge>
                  <Heading size="xl" color="gray.800">
                    {t(selectedProject.titleKey)}
                  </Heading>
                </VStack>
              </ModalHeader>
              <ModalBody pb={8}>
                <VStack align="stretch" spacing={6}>
                  <Text color="gray.600" fontSize="md" lineHeight="tall">
                    {t(selectedProject.fullDescriptionKey)}
                  </Text>

                  <Box>
                    <Heading size="sm" color="gray.700" mb={3}>
                      {t('projects.modal.keyTechnologies')}
                    </Heading>
                    <Wrap spacing={3}>
                      {selectedProject.technologiesKeys.map((techKey) => (
                        <WrapItem key={techKey}>
                          <Tag
                            size="md"
                            bg="gray.100"
                            color="gray.700"
                            fontWeight="500"
                            px={4}
                            py={2}
                          >
                            {t(techKey)}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>

                  <Box>
                    <Heading size="sm" color="gray.700" mb={3}>
                      {t('projects.modal.technicalStack')}
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
                      {t('projects.buttons.requestCaseStudy')}
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      size="lg"
                      flex={1}
                    >
                      {t('projects.buttons.viewDemo')}
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