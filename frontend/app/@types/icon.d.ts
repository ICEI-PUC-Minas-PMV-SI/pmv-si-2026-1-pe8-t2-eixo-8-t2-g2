import Icon from '@ant-design/icons';
import type { GetProps } from 'antd';

type CustomIconComponentProps = GetProps<typeof Icon>;
export type IconProps = Partial<CustomIconComponentProps>;
