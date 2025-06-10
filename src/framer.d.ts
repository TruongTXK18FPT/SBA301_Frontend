import { HTMLMotionProps } from 'framer-motion';

declare module 'framer-motion' {
  export interface Motion {
    div: React.ForwardRefExoticComponent<HTMLMotionProps<"div">>;
    article: React.ForwardRefExoticComponent<HTMLMotionProps<"article">>;
  }
} 