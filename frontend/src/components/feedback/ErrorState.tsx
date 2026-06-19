import React from 'react';
import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  detail?: string;            // optional, de-emphasized technical detail (dev only)
  onRetry?: () => void;
  homeHref?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something broke',
  message = 'An unexpected error interrupted this page — not your fault. You can try again or head back.',
  detail,
  onRetry,
  homeHref,
}) => (
  <Box
    as="section"
    minH="60vh"
    display="flex"
    alignItems="center"
    bg="brand.cream"
    py={{ base: 16, md: 24 }}
  >
    <Container maxW="1180px">
      <VStack spacing={5} align="center" textAlign="center">
        <Text textStyle="eyebrow">Error</Text>
        <Heading textStyle="sectionTitle" color="brand.text">{title}</Heading>
        <Text textStyle="lead" color="brand.textSecondary" maxW="46ch">{message}</Text>
        {detail && (
          <Text
            as="pre"
            fontSize="xs"
            color="brand.textMuted"
            whiteSpace="pre-wrap"
            maxW="46ch"
            overflowX="auto"
          >
            {detail}
          </Text>
        )}
        {(onRetry || homeHref) && (
          <VStack spacing={3} pt={2}>
            {onRetry && (
              <Button variant="primary" onClick={onRetry}>
                Try again
              </Button>
            )}
            {homeHref && (
              <Button as={RouterLink} to={homeHref} variant="outline">
                Back home
              </Button>
            )}
          </VStack>
        )}
      </VStack>
    </Container>
  </Box>
);

export default ErrorState;
