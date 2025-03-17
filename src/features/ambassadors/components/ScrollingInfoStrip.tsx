
import React, { useEffect, useRef } from "react";

const items = [
  "Mental Health Support",
  "Therapy Sessions",
  "Mindfulness Exercises",
  "Mood Tracking",
  "Self-Care Resources",
  "Stress Management",
  "Community Support",
  "Professional Guidance",
];

const ScrollingInfoStrip = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const scrollWidth = containerRef.current.scrollWidth;
    const clientWidth = containerRef.current.clientWidth;
    
    // Only start animation if content is wider than container
    if (scrollWidth > clientWidth) {
      containerRef.current.style.setProperty('--scroll-width', `-${scrollWidth}px`);
    }
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Blue gradient strip */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-500 py-4 overflow-hidden">
        <div 
          ref={containerRef}
          className="flex whitespace-nowrap animate-marquee"
          style={{
            animationDuration: '30s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center mx-8">
                <div className="w-8 h-0.5 bg-white/70 mr-4"></div>
                <span className="text-white font-medium">{item}</span>
              </div>
            </React.Fragment>
          ))}
          
          {/* Duplicate items for seamless loop */}
          {items.map((item, index) => (
            <React.Fragment key={`dup-${index}`}>
              <div className="flex items-center mx-8">
                <div className="w-8 h-0.5 bg-white/70 mr-4"></div>
                <span className="text-white font-medium">{item}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Dotted lines with softer appearance */}
      <div className="w-full h-6 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-evenly">
          <div className="w-full h-0.5 bg-repeat-x" 
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='2' viewBox='0 0 6 2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23D1D5DB' fill-opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: "6px 2px"
            }}
          ></div>
          <div className="w-full h-0.5 bg-repeat-x" 
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='2' viewBox='0 0 6 2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23D1D5DB' fill-opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: "6px 2px"
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ScrollingInfoStrip;
