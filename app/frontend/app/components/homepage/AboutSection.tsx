import { Col, Flex, Grid, Row, Tag, Typography } from "antd";
import type { AboutInfo } from "~/@types/about";
import {CheckCircleOutlined} from '@ant-design/icons';

export function AboutSection({ about }: { about: AboutInfo }) {
  const screens = Grid.useBreakpoint();
  return (
    <section
      id="sobre"
      style={{
        padding: screens.md ? '72px 24px' : '48px 20px',
        background: '#FDFAF9',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Row gutter={[48, 40]} align="middle">
          <Col xs={24} md={12}>
            <Tag
              style={{
                background: 'rgba(224,109,91,0.1)',
                color: '#C05A48',
                border: 'none',
                borderRadius: 20,
                padding: '3px 12px',
                fontSize: 12,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              {about.subtitle}
            </Tag>
            <Typography.Title
              level={2}
              style={{
                fontSize: screens.md ? 36 : 26,
                fontWeight: 700,
                color: '#1A1A1A',
                marginBottom: 16,
              }}
            >
              {about.title}
            </Typography.Title>
            <Typography.Paragraph
              style={{ color: '#555', fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}
            >
              {about.main}
            </Typography.Paragraph>
            <Typography.Paragraph
              style={{ color: '#777', fontSize: 14, lineHeight: 1.8 }}
            >
              {about.complementary}
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '28px 32px',
                border: '1.5px solid #F0E8E5',
              }}
            >
              {[...about.items]
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((item) => (
                  <Flex
                    key={item.id}
                    gap={14}
                    align="flex-start"
                    style={{ marginBottom: 18 }}
                  >
                    <CheckCircleOutlined
                      style={{
                        color: '#E06D5B',
                        fontSize: 18,
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <Typography.Text style={{ fontSize: 15, color: '#333' }}>
                      {item.text}
                    </Typography.Text>
                  </Flex>
                ))}
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
