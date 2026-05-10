type Props = React.HTMLAttributes<HTMLSpanElement>;

export function CreativeWord({ className = "", ...rest }: Props) {
  return (
    <span className={`hero-creative ${className}`.trim()} {...rest}>
      creative
    </span>
  );
}
