import { useEffect, useState } from 'preact/hooks';

// Animation configuration constants
const LOOP_ANIMATION = true;
const TYPING_SPEED = 50; // Base typing speed in milliseconds (lower = faster)

// Data structure for terminal lines
type TerminalObject =
  | { type: 'text', content: string }
  | { type: 'icon', icon: 'timer' };

type TerminalLine = TerminalObject[];

const TERMINAL_LINES: TerminalLine[] = [
  [{ type: 'text', content: '• #meditate' }],
  [{ type: 'text', content: '\t• ' }, { type: 'icon', icon: 'timer' }, { type: 'text', content: '10 minutes' }],
  [{ type: 'text', content: '• #exercise' }],
  [{ type: 'text', content: '• Mow the cat' }],
  [{ type: 'text', content: '• Feed the lawn' }],
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
      case 'timer':
        return (
          <span className="pl-1">

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

    if (currentObject.type === 'icon') {
      // Add icon immediately and move to next object
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
      return currentObject.content.slice(0, currentCharIndex);
    }
    return '';
  };

  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none">
      {/* Terminal text overlay */}
      <div className="p-4 text-blue-300 text-sm leading-relaxed opacity-30">
        <div className="font-mono">
          {/* Rendered complete lines */}
          {renderedLines.map((line, lineIdx) => (
            <div key={lineIdx} className="flex items-center">
              {line.map((obj, objIdx) => (
                <pre key={objIdx}>
                  {obj.type === 'text' ? obj.content : renderIcon(obj.icon)}
                </pre>
              ))}
            </div>
          ))}

          {/* Current line being typed */}
          {currentLineIndex < TERMINAL_LINES.length && (
            <div className="flex items-center">
              {currentLineObjects.map((obj, objIdx) => (
                <pre key={objIdx}>
                  {obj.type === 'text' ? obj.content : renderIcon(obj.icon)}
                </pre>
              ))}
              <span>{getCurrentPartialText()}</span>
              <span className="animate-pulse">█</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}