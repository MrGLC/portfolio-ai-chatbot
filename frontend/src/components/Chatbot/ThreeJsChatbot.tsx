import React, { useRef, useState, useEffect } from 'react';
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
  Badge,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { chatbotAPI } from '../../services/api';

const MotionBox = motion.create(Box);

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


// Static CSS gem avatar — replaces per-message WebGL canvases
const StaticAvatar: React.FC<{ isUser: boolean }> = ({ isUser }) => (
  <Box
    w="24px"
    h="24px"
    flexShrink={0}
    transform="rotate(45deg)"
    borderRadius="4px"
    bgGradient={isUser
      ? 'linear(135deg, #FFD700, #B8860B)'
      : 'linear(135deg, #DC143C, #8B0000)'}
    boxShadow={isUser
      ? '0 0 8px rgba(255, 215, 0, 0.5)'
      : '0 0 8px rgba(220, 20, 60, 0.5)'}
    aria-hidden="true"
  />
);

// Message Bubble Component with enhanced design
function MessageBubble({ message, isUser }: { message: string; isUser: boolean }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Flex justify={isUser ? 'flex-end' : 'flex-start'} mb={4} align="flex-start" gap={2}>
        {!isUser && <StaticAvatar isUser={false} />}
        
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
        
        {isUser && <StaticAvatar isUser={true} />}
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    // Skip the mount run — scrolling the welcome message into view would
    // drag the whole page down to the chatbot section on every Home visit.
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  const sampleQuestions = [
    t('home.chatbot.sampleQuestions.skills'),
    t('home.chatbot.sampleQuestions.projects'),
    t('home.chatbot.sampleQuestions.experience'),
    t('home.chatbot.sampleQuestions.availability'),
  ];

  const CANNED_KEYS = ['skills', 'projects', 'experience', 'availability'] as const;
  const cannedFor = (msg: string): string | null => {
    const hit = CANNED_KEYS.find((k) => t(`home.chatbot.sampleQuestions.${k}`) === msg);
    return hit ? t(`home.chatbot.cannedAnswers.${hit}`) : null;
  };

  const handleSend = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message) return;

    setMessages(prev => [...prev, { id: Date.now(), text: message, isUser: true }]);
    setInput('');

    const canned = cannedFor(message);
    if (canned) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: canned, isUser: false }]);
        setIsTyping(false);
      }, 800);
      return;
    }

    setIsTyping(true);
    chatbotAPI.sendMessage(message)
      .then((res: { data: { response?: string; message?: string } }) => {
        const responseText = res.data.response ?? res.data.message ?? t('home.chatbot.errorFallback');
        setIsTyping(false);
        setHasNewMessage(true);
        setMessages(prev => [...prev, { id: Date.now(), text: responseText, isUser: false }]);
        setTimeout(() => setHasNewMessage(false), 1000);
      })
      .catch(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: t('home.chatbot.errorGeneric'),
          isUser: false,
        }]);
      });
  };

  return (
    <Box position="relative" zIndex={3}>
      <Container maxW="1200px">
        <Flex gap={8} align="stretch" minH="600px">
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
                    <HStack spacing={2}>
                      <Heading size="sm" color={colors.darkBrown}>
                        {t('home.chatbot.chatTitle')}
                      </Heading>
                      <Badge colorScheme="yellow" fontSize="xs" title={t('home.chatbot.demoNotice')}>
                        {t('home.chatbot.demoBadge')}
                      </Badge>
                    </HStack>
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
              role="log"
              aria-live="polite"
              aria-label={t('home.chatbot.chatTitle')}
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
                  <Flex justify="flex-start" mb={4} align="flex-start" gap={2} aria-label={t('home.chatbot.typing')}>
                    <StaticAvatar isUser={false} />
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
                          onClick={() => handleSend(question)}
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

              <div ref={messagesEndRef} />
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
                      aria-label={t('home.chatbot.placeholder')}
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
                        onClick={() => handleSend()}
                        aria-label={t('home.chatbot.send')}
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