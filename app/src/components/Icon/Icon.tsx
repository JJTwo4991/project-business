import styles from './Icon.module.css';

interface IconProps {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}

export function Icon({ src, alt = '', size = 32, className }: IconProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`${styles.icon} ${className ?? ''}`}
      draggable={false}
      loading="lazy"
    />
  );
}
