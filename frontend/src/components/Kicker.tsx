import React from 'react';
import { Flex, Box, Text } from '@chakra-ui/react';

interface KickerProps {
  children: React.ReactNode;
  /** Center the kicker (line + label) instead of left-aligning it.
      Accepts a responsive boolean for layouts that center only on mobile. */
  centered?: boolean | Record<string, boolean>;
  /** Label color override — the default gold-text (#a8863f) is tuned for
      cream backgrounds; pass e.g. "brand.goldBright" on dark/crimson bands. */
  color?: string;
}

/**
 * Handoff eyebrow/kicker: 12px 600 uppercase gold label preceded by a
 * 42×1px gold gradient line that fades toward the text
 * (docs/design-reference/.../README.md "Tipografía").
 */
export const Kicker: React.FC<KickerProps> = ({ children, centered = false, color }) => {
  const justify =
    typeof centered === 'boolean'
      ? centered
        ? 'center'
        : 'flex-start'
      : Object.fromEntries(
          Object.entries(centered).map(([bp, c]) => [bp, c ? 'center' : 'flex-start'])
        );

  return (
    <Flex align="center" gap={3} justify={justify} w="full">
      <Box
        w="42px"
        h="1px"
        flexShrink={0}
        bg="linear-gradient(90deg, #c2a05c, transparent)"
        aria-hidden="true"
      />
      <Text as="span" textStyle="eyebrow" color={color}>
        {children}
      </Text>
    </Flex>
  );
};

export default Kicker;
