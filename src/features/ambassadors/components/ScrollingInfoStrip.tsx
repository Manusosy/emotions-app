
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ScrollingInfoStripProps {
  className?: string;
  items: Array<{
    id: string | number;
    content: React.ReactNode;
  }>;
  speed?: number;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  gap?: number;
}

const ScrollingInfoStrip: React.FC<ScrollingInfoStripProps> = ({
  className,
  items,
  speed = 30, // pixels per second
  pauseOnHover = true,
  direction = 'left',
  gap = 20,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  // Update measurements on resize
  useEffect(() => {
    const updateWidths = () => {
      const container = document.querySelector('.scrolling-container');
      const content = document.querySelector('.scrolling-content');
      
      if (container && content) {
        setContainerWidth(container.clientWidth);
        setContentWidth(content.scrollWidth);
      }
    };

    // Initial measurement
    updateWidths();
    
    // Update on resize
    window.addEventListener('resize', updateWidths);
    
    return () => {
      window.removeEventListener('resize', updateWidths);
    };
  }, [items]);

  // Calculate the CSS animation duration based on content width and speed
  const calculateDuration = () => {
    if (contentWidth === 0) return 0;
    // Duration is distance (px) / speed (px/s) = time (s)
    return contentWidth / speed;
  };

  const duration = calculateDuration();
  const isPaused = pauseOnHover && isHovering;
  const directionMultiplier = direction === 'left' ? 1 : -1;

  // Animation style
  const animationStyle = {
    animationDuration: `${duration}s`,
    animationDirection: direction === 'left' ? 'normal' : 'reverse',
    animationPlayState: isPaused ? 'paused' : 'running',
    gap: `${gap}px`,
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden whitespace-nowrap bg-neutral-100 py-3',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="scrolling-container relative w-full">
        <div
          className="scrolling-content inline-flex animate-marquee"
          style={animationStyle}
        >
          {items.map((item) => (
            <div key={item.id} className="mx-4 flex items-center whitespace-nowrap">
              {item.content}
            </div>
          ))}
        </div>
        
        {/* Duplicate content for seamless looping */}
        <div
          className="scrolling-content inline-flex animate-marquee"
          style={{
            ...animationStyle,
            animationDelay: `${duration / 2}s`
          }}
        >
          {items.map((item) => (
            <div key={`duplicate-${item.id}`} className="mx-4 flex items-center whitespace-nowrap">
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollingInfoStrip;
