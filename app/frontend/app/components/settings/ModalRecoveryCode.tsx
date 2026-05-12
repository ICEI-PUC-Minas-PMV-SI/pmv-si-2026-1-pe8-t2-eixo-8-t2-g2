import { Modal, Button, Typography, Space, Row, Col, message } from 'antd';

const { Title, Text } = Typography;

type ModalRecoveryCodesProps = {
  isOpened: boolean;
  recoveryCodes: string[];
  onClose: () => void;
};

function formatRecoveryCode(code: string) {
  const sanitized = code.replace(/[^a-zA-Z0-9]/g, '');

  return `${sanitized.slice(0, 4)}-${sanitized.slice(4, 8)}`;
}

export function ModalRecoveryCode({
  isOpened,
  recoveryCodes,
  onClose,
}: ModalRecoveryCodesProps) {
  const formattedCodes = recoveryCodes.map(formatRecoveryCode);

  const firstColumn = formattedCodes.slice(0, 4);
  const secondColumn = formattedCodes.slice(4, 8);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedCodes.join('\n'));

      message.success('Códigos copiados para a área de transferência');
    } catch {
      message.error('Não foi possível copiar os códigos');
    }
  };

  const handleDownload = () => {
    const content = [
      'Códigos de recuperação - 2FA',
      '',
      'Guarde estes códigos em um local seguro.',
      'Cada código pode ser usado apenas uma vez.',
      '',
      ...formattedCodes,
    ].join('\n');

    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = 'recovery-codes-isabella-caster.txt';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <Modal open={isOpened} onCancel={onClose} footer={null} centered>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Title level={4}>Códigos de recuperação</Title>

          <Text>
            Salve estes códigos em um lugar seguro.
            <br />
            Você não poderá visualizá-los novamente.
          </Text>
        </div>

        <div
          style={{
            background: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            padding: 20,
          }}
        >
          <Row gutter={24} style={{ textAlign: 'center' }}>
            <Col span={12}>
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                {firstColumn.map((code) => (
                  <div
                    key={code}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: 1,
                    }}
                  >
                    {code}
                  </div>
                ))}
              </Space>
            </Col>

            <Col span={12}>
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                {secondColumn.map((code) => (
                  <div
                    key={code}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: 1,
                    }}
                  >
                    {code}
                  </div>
                ))}
              </Space>
            </Col>
          </Row>
        </div>

        <Space
          style={{
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Button onClick={handleCopy}>Copiar</Button>

            <Button onClick={handleDownload}>Baixar .txt</Button>
          </Space>

          <Button type="primary" onClick={onClose}>
            Entendi
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
