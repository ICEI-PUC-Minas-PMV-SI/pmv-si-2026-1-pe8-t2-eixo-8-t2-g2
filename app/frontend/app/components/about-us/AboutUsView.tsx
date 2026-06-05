import { useQuery } from '@tanstack/react-query';
import { Col, Flex, Row, Typography } from 'antd';
import AboutController from '~/controllers/AboutController';

export function AboutUsView() {
  const { data: about } = useQuery({
    queryKey: ['about-page-info'],
    queryFn: () => AboutController.find(),
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div style={{ background: '#f5f3f1' }}>
      <Flex vertical gap={96}>
        {/* ── Hero ── */}
        <section style={{ overflow: 'hidden', background: '#f1efec' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Row align="middle">
              {/* Texto */}
              <Col xs={24} lg={12}>
                <Flex vertical gap={24} style={{ padding: '56px 48px' }}>
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

              {/* Imagem */}
              {/* <Col xs={24} lg={12}>
                <div
                  style={{
                    minHeight: 520,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
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
                        padding: 12,
                        borderRadius: 24,
                      }}
                    />
                  ) : (
                    <Typography.Text type="secondary">Imagem de destaque</Typography.Text>
                  )}
                </div>
              </Col> */}
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
                      minHeight: 380,
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

        {/* ── Diferenciais ── */}
        {/* {!!about?.items?.length && (
          <section>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
              <Flex vertical gap={48} align="center">
                <Typography.Title
                  level={2}
                  style={{
                    margin: 0,
                    fontSize: 30,
                    color: '#2d2d2d',
                    textAlign: 'center',
                  }}
                >
                  Diferenciais
                </Typography.Title>

                <Row
                  gutter={[24, 24]}
                  style={{ width: '100%', justifyContent: 'space-evenly' }}
                >
                  {[...about.items]
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((item) => (
                      <Col xs={24} sm={12} md={12} lg={6} key={item.id}>
                        <Card
                          variant="borderless"
                          style={{
                            height: '100%',
                            borderRadius: 20,
                            background: '#faf8f6',
                            boxShadow: 'none',
                          }}
                          styles={{ body: { padding: '36px 24px' } }}
                        >
                          <Flex vertical align="center" gap={20}>
                            <Flex
                              align="center"
                              justify="center"
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'rgba(224,109,91,0.1)',
                              }}
                            >
                              <CheckCircleOutlined
                                style={{ color: '#E06D5B', fontSize: 24 }}
                              />
                            </Flex>

                            <Typography.Text
                              style={{
                                textAlign: 'center',
                                lineHeight: 1.7,
                                fontSize: 14,
                                color: '#444',
                              }}
                            >
                              {item.text}
                            </Typography.Text>
                          </Flex>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </Flex>
            </div>
          </section>
        )} */}
      </Flex>
    </div>
  );
}
