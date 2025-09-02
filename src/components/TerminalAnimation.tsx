import { useEffect, useState } from 'preact/hooks';

// Animation configuration constants
const LOOP_ANIMATION = false;
const TYPING_SPEED = 50; // Base typing speed in milliseconds (lower = faster)

// Data structure for terminal lines
type TerminalObject =
  | { type: 'text', content: string }
  | { type: 'instant', content: string }
  | { type: 'icon', icon: 'timer' | 'check' };

type TerminalLine = TerminalObject[];

const TERMINAL_LINES: TerminalLine[] = [
  [{ type: 'text', content: '• #meditate' }],
  [{ type: 'text', content: '\t• ' }, { type: 'icon', icon: 'timer' }, { type: 'instant', content: '15m' }],
  [{ type: 'text', content: '• ' }, { type: 'icon', icon: 'check' }, { type: 'text', content: '#exercise' }],
  [{ type: 'text', content: '\t• ' }, { type: 'text', content: 'ran 93.7km' }],
  [{ type: 'text', content: '\t• ' }, { type: 'text', content: '3 push ups' }],
  [{ type: 'text', content: '• Later today' }],
  [{ type: 'text', content: '\t• ' }, { type: 'text', content: 'water the cat' }],
  [{ type: 'text', content: '\t• ' }, { type: 'text', content: 'feed the lawn' }],
];

export function TerminalAnimation() {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [renderedLines, setRenderedLines] = useState<TerminalLine[]>([]);
  const [currentLineObjects, setCurrentLineObjects] = useState<TerminalObject[]>([]);

  // Helper function to render an icon
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'check':
        return (
          <span className="px-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-4 h-4 text-blue-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </span>
        )
      case 'timer':
        return (
          <span className="px-0.5">

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="inline w-4 h-4 text-blue-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  // Animation effect
  useEffect(() => {
    if (currentLineIndex >= TERMINAL_LINES.length) {
      if (LOOP_ANIMATION) {
        // Reset animation after completion
        const resetTimer = setTimeout(() => {
          setCurrentLineIndex(0);
          setCurrentObjectIndex(0);
          setCurrentCharIndex(0);
          setRenderedLines([]);
          setCurrentLineObjects([]);
        }, 3000);
        return () => clearTimeout(resetTimer);
      }
      return;
    }

    const currentLine = TERMINAL_LINES[currentLineIndex];

    if (currentObjectIndex >= currentLine.length) {
      // Move to next line
      const timer = setTimeout(() => {
        setRenderedLines(prev => [...prev, currentLineObjects]);
        setCurrentLineObjects([]);
        setCurrentLineIndex(prev => prev + 1);
        setCurrentObjectIndex(0);
        setCurrentCharIndex(0);
      }, 200);
      return () => clearTimeout(timer);
    }

    const currentObject = currentLine[currentObjectIndex];

    if (currentObject.type === 'icon' || currentObject.type === 'instant') {
      // Add icon or instant text immediately and move to next object
      const timer = setTimeout(() => {
        setCurrentLineObjects(prev => [...prev, currentObject]);
        setCurrentObjectIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Type out text character by character
      const textContent = currentObject.content;
      if (currentCharIndex < textContent.length) {
        const timer = setTimeout(() => {
          setCurrentCharIndex(prev => prev + 1);
        }, TYPING_SPEED + Math.random() * 50);
        return () => clearTimeout(timer);
      } else {
        // Text object complete, add it and move to next object
        const timer = setTimeout(() => {
          setCurrentLineObjects(prev => [...prev, currentObject]);
          setCurrentObjectIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [currentLineIndex, currentObjectIndex, currentCharIndex]);

  // Get current partial text for typing effect
  const getCurrentPartialText = () => {
    if (currentLineIndex >= TERMINAL_LINES.length) return '';
    const currentLine = TERMINAL_LINES[currentLineIndex];
    if (currentObjectIndex >= currentLine.length) return '';
    const currentObject = currentLine[currentObjectIndex];
    if (currentObject.type === 'text') {
      const content = currentObject.content;
      // Check if line starts with bullet or tab - render those instantly
      if (content.startsWith('• ') || content.startsWith('\t• ')) {
        const prefix = content.startsWith('\t• ') ? '\t• ' : '• ';
        const restContent = content.slice(prefix.length);
        const typedRest = restContent.slice(0, Math.max(0, currentCharIndex - prefix.length));
        return prefix + typedRest;
      }
      return content.slice(0, currentCharIndex);
    }
    return '';
  };

  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none">
      {/* Terminal text overlay */}
      <div className="p-4 text-blue-300 text-sm leading-relaxed opacity-30">
        <div className="font-mono">
          {/* All lines with fixed height */}
          {TERMINAL_LINES.map((line, lineIdx) => (
            <div key={lineIdx} className="flex items-center min-h-[1.5rem]">
              {lineIdx < renderedLines.length ? (
                // Completed line
                renderedLines[lineIdx].map((obj, objIdx) => (
                  <pre key={objIdx}>
                    {obj.type === 'text' || obj.type === 'instant' ? obj.content : renderIcon(obj.icon)}
                  </pre>
                ))
              ) : lineIdx === currentLineIndex ? (
                // Currently typing line
                <>
                  {currentLineObjects.map((obj, objIdx) => (
                    <pre key={objIdx}>
                      {obj.type === 'text' || obj.type === 'instant' ? obj.content : renderIcon(obj.icon)}
                    </pre>
                  ))}
                  <pre>{getCurrentPartialText()}</pre>
                  <span className="animate-pulse">█</span>
                </>
              ) : (
                // Future line - render as empty space
                <pre>&nbsp;</pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}