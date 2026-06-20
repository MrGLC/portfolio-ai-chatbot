// frontend/src/pages/home/StatStrip.tsx
import React from 'react';
import { Wrap, WrapItem, Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export const StatStrip: React.FC = () => {
  const { t } = useTranslation();
  const stats = t('home.proof.heroStats', { returnObjects: true }) as Array<{ figure: string; caption: string }>;
  return (
    <Wrap spacing={{ base: 6, md: 10 }} pt={4} role="list">
      {stats.map((s) => (
        <WrapItem key={s.caption} role="listitem">
          <Box>
            <Text fontFamily="heading" fontWeight={600} fontSize={{ base: '24px', md: '30px' }} color="brand.secondary" lineHeight={1}>
              {s.figure}
            </Text>
            <Text fontSize="11px" color="brand.textMuted" maxW="150px" mt={1}>
              {s.caption}
            </Text>
          </Box>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default StatStrip;
