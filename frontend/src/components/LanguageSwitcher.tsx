import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        size="sm"
        variant="ghost"
        color="brand.cream"
        _hover={{
          bg: 'rgba(255, 215, 0, 0.1)',
          transform: 'translateY(-1px)',
        }}
        _active={{
          bg: 'rgba(255, 215, 0, 0.2)',
          transform: 'translateY(0)'
        }}
        transition="all 0.2s ease"
        borderRadius="md"
        px={2}
        py={1}
        minW="auto"
      >
        <Box fontSize="xl">
          {currentLanguage.flag}
        </Box>
      </MenuButton>
      <MenuList
        bg="brand.primary"
        borderColor="brand.accent"
        borderWidth="2px"
        boxShadow="0 8px 32px rgba(220, 20, 60, 0.15)"
        borderRadius="lg"
        overflow="hidden"
        p={0}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            bg={lang.code === i18n.language ? 'brand.cream' : 'transparent'}
            _hover={{
              bg: 'brand.accent',
              color: 'brand.text',
              transform: 'translateX(4px)'
            }}
            transition="all 0.2s ease"
            fontWeight={lang.code === i18n.language ? 'semibold' : 'normal'}
            color={lang.code === i18n.language ? 'brand.secondary' : 'brand.text'}
            position="relative"
            px={4}
            py={3}
          >
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Box fontSize="lg">
                {lang.flag}
              </Box>
              <span style={{ fontSize: '0.875rem' }}>{lang.name}</span>
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};