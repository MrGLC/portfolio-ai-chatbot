import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export interface ChapterLabelProps {
  chapterId: string | null;
}

// Chapter id -> i18n label key (home.jewel.labels.*). Exact mapping per spec.
export const CHAPTER_LABEL_KEY: Record<string, string> = {
  'story-hero': 'rawStone',
  'story-chatbot': 'theModel',
  'story-portfolio': 'theMetrics',
  'story-cta': 'transformed',
};

const MotionBox = motion.create(Box);

/**
 * Always-visible gold pill naming the jewel's current chapter. Anchored to the
 * right (the jewel's side) on desktop, top-centre on mobile. Text crossfades on
 * chapter change; reduced-motion swaps instantly. Renders nothing when no
 * chapter is active (off the story sections).
 */
export const ChapterLabel: React.FC<ChapterLabelProps> = ({ chapterId }) => {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const key = chapterId ? CHAPTER_LABEL_KEY[chapterId] : undefined;
  if (!key) return null;

  return (
    <Box
      position="fixed"
      zIndex={7}
      pointerEvents="none"
      // Desktop: right margin, vertically centred near the jewel band.
      // Mobile: top-centre under the nav.
      right={{ base: 0, md: '7%' }}
      left={{ base: 0, md: 'auto' }}
      top={{ base: '88px', md: '50%' }}
      transform={{ base: 'none', md: 'translateY(-50%)' }}
      display="flex"
      justifyContent={{ base: 'center', md: 'flex-end' }}
    >
      <AnimatePresence mode="wait">
        <MotionBox
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
          px="9px"
          py="4px"
          borderRadius="20px"
          bg="rgba(255,255,255,.6)"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="rgba(194,160,92,.5)"
        >
          <Text
            fontSize="11px"
            fontWeight={700}
            letterSpacing=".12em"
            textTransform="uppercase"
            color="brand.goldRich"
            whiteSpace="nowrap"
          >
            {t(`home.jewel.labels.${key}`)}
          </Text>
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
};

export default ChapterLabel;
