/**
 * CodeSnippet component with syntax highlighting
 * Uses react-syntax-highlighter for beautiful code display
 */

import { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Box, Button, InlineStack, Text, Badge } from '@shopify/polaris';
import type { CodeLanguage } from '../types/recommendation.types';
import { detectLanguage, getLanguageName } from '../utils/recommendation-helpers';

interface CodeSnippetProps {
  code: string;
  language?: CodeLanguage;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  showLanguageBadge?: boolean;
  maxHeight?: string;
  theme?: 'dark' | 'light';
}

export function CodeSnippet({
  code,
  language,
  showLineNumbers = true,
  showCopyButton = true,
  showLanguageBadge = true,
  maxHeight = '400px',
  theme = 'dark',
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const detectedLanguage = language || detectLanguage(code);
  const languageName = getLanguageName(detectedLanguage);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code]);

  // Map our language types to Prism language names
  const prismLanguage: string = detectedLanguage === 'liquid' ? 'markup' : detectedLanguage;

  const syntaxTheme = theme === 'dark' ? oneDark : oneLight;

  return (
    <Box
      background={theme === 'dark' ? 'bg-surface-inverse' : 'bg-surface-secondary'}
      borderRadius="200"
      overflow="hidden"
    >
      {/* Header with language badge and copy button */}
      <Box
        padding="200"
        background={theme === 'dark' ? 'bg-surface-inverse' : 'bg-surface-secondary'}
      >
        <InlineStack align="space-between" blockAlign="center">
          {showLanguageBadge && (
            <Badge tone="info">{languageName}</Badge>
          )}
          {!showLanguageBadge && <div />}
          {showCopyButton && (
            <Button
              size="slim"
              onClick={handleCopy}
              icon={copied ? undefined : undefined}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          )}
        </InlineStack>
      </Box>

      {/* Code block */}
      <div style={{ maxHeight, overflow: 'auto' }}>
        <SyntaxHighlighter
          language={prismLanguage}
          style={syntaxTheme}
          showLineNumbers={showLineNumbers}
          wrapLines
          wrapLongLines
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.5',
            borderRadius: 0,
            background: 'transparent',
          }}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: theme === 'dark' ? '#636d83' : '#999',
            userSelect: 'none',
          }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </Box>
  );
}

export default CodeSnippet;
