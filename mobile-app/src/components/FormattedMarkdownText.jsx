import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * FormattedMarkdownText
 * Parses Markdown **bold** segments into properly styled bold Text components.
 * Converts markdown list lines (- / * / •) into clean bullet points.
 */
export default function FormattedMarkdownText({ text = '', isUser = false, style, boldStyle }) {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');

  return (
    <Text style={style}>
      {lines.map((line, lineIndex) => {
        let cleanLine = line;

        // Convert markdown bullets (- or *) into clean bullets
        if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
          cleanLine = '• ' + cleanLine.slice(2);
        } else if (cleanLine.startsWith('### ')) {
          cleanLine = cleanLine.slice(4);
        } else if (cleanLine.startsWith('## ')) {
          cleanLine = cleanLine.slice(3);
        } else if (cleanLine.startsWith('# ')) {
          cleanLine = cleanLine.slice(2);
        }

        // Split by **bold** markdown tokens
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        return (
          <React.Fragment key={lineIndex}>
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                const boldContent = part.slice(2, -2);
                return (
                  <Text
                    key={partIndex}
                    style={[
                      styles.defaultBold,
                      isUser ? styles.userBold : styles.aiBold,
                      boldStyle,
                    ]}
                  >
                    {boldContent}
                  </Text>
                );
              }
              return <React.Fragment key={partIndex}>{part}</React.Fragment>;
            })}
            {lineIndex < lines.length - 1 ? '\n' : null}
          </React.Fragment>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  defaultBold: {
    fontWeight: '800',
  },
  aiBold: {
    color: '#0F172A',
    fontWeight: '800',
  },
  userBold: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

