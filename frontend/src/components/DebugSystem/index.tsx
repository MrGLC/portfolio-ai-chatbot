import React, { useState, createContext, useContext } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Collapse,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, InfoIcon } from '@chakra-ui/icons';

// Debug Context
interface DebugContextType {
  isDebugMode: boolean;
  toggleDebug: () => void;
}

const DebugContext = createContext<DebugContextType>({
  isDebugMode: false,
  toggleDebug: () => {},
});

export const useDebug = () => useContext(DebugContext);

// Debug Provider
export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(false);

  const toggleDebug = () => setIsDebugMode(!isDebugMode);

  return (
    <DebugContext.Provider value={{ isDebugMode, toggleDebug }}>
      {children}
    </DebugContext.Provider>
  );
};

// Debug Wrapper Component
interface DebugWrapperProps {
  name: string;
  type?: 'section' | 'container' | 'component' | 'element';
  layer?: number;
  position?: 'fixed' | 'relative' | 'absolute' | 'sticky';
  children: React.ReactNode;
  className?: string;
}

export const DebugWrapper: React.FC<DebugWrapperProps> = ({
  name,
  type = 'component',
  layer = 0,
  position = 'relative',
  children,
  className = '',
}) => {
  const { isDebugMode } = useDebug();

  if (!isDebugMode) {
    return <>{children}</>;
  }

  const colors = [
    'border-red-500 bg-red-50',
    'border-blue-500 bg-blue-50',
    'border-green-500 bg-green-50',
    'border-purple-500 bg-purple-50',
    'border-yellow-500 bg-yellow-50',
    'border-pink-500 bg-pink-50',
    'border-teal-500 bg-teal-50',
    'border-orange-500 bg-orange-50',
  ];

  const borderColor = colors[layer % colors.length];
  const typeColors = {
    section: '#FF6B6B',
    container: '#4ECDC4',
    component: '#45B7D1',
    element: '#96CEB4',
  };

  return (
    <Box
      position="relative"
      border="2px dashed"
      borderColor={typeColors[type]}
      bg={`${typeColors[type]}10`}
      p={2}
      m={1}
      className={className}
      _hover={{
        bg: `${typeColors[type]}20`,
        borderStyle: 'solid',
      }}
      transition="all 0.2s"
    >
      {/* Top Label */}
      <Box
        position="absolute"
        top="-24px"
        left="0"
        bg="black"
        color="white"
        px={2}
        py={1}
        fontSize="xs"
        fontFamily="mono"
        zIndex={9999}
        borderRadius="4px 4px 0 0"
        whiteSpace="nowrap"
      >
        {name} | {type} | L{layer} | {position}
      </Box>

      {/* Corner Type Badge */}
      <Badge
        position="absolute"
        top="-12px"
        right="0"
        bg={typeColors[type]}
        color="white"
        fontSize="xs"
        fontFamily="mono"
        px={2}
        py={1}
        borderRadius="0 0 4px 4px"
      >
        {type.toUpperCase()}
      </Badge>

      {children}
    </Box>
  );
};

// Component Tree Display
const ComponentTree: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  
  const tree = [
    { name: 'App.tsx (Root)', level: 0, type: 'app' },
    { name: '├─ Layout', level: 1, type: 'container' },
    { name: '│  ├─ Navigation (Fixed)', level: 2, type: 'component' },
    { name: '│  ├─ Main Content', level: 2, type: 'container' },
    { name: '│  └─ Footer', level: 2, type: 'component' },
    { name: '├─ HomePage', level: 1, type: 'page' },
    { name: '│  ├─ Hero Section', level: 2, type: 'section' },
    { name: '│  │  ├─ Background Pattern', level: 3, type: 'element' },
    { name: '│  │  ├─ Content Container', level: 3, type: 'container' },
    { name: '│  │  │  ├─ Left Column', level: 4, type: 'container' },
    { name: '│  │  │  │  ├─ Badge', level: 5, type: 'element' },
    { name: '│  │  │  │  ├─ Main Heading', level: 5, type: 'element' },
    { name: '│  │  │  │  ├─ Description', level: 5, type: 'element' },
    { name: '│  │  │  │  ├─ CTA Buttons', level: 5, type: 'component' },
    { name: '│  │  │  │  └─ Trust Indicators', level: 5, type: 'component' },
    { name: '│  │  │  └─ Right Column', level: 4, type: 'container' },
    { name: '│  │  │     └─ Dashboard Card', level: 5, type: 'component' },
    { name: '│  ├─ Expertise Section', level: 2, type: 'section' },
    { name: '│  │  ├─ Section Header', level: 3, type: 'component' },
    { name: '│  │  └─ Cards Grid', level: 3, type: 'container' },
    { name: '│  │     ├─ Computer Vision Card', level: 4, type: 'component' },
    { name: '│  │     ├─ Machine Learning Card', level: 4, type: 'component' },
    { name: '│  │     └─ AI Strategy Card', level: 4, type: 'component' },
    { name: '│  └─ CTA Section', level: 2, type: 'section' },
    { name: '├─ ChatWidget (Fixed)', level: 1, type: 'component' },
    { name: '└─ ScrollToTop (Fixed)', level: 1, type: 'component' },
  ];
  
  return (
    <Box
      position="fixed"
      top="100px"
      right="20px"
      bg="black"
      color="green.400"
      p={4}
      borderRadius="8px"
      fontFamily="mono"
      fontSize="xs"
      zIndex={9998}
      maxW="350px"
      maxH="70vh"
      overflowY="auto"
      border="1px solid"
      borderColor="green.400"
    >
      <HStack justify="space-between" mb={3}>
        <Text color="white" fontWeight="bold">
          Component Tree
        </Text>
        <IconButton
          size="xs"
          variant="ghost"
          icon={isOpen ? <ViewOffIcon /> : <ViewIcon />}
          onClick={onToggle}
          color="green.400"
          aria-label="Toggle tree"
        />
      </HStack>
      
      <Collapse in={isOpen}>
        <VStack align="stretch" spacing={1}>
          {tree.map((item, index) => (
            <Text
              key={index}
              pl={`${item.level * 12}px`}
              color={
                item.type === 'section' ? 'red.300' :
                item.type === 'container' ? 'blue.300' :
                item.type === 'component' ? 'green.300' :
                item.type === 'page' ? 'purple.300' :
                'gray.400'
              }
              _hover={{ bg: 'whiteAlpha.200' }}
              p={1}
              borderRadius="2px"
              cursor="pointer"
            >
              {item.name}
            </Text>
          ))}
        </VStack>
      </Collapse>
    </Box>
  );
};

// Grid Overlay
const GridOverlay: React.FC = () => {
  const [showGrid, setShowGrid] = useState(true);
  
  return (
    <>
      <Button
        position="fixed"
        bottom="80px"
        right="20px"
        size="sm"
        colorScheme="blue"
        variant="solid"
        onClick={() => setShowGrid(!showGrid)}
        zIndex={9997}
        fontFamily="mono"
        fontSize="xs"
      >
        {showGrid ? 'Hide' : 'Show'} Grid
      </Button>
      
      {showGrid && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          pointerEvents="none"
          zIndex={9990}
        >
          {/* 12 Column Grid */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gap={0}
            maxW="7xl"
            mx="auto"
          >
            {[...Array(12)].map((_, i) => (
              <Box
                key={i}
                borderRight="1px solid"
                borderColor="red.300"
                opacity={0.3}
                h="full"
                position="relative"
              >
                <Text
                  position="absolute"
                  top="10px"
                  left="4px"
                  fontSize="xs"
                  color="red.500"
                  bg="white"
                  px={1}
                  fontWeight="bold"
                >
                  {i + 1}
                </Text>
              </Box>
            ))}
          </Box>
          
          {/* Viewport Info */}
          <Box
            position="absolute"
            bottom="20px"
            left="20px"
            bg="black"
            color="white"
            p={3}
            borderRadius="8px"
            fontFamily="mono"
            fontSize="xs"
          >
            <Text>Viewport: {window.innerWidth}x{window.innerHeight}</Text>
            <Text>Scroll: {window.scrollY}px</Text>
          </Box>
        </Box>
      )}
    </>
  );
};

// Main Debug Controls
export const DebugControls: React.FC = () => {
  const { isDebugMode, toggleDebug } = useDebug();
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      {/* Main Debug Toggle */}
      <Button
        position="fixed"
        top="20px"
        left="20px"
        size="sm"
        colorScheme={isDebugMode ? 'red' : 'green'}
        variant="solid"
        onClick={toggleDebug}
        zIndex={9999}
        fontFamily="mono"
        leftIcon={isDebugMode ? <ViewOffIcon /> : <ViewIcon />}
      >
        {isDebugMode ? 'Exit Debug' : 'Debug Mode'}
      </Button>

      {/* Debug Info Panel */}
      {isDebugMode && (
        <>
          <Box
            position="fixed"
            top="20px"
            left="150px"
            bg="black"
            color="white"
            p={4}
            borderRadius="8px"
            zIndex={9998}
            fontFamily="mono"
            fontSize="xs"
          >
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="bold">DEBUG CONTROLS</Text>
              <IconButton
                size="xs"
                variant="ghost"
                icon={<InfoIcon />}
                onClick={onToggle}
                color="white"
                aria-label="Toggle info"
              />
            </HStack>
            
            <Collapse in={isOpen}>
              <VStack align="start" spacing={2}>
                <Text color="red.300">🔴 Sections</Text>
                <Text color="blue.300">🔵 Containers</Text>
                <Text color="green.300">🟢 Components</Text>
                <Text color="purple.300">🟣 Pages</Text>
                <Text color="gray.400">⚪ Elements</Text>
                <Text mt={2} color="yellow.300">
                  Hover elements to highlight
                </Text>
              </VStack>
            </Collapse>
          </Box>

          <ComponentTree />
          <GridOverlay />
        </>
      )}
    </>
  );
};