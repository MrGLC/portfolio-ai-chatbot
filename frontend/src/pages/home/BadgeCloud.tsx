// frontend/src/pages/home/BadgeCloud.tsx
import React from 'react';
import { VStack, Text, Wrap, WrapItem, Tag } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { PROOF_STACK } from './proofStack';

export const BadgeCloud: React.FC = () => {
  const { t } = useTranslation();
  const domains = t('home.proof.domains', { returnObjects: true }) as string[];
  return (
    <VStack spacing={6} w="full" maxW="760px" mx="auto">
      <Text textStyle="cardTitle" color="brand.text" textAlign="center">
        {t('home.proof.synthesis')}
      </Text>
      <Wrap justify="center" spacing={3}>
        {domains.map((d) => (
          <WrapItem key={d}><Tag variant="gold">{d}</Tag></WrapItem>
        ))}
      </Wrap>
      <Wrap justify="center" spacing={2}>
        {PROOF_STACK.map((s) => (
          <WrapItem key={s}>
            <Text fontSize="11px" color="brand.textMuted" letterSpacing="0.02em">{s}</Text>
          </WrapItem>
        ))}
      </Wrap>
    </VStack>
  );
};

export default BadgeCloud;
