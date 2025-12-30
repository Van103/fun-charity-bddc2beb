import React from "react";

/**
 * Formats post content by converting markdown-like syntax to React elements
 * Handles: **bold**, *italic*, __underline__, ~~strikethrough~~, @mentions
 */
export function formatPostContent(content: string): React.ReactNode[] {
  if (!content) return [];

  const nodes: React.ReactNode[] = [];
  let key = 0;
  
  // Combined regex for markdown and mentions
  // @[Name](user_id) format for mentions
  const combinedRegex = /(\*\*.*?\*\*|\*[^*]+?\*|__.*?__|~~.*?~~|@\[([^\]]+)\]\(([^)]+)\))/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = combinedRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index));
    }
    
    const matchedText = match[0];
    
    // Check for mention format @[Name](user_id)
    if (matchedText.startsWith("@[") && matchedText.includes("](")) {
      const mentionMatch = matchedText.match(/@\[([^\]]+)\]\(([^)]+)\)/);
      if (mentionMatch) {
        const displayName = mentionMatch[1];
        const userId = mentionMatch[2];
        nodes.push(
          React.createElement(
            "a",
            {
              key: key++,
              href: `/user/${userId}`,
              className: "text-primary font-semibold hover:underline cursor-pointer",
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
              },
            },
            `@${displayName}`
          )
        );
      }
    }
    // Determine which markdown pattern matched and apply formatting
    else if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      const inner = matchedText.slice(2, -2);
      nodes.push(React.createElement('strong', { key: key++, className: 'font-semibold' }, inner));
    } else if (matchedText.startsWith('__') && matchedText.endsWith('__')) {
      const inner = matchedText.slice(2, -2);
      nodes.push(React.createElement('u', { key: key++ }, inner));
    } else if (matchedText.startsWith('~~') && matchedText.endsWith('~~')) {
      const inner = matchedText.slice(2, -2);
      nodes.push(React.createElement('del', { key: key++, className: 'text-muted-foreground' }, inner));
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      const inner = matchedText.slice(1, -1);
      nodes.push(React.createElement('em', { key: key++ }, inner));
    }
    
    lastIndex = match.index + matchedText.length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }
  
  return nodes.length > 0 ? nodes : [content];
}

/**
 * Simple version that just removes markdown markers for plain text display
 */
export function stripMarkdown(content: string): string {
  if (!content) return "";
  return content
    .replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1') // Convert mentions to @Name
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/~~(.+?)~~/g, '$1');
}

/**
 * Extract mentioned user IDs from content
 */
export function extractMentionIds(content: string): string[] {
  if (!content) return [];
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const ids: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    ids.push(match[2]);
  }
  
  return ids;
}
