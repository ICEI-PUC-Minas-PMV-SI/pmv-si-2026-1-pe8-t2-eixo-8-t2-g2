import { Grid } from 'antd';
const { useBreakpoint: useAntBreakpoint } = Grid;

/** Retorna true quando a tela está ABAIXO do breakpoint informado */
export function useBreakpoint(bp: 'sm' | 'md' | 'lg' | 'xl') {
  const screens = useAntBreakpoint();
  return !screens[bp];
}
