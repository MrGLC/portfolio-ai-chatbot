import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, Button, Stack } from '@chakra-ui/react';
import ProtoJewel from './ProtoJewel';
import ProtoField from './ProtoField';
import ProtoFacets from './ProtoFacets';

// Temporary prototype harness — never merged to main. Renders a candidate
// hero scene with mock hero copy on top to judge composition and legibility.
const SCENES: Record<string, React.FC> = {
  jewel: ProtoJewel,
  field: ProtoField,
  facets: ProtoFacets,
};

export const ProtoView: React.FC = () => {
  const { id = 'jewel' } = useParams();
  const Scene = SCENES[id] ?? ProtoJewel;
  return (
    <Box position="relative" h="100vh" overflow="hidden" bg="#140306">
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Box position="relative" zIndex={2} h="100%" display="flex" alignItems="center" px={{ base: 6, md: 24 }}>
        <Stack spacing={6} maxW="560px">
          <Text color="#FFD700" fontSize="sm" letterSpacing="2px" textTransform="uppercase" fontWeight={500}>
            Luxury AI Solutions Redefined
          </Text>
          <Heading color="#F5E6D3" fontFamily="heading" fontWeight={700} fontSize={{ base: '3xl', md: '6xl' }} lineHeight={1.1}>
            Modern AI Excellence
          </Heading>
          <Text color="rgba(245, 230, 211, 0.85)" fontSize={{ base: 'md', md: 'xl' }}>
            Transform your business with cutting-edge artificial intelligence solutions. Production-ready MVP in 2 weeks.
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
            <Button bg="#DC143C" color="white" size="lg" _hover={{ bg: '#C41E3A' }}>View Portfolio</Button>
            <Button variant="outline" color="#F5E6D3" borderColor="#F5E6D3" size="lg">Get in Touch</Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default ProtoView;
