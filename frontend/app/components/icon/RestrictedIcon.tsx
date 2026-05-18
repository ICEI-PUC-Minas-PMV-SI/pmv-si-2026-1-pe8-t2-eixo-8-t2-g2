type ComponentProps = {
  children: React.ReactNode;
  active?: boolean;
};

export function RestrictedIcon({ children, active }: ComponentProps) {
  return (
    <div className="icon-wrapper">
      {children}
      {active && <div className="slash" />}
    </div>
  );
}
