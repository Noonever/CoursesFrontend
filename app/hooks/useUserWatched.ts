import { useEffect, useRef, useState } from 'react';

function useUserWatched<T extends Element>(): [React.RefObject<T>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null, // observing for viewport
        rootMargin: '0px',
        threshold: 1.0, // fully within the viewport
      }
    );

    const currentElement = elementRef.current;

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {

      if (currentElement) {
        setIsVisible(false);
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return [elementRef, isVisible];
}

export default useUserWatched;