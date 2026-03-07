import { useRef, useEffect, useState } from 'react';
import styles from './PageTransition.module.css';

interface Props {
  pageKey: string;
  direction: 'forward' | 'back' | 'none';
  children: React.ReactNode;
}

export function PageTransition({ pageKey, direction, children }: Props) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animClass, setAnimClass] = useState(styles.fadeIn);
  const prevKeyRef = useRef(pageKey);

  useEffect(() => {
    if (prevKeyRef.current === pageKey) return;

    if (direction === 'forward') {
      setAnimClass(styles.slideInRight);
    } else if (direction === 'back') {
      setAnimClass(styles.slideInLeft);
    } else {
      setAnimClass(styles.fadeIn);
    }

    setDisplayChildren(children);
    prevKeyRef.current = pageKey;
  }, [pageKey, direction, children]);

  // Also update children when they change within the same page
  useEffect(() => {
    if (prevKeyRef.current === pageKey) {
      setDisplayChildren(children);
    }
  }, [children, pageKey]);

  return (
    <div className={styles.container}>
      <div key={pageKey} className={`${styles.page} ${animClass}`}>
        {displayChildren}
      </div>
    </div>
  );
}
