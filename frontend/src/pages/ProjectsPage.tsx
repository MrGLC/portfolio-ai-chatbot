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
  Stack,
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
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { durations, easings, delays, variants, transitions, createHoverAnimation } from '../theme/animations';
import { Kicker } from '../components/Kicker';

const MotionCard = motion.div;
const MotionBox = motion.create(Box);

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
  /** External proof link (paper, repo) — modal renders it only when present */
  link?: { labelKey: string; url: string };
}

export const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Real, shipped systems only — no agency filler. Proof links where they exist.
  const projects: Project[] = [
    {
      id: 1,
      titleKey: 'projects.projectList.primeroTrader.title',
      descriptionKey: 'projects.projectList.primeroTrader.description',
      fullDescriptionKey: 'projects.projectList.primeroTrader.fullDescription',
      technologiesKeys: [
        'projects.projectList.primeroTrader.technologies.mcp',
        'projects.projectList.primeroTrader.technologies.eventDriven',
        'projects.projectList.primeroTrader.technologies.finetuning'
      ],
      category: 'LLM & Agents',
      categoryKey: 'projects.filters.llmAgents',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      techStack: ['Python', 'FastAPI', 'Valkey', 'MCP', 'SageMaker', 'Docker'],
    },
    {
      id: 2,
      titleKey: 'projects.projectList.voiceInterview.title',
      descriptionKey: 'projects.projectList.voiceInterview.description',
      fullDescriptionKey: 'projects.projectList.voiceInterview.fullDescription',
      technologiesKeys: [
        'projects.projectList.voiceInterview.technologies.rag',
        'projects.projectList.voiceInterview.technologies.voice',
        'projects.projectList.voiceInterview.technologies.evals'
      ],
      category: 'LLM & Agents',
      categoryKey: 'projects.filters.llmAgents',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      techStack: ['AWS Bedrock', 'OpenSearch', 'OpenAI Realtime', 'Python', 'OpenTelemetry'],
    },
    {
      id: 3,
      titleKey: 'projects.projectList.sputnik.title',
      descriptionKey: 'projects.projectList.sputnik.description',
      fullDescriptionKey: 'projects.projectList.sputnik.fullDescription',
      technologiesKeys: [
        'projects.projectList.sputnik.technologies.iac',
        'projects.projectList.sputnik.technologies.observability',
        'projects.projectList.sputnik.technologies.orchestration'
      ],
      category: 'Infrastructure',
      categoryKey: 'projects.filters.infrastructure',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      techStack: ['NixOS', 'Docker', 'Caddy', 'Prometheus', 'Grafana', 'FastAPI'],
    },
    {
      id: 4,
      titleKey: 'projects.projectList.tonyAssistant.title',
      descriptionKey: 'projects.projectList.tonyAssistant.description',
      fullDescriptionKey: 'projects.projectList.tonyAssistant.fullDescription',
      technologiesKeys: [
        'projects.projectList.tonyAssistant.technologies.rag',
        'projects.projectList.tonyAssistant.technologies.vector',
        'projects.projectList.tonyAssistant.technologies.mcp'
      ],
      category: 'LLM & Agents',
      categoryKey: 'projects.filters.llmAgents',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      techStack: ['Python', 'ChromaDB', 'MCP', 'FastAPI', 'Docker'],
    },
    {
      id: 5,
      titleKey: 'projects.projectList.hemorrhageCnn.title',
      descriptionKey: 'projects.projectList.hemorrhageCnn.description',
      fullDescriptionKey: 'projects.projectList.hemorrhageCnn.fullDescription',
      technologiesKeys: [
        'projects.projectList.hemorrhageCnn.technologies.cnn',
        'projects.projectList.hemorrhageCnn.technologies.medicalImaging',
        'projects.projectList.hemorrhageCnn.technologies.research'
      ],
      category: 'Computer Vision',
      categoryKey: 'projects.filters.computerVision',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      techStack: ['PyTorch', 'ResNet', 'OpenCV', 'Python'],
      link: {
        labelKey: 'projects.buttons.viewPaper',
        url: 'https://link.springer.com/chapter/10.1007/978-3-031-46933-6_6',
      },
    },
    {
      id: 6,
      titleKey: 'projects.projectList.codexFusion.title',
      descriptionKey: 'projects.projectList.codexFusion.description',
      fullDescriptionKey: 'projects.projectList.codexFusion.fullDescription',
      technologiesKeys: [
        'projects.projectList.codexFusion.technologies.mcp',
        'projects.projectList.codexFusion.technologies.multiModel',
        'projects.projectList.codexFusion.technologies.tdd'
      ],
      category: 'LLM & Agents',
      categoryKey: 'projects.filters.llmAgents',
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      techStack: ['Python', 'FastMCP', 'uv', 'pytest'],
    },
  ];

  const categories = [
    { value: 'All', key: 'projects.filters.all' },
    { value: 'LLM & Agents', key: 'projects.filters.llmAgents' },
    { value: 'Computer Vision', key: 'projects.filters.computerVision' },
    { value: 'Infrastructure', key: 'projects.filters.infrastructure' }
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
        <Container maxW="1180px" position="relative" py={{ base: 16, md: 24 }}>
          <VStack spacing={8} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: durations.slow, ease: easings.smooth }}
            >
              <Box mb={5}>
                <Kicker centered color="brand.goldBright">
                  {t('projects.hero.kicker')}
                </Kicker>
              </Box>
              <Heading
                as="h1"
                textStyle="pageTitle"
                color="white"
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
                textStyle="lead"
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
      <Box bg="brand.creamWarm" py={8}>
        <Container maxW="1180px">
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
      <Box bg="white" py={{ base: 12, md: 20 }}>
        <Container maxW="1180px">
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
                spacing={{ base: 4, md: 8 }}
              >
                {filteredProjects.map((project, index) => (
                  <MotionCard
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * delays.staggerNormal, duration: durations.normal, ease: easings.smooth }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card
                      variant="royal"
                      onClick={() => handleProjectClick(project)}
                      position="relative"
                      h="full"
                    >
                      {/* Gradient Placeholder Image with serial number (handoff §4) */}
                      <Box
                        h="200px"
                        bgGradient={project.gradient}
                        position="relative"
                      >
                        {/* Serial number: Bodoni 34px crimson at 16% */}
                        <Text
                          position="absolute"
                          top={3}
                          left={4}
                          fontFamily="heading"
                          fontWeight={600}
                          fontSize="34px"
                          lineHeight={1}
                          color="brand.secondary"
                          opacity={0.16}
                          aria-hidden="true"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </Text>
                      </Box>

                    <CardBody p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Box>
                          {/* Category chip: gold-bordered pill */}
                          <Tag variant="gold" mb={3}>
                            {t(project.categoryKey)}
                          </Tag>
                          <Heading as="h3" textStyle="cardTitle" color="brand.text" mb={2}>
                            {t(project.titleKey)}
                          </Heading>
                          <Text color="brand.textMuted" fontSize="sm" lineHeight="tall">
                            {t(project.descriptionKey)}
                          </Text>
                        </Box>

                        {/* Tech Stack Badges */}
                        <Wrap spacing={2}>
                          {project.techStack.slice(0, 3).map((tech) => (
                            <WrapItem key={tech}>
                              <Tag
                                size="sm"
                                bg="rgba(24,20,40,.05)"
                                color="brand.textSecondary"
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
                                bg="rgba(193,14,53,.07)"
                                color="brand.secondary"
                                fontWeight="500"
                                borderRadius="full"
                                px={3}
                              >
                                {t('projects.techStack.more', { count: project.techStack.length - 3 })}
                              </Tag>
                            </WrapItem>
                          )}
                        </Wrap>

                        {/* Case-study link: arrow gap grows 8→12px on hover (handoff §4) */}
                        <Box
                          as="span"
                          display="inline-flex"
                          alignItems="center"
                          gap="8px"
                          color="brand.secondary"
                          fontWeight={600}
                          fontSize="sm"
                          transition="gap .25s ease"
                          _hover={{ gap: '12px' }}
                          py={2}
                        >
                          {t('projects.buttons.viewDetails')}
                          <Box as="span" aria-hidden="true">→</Box>
                        </Box>
                      </VStack>
                    </CardBody>
                    </Card>
                  </MotionCard>
                ))}
              </SimpleGrid>
            </motion.div>
          </AnimatePresence>
        </Container>
      </Box>

      {/* CTA Section with Cream Background */}
      <Box bg="brand.creamWarm" py={{ base: 12, md: 20 }}>
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
                <Heading textStyle="sectionTitle" color="gray.800">
                  {t('projects.cta.title')}
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="600px">
                  {t('projects.cta.description')}
                </Text>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} w={{ base: 'full', sm: 'auto' }}>
                  <Button
                    size="lg"
                    colorScheme="red"
                    bg="red.600"
                    _hover={{ bg: 'red.700' }}
                    rightIcon={<ExternalLinkIcon />}
                    w={{ base: 'full', sm: 'auto' }}
                  >
                    {t('projects.cta.scheduleConsultation')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    colorScheme="gray"
                    borderWidth={2}
                    w={{ base: 'full', sm: 'auto' }}
                  >
                    {t('projects.cta.downloadPortfolio')}
                  </Button>
                </Stack>
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
                      as={RouterLink}
                      to="/contact"
                      colorScheme="red"
                      bg="red.600"
                      _hover={{ bg: 'red.700' }}
                      size="lg"
                      flex={1}
                    >
                      {t('projects.buttons.requestCaseStudy')}
                    </Button>
                    {selectedProject.link && (
                      <Button
                        as="a"
                        href={selectedProject.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outline"
                        colorScheme="gray"
                        size="lg"
                        flex={1}
                        rightIcon={<ExternalLinkIcon />}
                      >
                        {t(selectedProject.link.labelKey)}
                      </Button>
                    )}
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