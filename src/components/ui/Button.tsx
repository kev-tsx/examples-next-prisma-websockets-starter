import { cva, type VariantProps } from 'class-variance-authority';
import { type BtnOrLinkProps, ButtonOrLink } from './ButtonOrLink';

const btnStyles = cva(
  'flex items-center justify-center px-4 py-2 rounded font-medium focus:outline-none',
  {
    variants: {
      color: {
        primary: 'bg-brand-500 text-white',
        /* eslint-disable */
        secondary: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
        /* eslint-enable */
        danger: 'bg-red-500 text-white focus:ring-red-500',
      },
      fullWidth: {
        true: 'w-full',
        false: 'max-w-[10%]',
        // false: 'w-[10%]'
      },
    },
    defaultVariants: {
      color: 'primary',
      fullWidth: false,
    },
  },
);

type Props = VariantProps<typeof btnStyles> & BtnOrLinkProps;

export const Button: React.FC<Props> = ({ color, fullWidth, ...props }) => (
  <ButtonOrLink className={btnStyles({ color, fullWidth })} {...props} />
);
