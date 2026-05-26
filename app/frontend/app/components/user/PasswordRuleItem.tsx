import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Flex, Typography } from 'antd';

type Props = {
  valid: boolean;
  text: string;
};

export function PasswordRuleItem({ valid, text }: Props) {
  return (
    <Flex align="center" gap={4}>
      {valid ? (
        <CheckCircleFilled style={{ color: '#52c41a', padding: 4 }} />
      ) : (
        <CloseCircleFilled style={{ color: '#ff4d4f', padding: 4 }} />
      )}

      <Typography.Text type={valid ? undefined : 'secondary'}>{text}</Typography.Text>
    </Flex>
  );
}
