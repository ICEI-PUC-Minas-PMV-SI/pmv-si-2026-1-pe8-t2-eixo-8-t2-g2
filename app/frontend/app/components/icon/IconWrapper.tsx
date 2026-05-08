import Icon from '@ant-design/icons';
import type { IconProps } from '~/@types/icon';

export function createIcon(Component: React.FC) {
  return (props: IconProps) => <Icon component={Component} {...props} />;
}
