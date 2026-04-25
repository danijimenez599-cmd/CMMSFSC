import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/generateId';
import { useEffect, useState } from 'react';

interface MobilePanelTransitionProps {
  children: React.ReactNode;
  activePanel: string;
  panelKey: string;
  className?: string;
}

export const MobilePanelTransition: React.FC<MobilePanelTransitionProps> = ({ 
  children, 
  activePanel, 
  panelKey,
  className
}) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // On desktop, we don't want conditional rendering because multiple panels are visible
  if (isDesktop) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {activePanel === panelKey && (
        <motion.div
          key={panelKey}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn("flex flex-col h-full w-full", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
