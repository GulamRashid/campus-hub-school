import type { SVGProps } from 'react';

const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 2L1 9L12 16L23 9L12 2ZM5 10.5V16.5L12 20.5L19 16.5V10.5L12 14L5 10.5Z" />
  </svg>
);

export default LogoIcon;
