import { useRef, useEffect } from 'react';

/**
 * Custom hook for auto-scrolling a container to the bottom when content changes.
 * 
 * @param dependencies - Array of dependencies that trigger auto-scroll (e.g., messages, isTyping)
 * @param behavior - Scroll behavior ('smooth' | 'auto' | 'instant')
 * @param enabled - Whether auto-scroll is enabled (default: true)
 * @returns ref - Ref to attach to the scrollable container
 */
export function useAutoScroll<T extends HTMLElement = HTMLDivElement>(
  dependencies: React.DependencyList = [],
  behavior: ScrollBehavior = 'smooth',
  enabled: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    
    // Check if we're already at or near the bottom
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    
    // Only auto-scroll if user is near the bottom (prevents interrupting manual scrolling)
    if (isNearBottom) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior
      });
    }
  }, dependencies);

  // Manual scroll to bottom function
  const scrollToBottom = (forceBehavior?: ScrollBehavior) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: forceBehavior || behavior
      });
    }
  };

  // Check if user is at bottom
  const isAtBottom = () => {
    if (!ref.current) return true;
    const element = ref.current;
    return element.scrollHeight - element.scrollTop - element.clientHeight < 10;
  };

  return {
    ref,
    scrollToBottom,
    isAtBottom
  };
}

export default useAutoScroll;
