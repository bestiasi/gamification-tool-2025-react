import { useEffect, useRef } from 'react';
import styles from './DepartmentPage.module.css';

interface Decoration {
  leftImage: string;
  rightImage: string;
  durationSeconds: number;
  delaySeconds: number;
  topPercent: number;
  interactiveTopPercent: number | null;
}

const decorations: Decoration[] = [
  {
    leftImage: 'steastanga.png', rightImage: 'steadreapta.png',
    durationSeconds: 4.5, delaySeconds: 0,
    topPercent: 7, interactiveTopPercent: 5,
  },
  {
    leftImage: 'confetiistanga.png', rightImage: 'confetiidreapta.png',
    durationSeconds: 5.2, delaySeconds: 1.8,
    topPercent: 13, interactiveTopPercent: 12,
  },
  {
    leftImage: 'steastanga.png', rightImage: 'steadreapta.png',
    durationSeconds: 4.8, delaySeconds: 0.9,
    topPercent: 19, interactiveTopPercent: 19,
  },
  {
    leftImage: 'confetiimarestanga.png', rightImage: 'confetiimaredreapta.png',
    durationSeconds: 5.5, delaySeconds: 2.4,
    topPercent: 25, interactiveTopPercent: 26,
  },
  {
    leftImage: 'confetiisimplu.png', rightImage: 'confetiisimplu.png',
    durationSeconds: 4.2, delaySeconds: 1.2,
    topPercent: 31, interactiveTopPercent: 33,
  },
  {
    leftImage: 'steastanga.png', rightImage: 'steadreapta.png',
    durationSeconds: 5.1, delaySeconds: 3.1,
    topPercent: 36, interactiveTopPercent: 40,
  },
  {
    leftImage: 'confetiistanga.png', rightImage: 'confetiidreapta.png',
    durationSeconds: 4.7, delaySeconds: 0.6,
    topPercent: 42, interactiveTopPercent: 47,
  },
  {
    leftImage: 'steastanga.png', rightImage: 'steadreapta.png',
    durationSeconds: 5.3, delaySeconds: 2.2,
    topPercent: 48, interactiveTopPercent: 54,
  },
  {
    leftImage: 'confetiimarestanga.png', rightImage: 'confetiimaredreapta.png',
    durationSeconds: 4.9, delaySeconds: 1.5,
    topPercent: 54, interactiveTopPercent: 61,
  },
  {
    leftImage: 'confetiisimplu.png', rightImage: 'confetiisimplu.png',
    durationSeconds: 4.4, delaySeconds: 2.8,
    topPercent: 60, interactiveTopPercent: 68,
  },
  {
    leftImage: 'steastanga.png', rightImage: 'steadreapta.png',
    durationSeconds: 5, delaySeconds: 0.3,
    topPercent: 66, interactiveTopPercent: 75,
  },
  {
    leftImage: 'confetiistanga.png', rightImage: 'confetiidreapta.png',
    durationSeconds: 4.3, delaySeconds: 2.6,
    topPercent: 72, interactiveTopPercent: 82,
  },
  {
    leftImage: 'steastanga.png', rightImage: 'steadreapta.png',
    durationSeconds: 5.4, delaySeconds: 1.1,
    topPercent: 78, interactiveTopPercent: 89,
  },
  {
    leftImage: 'confetiimarestanga.png', rightImage: 'confetiimaredreapta.png',
    durationSeconds: 4.8, delaySeconds: 2,
    topPercent: 84, interactiveTopPercent: 96,
  },
  {
    leftImage: 'steadreapta.png', rightImage: 'confetiidreapta.png',
    durationSeconds: 5.4, delaySeconds: 1.1,
    topPercent: 90, interactiveTopPercent: null,
  },
  {
    leftImage: 'confetiistanga.png', rightImage: 'steadreapta.png',
    durationSeconds: 4.8, delaySeconds: 2,
    topPercent: 96, interactiveTopPercent: null,
  },
];

export default function DepartmentDecorations({ interactive }: { interactive: boolean }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = container.current?.querySelectorAll<HTMLDivElement>('[data-decoration]');
    if (!elements) return;
    let frame: number | undefined;
    let mouseX = 0;
    let mouseY = 0;

    const update = () => {
      frame = undefined;
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const deltaX = mouseX - rect.left - rect.width / 2;
        const deltaY = mouseY - rect.top - rect.height / 2;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > 0 && distance < 300) {
          const force = (300 - distance) / 300;
          element.style.transform = `translate(${-deltaX / distance * force * 40}px, ${-deltaY / distance * force * 40}px) rotate(${force * 15 * Math.sign(deltaX)}deg) scale(${1 + force * 0.3})`;
        } else {
          element.style.transform = '';
        }
      });
    };
    const move = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (frame === undefined) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [interactive]);

  return (
    <div ref={container} className={styles.decorations} aria-hidden="true">
      {(['left', 'right'] as const).flatMap(side =>
        decorations.map((decoration, index) => {
          const topPercent = interactive ? decoration.interactiveTopPercent : decoration.topPercent;
          if (topPercent === null) return null;
          const image = side === 'left' ? decoration.leftImage : decoration.rightImage;
          return (
            <div
              key={`${side}-${index}`}
              data-decoration
              className={styles.decorationAnchor}
              style={{ top: `${topPercent}%`, [side]: interactive ? '2.5%' : '3%' }}
            >
              <img
                className={image.startsWith('stea') ? styles.star : styles.confetti}
                src={`/icons/${image}`}
                alt=""
                style={{ animationDuration: `${decoration.durationSeconds}s`, animationDelay: `${decoration.delaySeconds}s` }}
              />
            </div>
          );
        }),
      )}
    </div>
  );
}
