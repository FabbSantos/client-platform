import React from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  type?: 'default' | 'tween' | 'spring' | 'fade';
}

const containerVariants: Record<string, Variants> = {
  default: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    },
    exit: { 
      opacity: 0,
      y: 20,
      transition: { duration: 0.3 } 
    }
  },
  tween: {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "tween",
        duration: 0.7,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      transition: { duration: 0.5 } 
    }
  },
  spring: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { 
      scale: 0.95,
      opacity: 0,
      transition: { duration: 0.3 } 
    }
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.4 } 
    }
  }
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function AnimatedContainer({ 
  children, 
  className = "", 
  delay = 0, 
  type = "default" 
}: AnimatedContainerProps) {
  const variants = containerVariants[type] || containerVariants.default;
  
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay }}
    >
      {React.Children.map(children, (child, i) => {
        if (React.isValidElement(child)) {
          return (
            <motion.div
              key={i}
              variants={childVariants}
              transition={{ delay: delay + i * 0.1 }}
            >
              {child}
            </motion.div>
          );
        }
        return child;
      })}
    </motion.div>
  );
}

export const AnimatePresenceContainer = motion.div;

export const AnimatedItem = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedButton = ({ children, className = "", onClick, disabled = false }: { 
  children: React.ReactNode, 
  className?: string,
  onClick?: () => void,
  disabled?: boolean
}) => {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};
