import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import Link, { type LinkProps } from 'next/link';

type ButtonProps = Partial<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>>

export type BtnOrLinkProps = ButtonProps & Partial<LinkProps>;

export const ButtonOrLink: React.FC<BtnOrLinkProps> = (props) => {
  
  return (
    <>
      {
        props.href
          ? <Link {...props as LinkProps}></Link>
          : <button {...props as ButtonProps}></button>
      }
    </>
  )
}
