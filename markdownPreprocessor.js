export function prepareTextForTTS(text) {
  text = text.replace(/^(#+)\s+(.*)$/gm, '$2');
  text = text.replace(/^\s*[\-\*]\s+/gm, 'Next item, ');
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/```[\s\S]*?```/g, 'Code block omitted.');
  text = text.replace(/[\*\#]/g, ''); // Remove markdown characters that might conflict with SSML
  return text;
}

