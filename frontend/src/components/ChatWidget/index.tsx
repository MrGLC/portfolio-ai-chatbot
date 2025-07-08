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
import { useTranslation } from 'react-i18next';
import { variants, durations, easings } from '../../theme/animations';

const MotionBox = motion(Box);
// Use motion.div instead of motion(Flex) to avoid complex type issues
const MotionFlex = motion.div;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen, onToggle } = useDisclosure();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chat.messages.initial'),
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
        text: t('chat.messages.demoResponse'),
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
            bg="brand.surface"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="16px"
            boxShadow="0 20px 40px rgba(0, 0, 0, 0.1)"
            initial={variants.widgetOpen.initial}
            animate={variants.widgetOpen.animate}
            exit={variants.widgetOpen.exit}
            transition={variants.widgetOpen.transition}
          >
            {/* Header */}
            <Flex
              align="center"
              justify="space-between"
              p={4}
              borderBottom="1px solid"
              borderColor="brand.border"
              bg="brand.cream"
              borderTopRadius="16px"
            >
              <Flex align="center" gap={3}>
                <Box
                  w="32px"
                  h="32px"
                  bg="linear-gradient(135deg, #DC143C, #B91C3C)"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {t('chat.assistant.avatar')}
                  </Text>
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="600" color="brand.text">
                    {t('chat.assistant.name')}
                  </Text>
                  <Text fontSize="xs" color="brand.secondary">
                    {t('chat.assistant.status')}
                  </Text>
                </VStack>
              </Flex>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={t('chat.ariaLabels.close')}
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
                  style={{
                    display: 'flex',
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: durations.fast, ease: easings.smooth }}
                >
                  <Box
                    maxW="80%"
                    bg={message.isUser ? 'brand.secondary' : 'brand.cream'}
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
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: durations.fast, ease: easings.smooth }}
                >
                  <Box
                    bg="brand.cream"
                    px={3}
                    py={2}
                    borderRadius="12px"
                    fontSize="sm"
                  >
                    <Text color="brand.textSecondary">
                      {t('chat.typingIndicator')}
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
                  placeholder={t('chat.placeholder')}
                  size="sm"
                  variant="filled"
                  _placeholder={{ color: 'brand.textSecondary' }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  isDisabled={inputValue.trim() === ''}
                >
                  {t('chat.sendButton')}
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
        transition={{ duration: durations.fast, ease: easings.smooth }}
      >
        <IconButton
          bg="brand.accent"
          color="brand.text"
          size="lg"
          aria-label={t('chat.ariaLabels.open')}
          icon={isOpen ? <CloseIcon /> : <ChatIcon />}
          onClick={onToggle}
          borderRadius="full"
          w="60px"
          h="60px"
          boxShadow="0 8px 25px rgba(255, 215, 0, 0.3)"
          transition={`all ${durations.normal}s cubic-bezier(${easings.smooth.join(',')})`}
          _hover={{
            bg: 'brand.accentLight',
            transform: 'scale(1.1)',
          }}
        />
      </MotionBox>
    </Box>
  );
};

export default ChatWidget;