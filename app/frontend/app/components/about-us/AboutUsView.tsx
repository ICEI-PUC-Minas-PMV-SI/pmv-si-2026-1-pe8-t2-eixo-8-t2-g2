import { useQuery } from '@tanstack/react-query';
import { Col, Flex, Row, Typography } from 'antd';
import AboutController from '~/controllers/AboutController';
import { useBreakpoint } from '~/hooks/useBreakpoint';

export function AboutUsView() {
  const { data: about } = useQuery({
    queryKey: ['about-page-info'],
    queryFn: () => AboutController.find(),
    staleTime: 1000 * 60 * 60,
  });

  const isMobile = useBreakpoint('md');
  const sectionStyle = isMobile ? {} : { padding: 56 };
  return (
    <section id="sobre" style={{ background: '#f5f3f1' }}>
      <Flex vertical gap={96}>
        {/* ── Hero ── */}
        <section style={{ overflow: 'hidden', background: '#f1efec', ...sectionStyle }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Row align="middle">
              {/* Texto */}
              <Col xs={24} lg={12}>
                <Flex
                  vertical
                  gap={24}
                  style={{ padding: isMobile ? '36px' : '56px 48px' }}
                >
                  {about?.subtitle && (
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          background: 'rgba(224,109,91,0.1)',
                          color: '#C05A48',
                          borderRadius: 20,
                          padding: '3px 12px',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {about.subtitle}
                      </span>
                    </div>
                  )}

                  <Typography.Title
                    level={1}
                    style={{
                      margin: 0,
                      fontSize: 42,
                      lineHeight: 1.15,
                      fontWeight: 700,
                      color: '#2d2d2d',
                    }}
                  >
                    {about?.title ?? 'Quem somos'}
                  </Typography.Title>

                  <Typography.Paragraph
                    style={{ margin: 0, fontSize: 16, lineHeight: 2, color: '#555' }}
                  >
                    {about?.main}
                  </Typography.Paragraph>

                  {about?.complementary && (
                    <Typography.Paragraph
                      style={{ margin: 0, fontSize: 16, lineHeight: 2, color: '#777' }}
                    >
                      {about.complementary}
                    </Typography.Paragraph>
                  )}
                </Flex>
              </Col>
              <Col xs={24} lg={12}>
                <Flex
                  vertical
                  style={{
                    height: '100%',
                    padding: '0 12px',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minHeight: 250,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {about?.imageUrl ? (
                      <img
                        src={about.imageUrl}
                        alt="Imagem de destaque"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: 12,
                        }}
                      />
                    ) : (
                      <Flex
                        justify="center"
                        align="center"
                        style={{
                          height: '100%',
                          background: '#f5f3f1',
                        }}
                      >
                        <Typography.Text type="secondary">
                          Imagem de destaque
                        </Typography.Text>
                      </Flex>
                    )}
                  </div>

                  {!!about?.items?.length && (
                    <div
                      style={{
                        padding: 8,
                      }}
                    >
                      <Typography.Title
                        level={5}
                        style={{
                          marginBottom: 16,
                          color: '#C05A48',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        Nossos diferenciais
                      </Typography.Title>

                      <ul
                        style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {about?.items.map((item) => (
                          <li
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              marginBottom: 12,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                marginTop: 8,
                                borderRadius: '50%',
                                background: '#E06D5B',
                                flexShrink: 0,
                              }}
                            />
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Flex>
              </Col>
            </Row>
          </div>
        </section>
      </Flex>
    </section>
  );
}
