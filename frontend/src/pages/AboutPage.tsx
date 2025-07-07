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
    <>
      <Container maxW="6xl" py={20}>
        <>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={12} align="stretch">
              {/* Header */}
              <>
                <Box textAlign="center">
                  <Heading size="4xl" color="brand.text" mb={4}>
                    About Luis Alberto Gomez
                  </Heading>
                  <Text fontSize="xl" color="brand.textSecondary" maxW="800px" mx="auto">
                    AI Consultant & Machine Learning Engineer with 8+ years of experience 
                    transforming businesses through cutting-edge AI solutions.
                  </Text>
                </Box>
              </>

              {/* Bio Section */}
              <>
                <Card bg="brand.secondary" border="1px solid" borderColor="brand.border">
                  <CardBody p={8}>
                    <VStack spacing={6} align="stretch">
                      <>
                        <Heading size="lg" color="brand.text">
                          Professional Background
                        </Heading>
                      </>
                      <>
                        <Text color="brand.textSecondary" lineHeight="1.8" fontSize="lg">
                          [Bio content placeholder - specialized in Computer Vision and Medical AI, 
                          with proven track record of delivering ML solutions that generate measurable ROI. 
                          Background in both technical implementation and strategic AI consulting.]
                        </Text>
                        <Text color="brand.textSecondary" lineHeight="1.8" fontSize="lg">
                          [Experience details - led AI initiatives at Fortune 500 companies, 
                          published research in top-tier journals, speaking engagements at AI conferences.]
                        </Text>
                      </>
                    </VStack>
                  </CardBody>
                </Card>
              </>

              {/* Skills Grid */}
              <>
                <Box>
                  <>
                    <Heading size="lg" color="brand.text" mb={8} textAlign="center">
                      Technical Expertise
                    </Heading>
                  </>
                  <>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {skills.map((skill, index) => (
                        <>
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
                        </>
                      ))}
                    </SimpleGrid>
                  </>
                </Box>
              </>

              {/* Achievements */}
              <>
                <Card bg="brand.secondary" border="1px solid" borderColor="brand.border">
                  <CardBody p={8}>
                    <>
                      <Heading size="lg" color="brand.text" mb={6}>
                        Key Achievements
                      </Heading>
                    </>
                    <>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <>
                          <VStack>
                            <Text fontSize="3xl" fontWeight="bold" color="brand.accent">
                              $2M+
                            </Text>
                            <Text color="brand.textSecondary" textAlign="center">
                              Cost savings generated for clients
                            </Text>
                          </VStack>
                        </>
                        <>
                          <VStack>
                            <Text fontSize="3xl" fontWeight="bold" color="brand.accentCyan">
                              15+
                            </Text>
                            <Text color="brand.textSecondary" textAlign="center">
                              Published research papers
                            </Text>
                          </VStack>
                        </>
                        <>
                          <VStack>
                            <Text fontSize="3xl" fontWeight="bold" color="brand.accent">
                              40%
                            </Text>
                            <Text color="brand.textSecondary" textAlign="center">
                              Average model accuracy improvement
                            </Text>
                          </VStack>
                        </>
                      </SimpleGrid>
                    </>
                  </CardBody>
                </Card>
              </>
            </VStack>
          </MotionBox>
        </>
      </Container>
    </>
  );
};