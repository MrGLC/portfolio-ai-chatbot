import React, { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  Text,
  Input,
  Button,
  IconButton,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { ChatIcon, CloseIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Luis's AI assistant. I can help you learn about his AI consulting services. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your question! This is a demo response. Luis specializes in AI strategy consulting, machine learning implementation, and custom AI solutions. Would you like to schedule a consultation?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      position="fixed"
      bottom="20px"
      left="20px"
      zIndex={1000}
    >
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            position="absolute"
            bottom="80px"
            left="0"
            w="350px"
            h="500px"
            bg="brand.secondary"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="16px"
            boxShadow="0 20px 40px rgba(0, 0, 0, 0.3)"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <Flex
              align="center"
              justify="space-between"
              p={4}
              borderBottom="1px solid"
              borderColor="brand.border"
              bg="brand.surface"
              borderTopRadius="16px"
            >
              <Flex align="center" gap={3}>
                <Box
                  w="32px"
                  h="32px"
                  bg="linear-gradient(135deg, #00ABE4, #7ACFD6)"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    AI
                  </Text>
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="600" color="brand.text">
                    Luis's AI Assistant
                  </Text>
                  <Text fontSize="xs" color="brand.accent">
                    Online
                  </Text>
                </VStack>
              </Flex>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="Close chat"
                icon={<CloseIcon />}
                onClick={onToggle}
                color="brand.textSecondary"
                _hover={{ color: 'brand.text' }}
              />
            </Flex>

            {/* Messages */}
            <VStack
              align="stretch"
              spacing={3}
              p={4}
              h="360px"
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#3A3A3A',
                  borderRadius: '2px',
                },
              }}
            >
              {messages.map((message) => (
                <MotionFlex
                  key={message.id}
                  justify={message.isUser ? 'flex-end' : 'flex-start'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    maxW="80%"
                    bg={message.isUser ? 'brand.accent' : 'brand.surface'}
                    color={message.isUser ? 'white' : 'brand.text'}
                    px={3}
                    py={2}
                    borderRadius="12px"
                    fontSize="sm"
                    lineHeight="1.4"
                  >
                    {message.text}
                  </Box>
                </MotionFlex>
              ))}
              
              {isTyping && (
                <MotionFlex
                  justify="flex-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Box
                    bg="brand.surface"
                    px={3}
                    py={2}
                    borderRadius="12px"
                    fontSize="sm"
                  >
                    <Text color="brand.textSecondary">
                      Typing...
                    </Text>
                  </Box>
                </MotionFlex>
              )}
            </VStack>

            {/* Input */}
            <Box
              p={4}
              borderTop="1px solid"
              borderColor="brand.border"
              borderBottomRadius="16px"
            >
              <Flex gap={2}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about AI consulting..."
                  size="sm"
                  bg="brand.surface"
                  border="1px solid"
                  borderColor="brand.border"
                  color="brand.text"
                  _placeholder={{ color: 'brand.textSecondary' }}
                  _focus={{
                    borderColor: 'brand.accent',
                    boxShadow: 'none',
                  }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  isDisabled={inputValue.trim() === ''}
                >
                  Send
                </Button>
              </Flex>
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <MotionBox
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconButton
          variant="primary"
          size="lg"
          aria-label="Open chat"
          icon={isOpen ? <CloseIcon /> : <ChatIcon />}
          onClick={onToggle}
          borderRadius="full"
          w="60px"
          h="60px"
          boxShadow="0 8px 25px rgba(0, 171, 228, 0.3)"
        />
      </MotionBox>
    </Box>
  );
};

export default ChatWidget;