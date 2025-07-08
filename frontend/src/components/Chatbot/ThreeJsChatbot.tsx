import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, Environment, Sphere, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  SimpleGrid,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';
import { useTranslation } from 'react-i18next';

const MotionBox = motion(Box);

// Animations
const bounceAnimation = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
`;

// Colors
const colors = {
  cream: '#FFF8E7',
  lightCream: '#FFFEF9',
  brown: '#8B6F47',
  lightBrown: '#A68B5C',
  darkBrown: '#6B5637',
  glass: 'rgba(255, 248, 231, 0.1)',
};

// 3D Avatar Components
function MiniAssistantOrb({ scale = 1 }: { scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const time = state.clock.elapsedTime;
      meshRef.current.scale.setScalar(scale * (1 + Math.sin(time * 2) * 0.05));
    }
  });

  return (
    <group scale={scale}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 2]} />
        <meshPhysicalMaterial
          color={colors.lightBrown}
          metalness={0.8}
          roughness={0.1}
          emissive={colors.brown}
          emissiveIntensity={0.3}
          envMapIntensity={2}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>
      <mesh scale={1.3}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color={colors.cream}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}

function UserGem({ scale = 1 }: { scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y -= 0.008;
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <group scale={scale}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#FFD700"
          metalness={0.5}
          roughness={0.2}
          transmission={0.5}
          thickness={0.5}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0}
          ior={1.5}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={0.5} color={colors.lightBrown} />
    </group>
  );
}

// 3D Assistant Orb Component
function AssistantOrb({ isTyping, hasNewMessage }: { isTyping: boolean; hasNewMessage: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Particle system
  const particles = React.useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 1.5 + Math.random() * 0.5;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Cream to brown gradient
      const t = Math.random();
      colors[i * 3] = 0.545 + t * 0.42; // R
      colors[i * 3 + 1] = 0.435 + t * 0.34; // G
      colors[i * 3 + 2] = 0.278 + t * 0.22; // B
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Base rotation
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      
      // Typing animation
      if (isTyping) {
        const scale = 1 + Math.sin(time * 8) * 0.05;
        meshRef.current.scale.setScalar(scale);
      } else {
        const scale = 1 + Math.sin(time * 2) * 0.02;
        meshRef.current.scale.setScalar(scale);
      }
    }
    
    if (innerRef.current) {
      innerRef.current.rotation.x -= 0.01;
      innerRef.current.rotation.y -= 0.008;
    }
    
    // Particle animation
    if (particlesRef.current && particlesRef.current.geometry.attributes.position) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < positions.length; i += 3) {
        const idx = i / 3;
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        const distance = Math.sqrt(x * x + y * y + z * z);
        const wave = Math.sin(time * 2 + idx * 0.1) * 0.05;
        
        positions[i] = x * (1 + wave);
        positions[i + 1] = y * (1 + wave);
        positions[i + 2] = z * (1 + wave);
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particles.colors.length / 3}
            array={particles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Main orb */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhysicalMaterial
            color={colors.lightBrown}
            metalness={0.2}
            roughness={0.1}
            transmission={0.6}
            thickness={1.5}
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0}
            ior={1.5}
            opacity={0.8}
            transparent
          />
        </mesh>
        
        {/* Inner core */}
        <mesh ref={innerRef} scale={0.6}>
          <octahedronGeometry args={[1, 2]} />
          <meshPhysicalMaterial
            color={colors.brown}
            emissive={colors.brown}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Glow effect */}
        {hasNewMessage && (
          <mesh scale={1.2}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
              color={colors.cream}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </Float>
    </group>
  );
}

// Floating geometric background elements
function FloatingElements() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Floating shapes */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3 + Math.sin(i) * 1.5;
        const y = Math.sin(i * 0.5) * 2;
        
        return (
          <Float key={i} speed={1 + i * 0.2} floatIntensity={0.5}>
            <mesh position={[
              Math.cos(angle) * radius,
              y,
              Math.sin(angle) * radius
            ]}>
              {i % 3 === 0 ? (
                <tetrahedronGeometry args={[0.3]} />
              ) : i % 3 === 1 ? (
                <octahedronGeometry args={[0.3]} />
              ) : (
                <dodecahedronGeometry args={[0.3]} />
              )}
              <meshPhysicalMaterial
                color={i % 2 === 0 ? colors.cream : colors.lightBrown}
                metalness={0.5}
                roughness={0.5}
                opacity={0.3}
                transparent
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

// 3D Scene Component
function ChatScene({ isTyping, hasNewMessage }: { isTyping: boolean; hasNewMessage: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color={colors.cream} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={colors.lightBrown} />
      <directionalLight position={[0, 5, 5]} intensity={0.8} color="#ffffff" />
      
      <AssistantOrb isTyping={isTyping} hasNewMessage={hasNewMessage} />
      <FloatingElements />
      
      <Environment preset="apartment" />
    </>
  );
}

// 3D Avatar for Message Bubbles
function Avatar3D({ isUser }: { isUser: boolean }) {
  return (
    <Box
      w={8}
      h={8}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      position="relative"
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 2, 2]} intensity={0.7} color={colors.cream} />
        <pointLight position={[-2, -2, 2]} intensity={0.3} color={colors.lightBrown} />
        {isUser ? <UserGem scale={1} /> : <MiniAssistantOrb scale={1} />}
      </Canvas>
    </Box>
  );
}

// Message Bubble Component with enhanced design
function MessageBubble({ message, isUser }: { message: string; isUser: boolean }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Flex justify={isUser ? 'flex-end' : 'flex-start'} mb={4} align="flex-start" gap={2}>
        {!isUser && <Avatar3D isUser={false} />}
        
        <Box maxW="75%">
          <Box
            bg={isUser 
              ? `linear-gradient(135deg, ${colors.lightBrown}DD, ${colors.brown}DD)` 
              : `linear-gradient(135deg, ${colors.lightCream}EE, ${colors.cream}EE)`
            }
            color={isUser ? '#FFFFFF' : colors.darkBrown}
            px={5}
            py={3}
            borderRadius="16px"
            boxShadow={isUser 
              ? "0 12px 32px rgba(139, 111, 71, 0.15), 0 4px 8px rgba(139, 111, 71, 0.1)" 
              : "0 12px 32px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.03)"
            }
            position="relative"
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={isUser ? `${colors.brown}20` : `${colors.brown}15`}
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: isUser 
                ? "0 16px 40px rgba(139, 111, 71, 0.2), 0 6px 12px rgba(139, 111, 71, 0.15)" 
                : "0 16px 40px rgba(0, 0, 0, 0.08), 0 6px 12px rgba(0, 0, 0, 0.05)",
            }}
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bg: isUser 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
              pointerEvents: 'none',
            }}
          >
            <Text 
              fontSize="sm" 
              lineHeight="1.6" 
              fontWeight="450"
              letterSpacing="0.01em"
              color={isUser ? 'white !important' : colors.darkBrown}
            >
              {message}
            </Text>
          </Box>
          <HStack 
            spacing={2} 
            mt={2} 
            px={2}
            justify={isUser ? 'flex-end' : 'flex-start'}
          >
            <Text 
              fontSize="xs" 
              color={colors.brown} 
              opacity={0.5}
              fontWeight="400"
            >
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </HStack>
        </Box>
        
        {isUser && <Avatar3D isUser={true} />}
      </Flex>
    </MotionBox>
  );
}

// Main Chatbot Component
export const ThreeJsChatbot: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: t('home.chatbot.welcomeMessage'),
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const sampleQuestions = [
    t('home.chatbot.sampleQuestions.skills'),
    t('home.chatbot.sampleQuestions.projects'),
    t('home.chatbot.sampleQuestions.experience'),
    t('home.chatbot.sampleQuestions.availability'),
  ];

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), text: input, isUser: true }]);
      setInput('');
      setIsTyping(true);
      
      // Simulate response
      setTimeout(() => {
        setIsTyping(false);
        setHasNewMessage(true);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "I'm processing your request. This feature will be connected to the backend soon!",
          isUser: false,
        }]);
        
        setTimeout(() => setHasNewMessage(false), 1000);
      }, 2000);
    }
  };

  return (
    <Box position="relative" zIndex={3}>
      <Container maxW="1200px">
        <Flex gap={8} align="stretch" minH="600px">
          {/* 3D Assistant Side */}
          <Box
            flex="0 0 400px"
            display={{ base: 'none', lg: 'block' }}
            position="relative"
            borderRadius="24px"
            overflow="hidden"
            bg={colors.glass}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={`${colors.brown}20`}
          >
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ChatScene isTyping={isTyping} hasNewMessage={hasNewMessage} />
            </Canvas>
            
            {/* Assistant Info */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              p={4}
              bg={`linear-gradient(to top, ${colors.cream}DD, transparent)`}
            >
              <VStack align="flex-start" spacing={2}>
                <Heading size="md" color={colors.darkBrown}>
                  Luis AI Assistant
                </Heading>
                <HStack spacing={2}>
                  <Box w={2} h={2} bg="green.400" borderRadius="full" />
                  <Text fontSize="sm" color={colors.brown}>
                    {t('home.chatbot.readyToHelp')}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </Box>

          {/* Chat Interface */}
          <Box
            flex={1}
            bg={`linear-gradient(135deg, ${colors.lightCream}, ${colors.cream})`}
            borderRadius="24px"
            overflow="hidden"
            position="relative"
            display="flex"
            flexDirection="column"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.1)"
            border="2px solid"
            borderColor={`${colors.brown}20`}
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100px',
              bg: `linear-gradient(180deg, ${colors.cream}, transparent)`,
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          >
            {/* Chat Header */}
            <Box
              px={5}
              py={3}
              borderBottom="1px solid"
              borderColor={`${colors.brown}15`}
              bg={`linear-gradient(135deg, ${colors.cream}DD, ${colors.lightCream}DD)`}
              backdropFilter="blur(20px)"
              position="relative"
              zIndex={2}
            >
              <HStack justify="space-between">
                <HStack spacing={4}>
                  <Box
                    w={3}
                    h={3}
                    bg="green.400"
                    borderRadius="full"
                    boxShadow="0 0 10px rgba(72, 187, 120, 0.5)"
                  />
                  <VStack align="flex-start" spacing={0}>
                    <Heading size="sm" color={colors.darkBrown}>
                      {t('home.chatbot.chatTitle')}
                    </Heading>
                    <Text fontSize="xs" color={colors.brown} opacity={0.8}>
                      {t('home.chatbot.poweredBy')} • {t('home.chatbot.responseTime')}
                    </Text>
                  </VStack>
                </HStack>
                <HStack spacing={2} opacity={0.5}>
                  <Button size="xs" variant="ghost" color={colors.brown}>
                    <Text fontSize="lg">↻</Text>
                  </Button>
                  <Button size="xs" variant="ghost" color={colors.brown}>
                    <Text fontSize="lg">⋮</Text>
                  </Button>
                </HStack>
              </HStack>
            </Box>
            
            {/* Messages Area */}
            <Box
              flex={1}
              overflowY="auto"
              p={5}
              pb="100px"
              position="relative"
              zIndex={1}
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: `linear-gradient(180deg, ${colors.lightBrown}, ${colors.brown})`,
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: colors.brown,
                },
              }}
            >
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg.text} isUser={msg.isUser} />
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <MotionBox
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Flex justify="flex-start" mb={4} align="flex-start" gap={2}>
                    <Avatar3D isUser={false} />
                    <Box
                      px={6}
                      py={4}
                      bg={`linear-gradient(135deg, ${colors.lightCream}EE, ${colors.cream}EE)`}
                      borderRadius="16px"
                      boxShadow="0 12px 32px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.03)"
                      backdropFilter="blur(20px)"
                      border="1px solid"
                      borderColor={`${colors.brown}15`}
                    >
                      <HStack spacing={2}>
                        <Box 
                          w={2} 
                          h={2} 
                          bg={colors.brown} 
                          borderRadius="full" 
                          animation={`${bounceAnimation} 1.4s infinite`}
                          opacity={0.7}
                        />
                        <Box 
                          w={2} 
                          h={2} 
                          bg={colors.brown} 
                          borderRadius="full"
                          animation={`${bounceAnimation} 1.4s infinite`}
                          sx={{ animationDelay: "0.2s" }}
                          opacity={0.7}
                        />
                        <Box 
                          w={2} 
                          h={2} 
                          bg={colors.brown} 
                          borderRadius="full"
                          animation={`${bounceAnimation} 1.4s infinite`}
                          sx={{ animationDelay: "0.4s" }}
                          opacity={0.7}
                        />
                      </HStack>
                    </Box>
                  </Flex>
                </MotionBox>
              )}
              
              {/* Sample Questions */}
              {messages.length === 1 && (
                <MotionBox
                  mt={6}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Text 
                    fontSize="sm" 
                    color={colors.brown} 
                    mb={4} 
                    textAlign="center"
                    fontWeight="500"
                  >
                    {t('home.chatbot.popularQuestions')}
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {sampleQuestions.map((question, idx) => (
                      <MotionBox
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={`${colors.brown}30`}
                          borderWidth="2px"
                          color={colors.darkBrown}
                          bg={`linear-gradient(135deg, ${colors.cream}88, ${colors.lightCream}88)`}
                          backdropFilter="blur(10px)"
                          px={4}
                          py={3}
                          h="auto"
                          whiteSpace="normal"
                          textAlign="left"
                          fontSize="xs"
                          fontWeight="450"
                          borderRadius="12px"
                          position="relative"
                          overflow="hidden"
                          _hover={{
                            bg: `linear-gradient(135deg, ${colors.lightBrown}, ${colors.brown})`,
                            borderColor: colors.brown,
                            color: colors.cream,
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: '0 8px 20px rgba(139, 111, 71, 0.3)',
                            _before: {
                              opacity: 1,
                            },
                          }}
                          _before={{
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bg: 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          }}
                          onClick={() => setInput(question)}
                        >
                          <HStack spacing={3} align="center">
                            <Text fontSize="lg">💬</Text>
                            <Text flex={1}>{question}</Text>
                          </HStack>
                        </Button>
                      </MotionBox>
                    ))}
                  </SimpleGrid>
                </MotionBox>
              )}
            </Box>

            {/* Input Area */}
            <Box
              p={4}
              bg={`linear-gradient(180deg, ${colors.cream}DD, ${colors.lightCream}DD)`}
              backdropFilter="blur(20px)"
              borderTop="2px solid"
              borderColor={`${colors.brown}15`}
              position="relative"
              zIndex={2}
            >
              <VStack spacing={3}>
                <InputGroup size="md">
                  <Box position="relative" flex={1}>
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={t('home.chatbot.placeholder')}
                      bg={`linear-gradient(135deg, ${colors.lightCream}, ${colors.cream})`}
                      border="2px solid"
                      borderColor={`${colors.brown}30`}
                      borderRadius="16px"
                      px={5}
                      py={5}
                      pr={16}
                      fontSize="md"
                      fontWeight="450"
                      transition="all 0.3s ease"
                      _focus={{
                        borderColor: colors.brown,
                        boxShadow: `0 0 0 3px ${colors.brown}20, 0 8px 24px rgba(139, 111, 71, 0.15)`,
                        transform: 'scale(1.01)',
                      }}
                      _hover={{
                        borderColor: `${colors.brown}50`,
                      }}
                      color={colors.darkBrown}
                      _placeholder={{ 
                        color: `${colors.brown}60`,
                        fontWeight: '400',
                      }}
                    />
                    <HStack 
                      position="absolute" 
                      right={3} 
                      top="50%" 
                      transform="translateY(-50%)"
                      spacing={2}
                    >
                      <Button
                        onClick={handleSend}
                        bg={`linear-gradient(135deg, ${colors.lightBrown}, ${colors.brown})`}
                        color={colors.cream}
                        size="md"
                        borderRadius="16px"
                        px={5}
                        boxShadow="0 4px 12px rgba(139, 111, 71, 0.3)"
                        transition="all 0.2s ease"
                        _hover={{
                          bg: `linear-gradient(135deg, ${colors.brown}, ${colors.darkBrown})`,
                          transform: 'translateY(-2px) scale(1.05)',
                          boxShadow: '0 6px 20px rgba(139, 111, 71, 0.4)',
                        }}
                        _active={{
                          transform: 'translateY(0) scale(0.98)',
                        }}
                      >
                        <ArrowForwardIcon boxSize={5} />
                      </Button>
                    </HStack>
                  </Box>
                </InputGroup>
                
                <HStack spacing={2} w="full" justify="space-between">
                  <HStack spacing={2} fontSize="xs" color={colors.brown} opacity={0.6}>
                    <HStack spacing={1}>
                      <Text>⌨️</Text>
                      <Text>{t('home.chatbot.enterToSend')}</Text>
                    </HStack>
                  </HStack>
                  <Text fontSize="xs" color={colors.brown} opacity={0.5}>
                    {t('home.chatbot.poweredBy')}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};