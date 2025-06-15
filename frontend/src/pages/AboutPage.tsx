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
  Progress,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { DebugWrapper } from '../components/DebugSystem';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const skills = [
  { name: 'Computer Vision', level: 95, category: 'AI/ML' },
  { name: 'Machine Learning', level: 92, category: 'AI/ML' },
  { name: 'Deep Learning', level: 88, category: 'AI/ML' },
  { name: 'Python', level: 96, category: 'Programming' },
  { name: 'TensorFlow/PyTorch', level: 90, category: 'Frameworks' },
  { name: 'Medical AI', level: 85, category: 'Domain' },
];

export const AboutPage: React.FC = () => {
  return (
    <DebugWrapper name="AboutPage Root" type="section" layer={0}>
      <Container maxW="6xl" py={20}>
        <DebugWrapper name="About Content Container" type="container" layer={1}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={12} align="stretch">
              {/* Header */}
              <DebugWrapper name="About Header" type="component" layer={2}>
                <Box textAlign="center">
                  <Heading size="4xl" color="brand.text" mb={4}>
                    About Luis Alberto Gomez
                  </Heading>
                  <Text fontSize="xl" color="brand.textSecondary" maxW="800px" mx="auto">
                    AI Consultant & Machine Learning Engineer with 8+ years of experience 
                    transforming businesses through cutting-edge AI solutions.
                  </Text>
                </Box>
              </DebugWrapper>

              {/* Bio Section */}
              <DebugWrapper name="Bio Section" type="component" layer={2}>
                <Card bg="brand.secondary" border="1px solid" borderColor="brand.border">
                  <CardBody p={8}>
                    <VStack spacing={6} align="stretch">
                      <DebugWrapper name="Bio Title" type="element" layer={3}>
                        <Heading size="lg" color="brand.text">
                          Professional Background
                        </Heading>
                      </DebugWrapper>
                      <DebugWrapper name="Bio Content" type="element" layer={3}>
                        <Text color="brand.textSecondary" lineHeight="1.8" fontSize="lg">
                          [Bio content placeholder - specialized in Computer Vision and Medical AI, 
                          with proven track record of delivering ML solutions that generate measurable ROI. 
                          Background in both technical implementation and strategic AI consulting.]
                        </Text>
                        <Text color="brand.textSecondary" lineHeight="1.8" fontSize="lg">
                          [Experience details - led AI initiatives at Fortune 500 companies, 
                          published research in top-tier journals, speaking engagements at AI conferences.]
                        </Text>
                      </DebugWrapper>
                    </VStack>
                  </CardBody>
                </Card>
              </DebugWrapper>

              {/* Skills Grid */}
              <DebugWrapper name="Skills Section" type="container" layer={2}>
                <Box>
                  <DebugWrapper name="Skills Title" type="element" layer={3}>
                    <Heading size="lg" color="brand.text" mb={8} textAlign="center">
                      Technical Expertise
                    </Heading>
                  </DebugWrapper>
                  <DebugWrapper name="Skills Grid Container" type="container" layer={3}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {skills.map((skill, index) => (
                        <DebugWrapper key={skill.name} name={`Skill Card: ${skill.name}`} type="component" layer={4}>
                          <MotionCard
                            bg="brand.secondary"
                            border="1px solid"
                            borderColor="brand.border"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CardBody p={6}>
                              <VStack align="stretch" spacing={4}>
                                <Box>
                                  <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Text fontWeight="600" color="brand.text">
                                      {skill.name}
                                    </Text>
                                    <Badge colorScheme="blue" size="sm">
                                      {skill.category}
                                    </Badge>
                                  </Box>
                                  <Progress
                                    value={skill.level}
                                    colorScheme="blue"
                                    bg="brand.surface"
                                    borderRadius="full"
                                    size="sm"
                                  />
                                  <Text fontSize="sm" color="brand.textSecondary" mt={1}>
                                    {skill.level}% proficiency
                                  </Text>
                                </Box>
                              </VStack>
                            </CardBody>
                          </MotionCard>
                        </DebugWrapper>
                      ))}
                    </SimpleGrid>
                  </DebugWrapper>
                </Box>
              </DebugWrapper>

              {/* Achievements */}
              <DebugWrapper name="Achievements Section" type="component" layer={2}>
                <Card bg="brand.secondary" border="1px solid" borderColor="brand.border">
                  <CardBody p={8}>
                    <DebugWrapper name="Achievements Title" type="element" layer={3}>
                      <Heading size="lg" color="brand.text" mb={6}>
                        Key Achievements
                      </Heading>
                    </DebugWrapper>
                    <DebugWrapper name="Achievements Grid" type="container" layer={3}>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <DebugWrapper name="Achievement 1: Cost Savings" type="component" layer={4}>
                          <VStack>
                            <Text fontSize="3xl" fontWeight="bold" color="brand.accent">
                              $2M+
                            </Text>
                            <Text color="brand.textSecondary" textAlign="center">
                              Cost savings generated for clients
                            </Text>
                          </VStack>
                        </DebugWrapper>
                        <DebugWrapper name="Achievement 2: Research Papers" type="component" layer={4}>
                          <VStack>
                            <Text fontSize="3xl" fontWeight="bold" color="brand.accentCyan">
                              15+
                            </Text>
                            <Text color="brand.textSecondary" textAlign="center">
                              Published research papers
                            </Text>
                          </VStack>
                        </DebugWrapper>
                        <DebugWrapper name="Achievement 3: Accuracy" type="component" layer={4}>
                          <VStack>
                            <Text fontSize="3xl" fontWeight="bold" color="brand.accent">
                              40%
                            </Text>
                            <Text color="brand.textSecondary" textAlign="center">
                              Average model accuracy improvement
                            </Text>
                          </VStack>
                        </DebugWrapper>
                      </SimpleGrid>
                    </DebugWrapper>
                  </CardBody>
                </Card>
              </DebugWrapper>
            </VStack>
          </MotionBox>
        </DebugWrapper>
      </Container>
    </DebugWrapper>
  );
};