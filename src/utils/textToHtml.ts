/**
 * Converts plain text to formatted HTML for blog posts
 * Handles headings, paragraphs, lists, bold text, links, etc.
 */
export const convertTextToHtml = (text: string): string => {
  if (!text) return '';

  const lines = text.split('\n');
  const htmlParts: string[] = [];
  let inOrderedList = false;
  let inUnorderedList = false;
  let currentParagraph = '';

  const closeLists = () => {
    if (inOrderedList) {
      htmlParts.push('</ol>');
      inOrderedList = false;
    }
    if (inUnorderedList) {
      htmlParts.push('</ul>');
      inUnorderedList = false;
    }
  };

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      // Process inline formatting
      let formatted = currentParagraph
        // Bold text (**text** or __text__)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        // Italic text (*text* or _text_)
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        // Auto-link URLs
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');

      htmlParts.push(`<p>${formatted}</p>`);
      currentParagraph = '';
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line - close lists and flush paragraph
    if (!trimmed) {
      closeLists();
      flushParagraph();
      return;
    }

    // Main heading (starts with number followed by dot and space, or all caps)
    if (/^\d+\.\s+[A-Z]/.test(trimmed) && trimmed.length < 100) {
      closeLists();
      flushParagraph();
      const headingText = trimmed.replace(/^\d+\.\s+/, '');
      htmlParts.push(`<h2>${headingText}</h2>`);
      return;
    }

    // Question headings (Q1, Q2, etc.)
    if (/^Q\d+\./.test(trimmed)) {
      closeLists();
      flushParagraph();
      htmlParts.push(`<h3>${trimmed}</h3>`);
      return;
    }

    // Subheadings (lines with emoji indicators or special markers)
    if (/^[🔥💎🕶️⚡✅🚫👉🌐🎟️💸👥🕒💬🔔]/.test(trimmed)) {
      closeLists();
      flushParagraph();
      htmlParts.push(`<h4>${trimmed}</h4>`);
      return;
    }

    // Numbered list items (1., 2., etc. at start or after Q&A)
    if (/^\d+\.\s+/.test(trimmed) && !trimmed.match(/^Q\d+\./)) {
      flushParagraph();
      if (inUnorderedList) {
        htmlParts.push('</ul>');
        inUnorderedList = false;
      }
      if (!inOrderedList) {
        htmlParts.push('<ol>');
        inOrderedList = true;
      }
      const listText = trimmed.replace(/^\d+\.\s+/, '');
      htmlParts.push(`<li>${listText}</li>`);
      return;
    }

    // Bullet points (-, *, •, or emoji bullets)
    if (/^[-*•🔗🏷️💡💼]/.test(trimmed)) {
      flushParagraph();
      if (inOrderedList) {
        htmlParts.push('</ol>');
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        htmlParts.push('<ul>');
        inUnorderedList = true;
      }
      const listText = trimmed.replace(/^[-*•🔗🏷️💡💼]\s*/, '');
      htmlParts.push(`<li>${listText}</li>`);
      return;
    }

    // Regular paragraph text
    closeLists();
    if (currentParagraph) {
      currentParagraph += ' ' + trimmed;
    } else {
      currentParagraph = trimmed;
    }
  });

  // Flush any remaining content
  closeLists();
  flushParagraph();

  return htmlParts.join('\n');
};

/**
 * Converts HTML back to plain text for editing
 */
export const convertHtmlToText = (html: string): string => {
  if (!html) return '';

  return html
    // Convert headings
    .replace(/<h2>(.*?)<\/h2>/g, '\n$1\n')
    .replace(/<h3>(.*?)<\/h3>/g, '\n$1\n')
    .replace(/<h4>(.*?)<\/h4>/g, '\n$1\n')
    // Convert paragraphs
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
    // Convert lists
    .replace(/<ol>/g, '\n')
    .replace(/<\/ol>/g, '\n')
    .replace(/<ul>/g, '\n')
    .replace(/<\/ul>/g, '\n')
    .replace(/<li>(.*?)<\/li>/g, '• $1\n')
    // Convert inline formatting
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

