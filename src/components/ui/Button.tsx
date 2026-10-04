import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'cta' | 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

function classes(variant: Variant, size: Size, block: boolean, extra?: string) {
  return [styles.btn, styles[variant], styles[size], block ? styles.block : '', extra ?? '']
    .filter(Boolean)
    .join(' ');
}

function Content({ loading, iconLeft, iconRight, children }: CommonProps) {
  return (
    <>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : iconLeft}
      {children && <span>{children}</span>}
      {!loading && iconRight}
    </>
  );
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Button variants:
 * - `cta`       orange — the ONE main action on a screen (Book Now, Pay)
 * - `primary`   green  — positive/brand actions
 * - `secondary` outline
 * - `ghost`     text-only
 * - `danger`    red    — cancel / delete
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  iconLeft,
  iconRight,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes(variant, size, block, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Content loading={loading} iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Content>
    </button>
  );
}

export type ButtonLinkProps = CommonProps & LinkProps;

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  block = false,
  iconLeft,
  iconRight,
  children,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classes(variant, size, block, className)} {...rest}>
      <Content iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Content>
    </Link>
  );
}
