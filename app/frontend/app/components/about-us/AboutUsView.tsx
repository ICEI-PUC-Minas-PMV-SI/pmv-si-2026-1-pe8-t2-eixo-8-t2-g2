import { Button, Card, Col, Flex, Image, Row, Typography } from 'antd';

import { useQuery } from '@tanstack/react-query';

import AboutController from '~/controllers/AboutController';
import NumberUtil from '~/utils/NumberUtil';

const { Title, Paragraph, Text } = Typography;

export function AboutUsView() {
  const { data: about } = useQuery({
    queryKey: ['about-page-info'],
    queryFn: () => AboutController.find(),
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div
      style={{
        background: '#f5f3f1',
        paddingBottom: '80px',
      }}
    >
      <div
        style={{
          margin: '0 auto',
        }}
      >
        <Flex vertical gap={96}>
          {/* HERO */}
          <section
            style={{
              overflow: 'hidden',
              background: '#f1efec',
            }}
          >
            <Row align="middle">
              <Col xs={24} lg={12}>
                <Flex
                  vertical
                  gap={24}
                  style={{
                    padding: '56px 48px',
                  }}
                >
                  <Title
                    level={1}
                    style={{
                      margin: 0,
                      fontSize: 42,
                      lineHeight: 1.15,
                      fontWeight: 700,
                      color: '#2d2d2d',
                    }}
                  >
                    {about?.subtitle ?? 'Olá! Eu sou a Isabella!'}
                  </Title>

                  <Paragraph
                    style={{
                      margin: 0,
                      fontSize: 16,
                      lineHeight: 2,
                      color: '#555',
                    }}
                  >
                    {about?.main}
                  </Paragraph>

                  {about?.complementary && (
                    <Paragraph
                      style={{
                        margin: 0,
                        fontSize: 16,
                        lineHeight: 2,
                        color: '#555',
                      }}
                    >
                      {about.complementary}
                    </Paragraph>
                  )}
                </Flex>
              </Col>

              <Col xs={24} lg={12}>
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    minHeight: 520,
                    background: '#e7e1db',
                  }}
                >
                  <Text type="secondary">Imagem de destaque</Text>
                </Flex>
              </Col>
            </Row>
          </section>

          {/* DIFERENCIAIS */}
          {!!about?.items?.length && (
            <section>
              <Flex vertical gap={48} align="center">
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    fontSize: 30,
                    color: '#2d2d2d',
                    textAlign: 'center',
                  }}
                >
                  Nossos diferenciais
                </Title>

                <Row
                  gutter={[24, 24]}
                  style={{
                    width: '100%',
                    justifyContent: 'space-evenly',
                  }}
                >
                  {about.items.map((item) => (
                    <Col xs={24} sm={12} md={12} lg={6} key={item.id}>
                      <Card
                        variant={'borderless'}
                        style={{
                          height: '100%',
                          borderRadius: 20,
                          borderColor: '#e7e3de',
                          background: '#faf8f6',
                          boxShadow: 'none',
                        }}
                        styles={{
                          body: {
                            padding: '36px 24px',
                          },
                        }}
                      >
                        <Flex vertical align="center" gap={20}>
                          {item.icon ? (
                            <Image
                              src={item.icon}
                              preview={false}
                              width={72}
                              height={72}
                              style={{
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <Flex
                              align="center"
                              justify="center"
                              style={{
                                width: 72,
                                height: 72,
                                borderRadius: 16,
                                background: '#f1efec',
                              }}
                            />
                          )}

                          <Text
                            style={{
                              textAlign: 'center',
                              lineHeight: 1.7,
                              fontSize: 14,
                              color: '#444',
                            }}
                          >
                            {item.text}
                          </Text>
                        </Flex>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Flex>
            </section>
          )}

          {/* PRODUTOS */}
          <section>
            <Flex vertical gap={48} align="center">
              <Title
                level={2}
                style={{
                  margin: 0,
                  fontSize: 30,
                  color: '#2d2d2d',
                  textAlign: 'center',
                }}
              >
                Alguns dos nossos itens mais vendidos
              </Title>

              <Row
                gutter={[24, 24]}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-evenly',
                }}
              >
                {about?.topProducts?.map((product) => (
                  <Col
                    xs={24}
                    sm={12}
                    md={12}
                    lg={6}
                    key={product.id}
                    style={{ maxWidth: 300 }}
                  >
                    <Card
                      hoverable
                      style={{
                        borderRadius: 20,
                        overflow: 'hidden',
                        borderColor: '#e7e3de',
                        background: '#faf8f6',
                        boxShadow: 'none',
                      }}
                      styles={{
                        body: {
                          padding: 18,
                        },
                      }}
                      cover={
                        <div
                          style={{
                            height: 220,
                            background: '#f1efec',
                          }}
                        />
                      }
                    >
                      <Flex vertical gap={16}>
                        <Flex vertical gap={4}>
                          <Text
                            strong
                            style={{
                              fontSize: 15,
                              color: '#2d2d2d',
                            }}
                          >
                            {product.name}
                          </Text>

                          {/* <Text
                            type="secondary"
                            style={{
                              fontSize: 13,
                            }}
                          >
                            {product.category}
                          </Text> */}
                        </Flex>

                        <Text
                          strong
                          style={{
                            color: '#d35b52',
                            fontSize: 16,
                            textAlign: 'right',
                          }}
                        >
                          {NumberUtil.currency(product.price)}
                        </Text>

                        <Button
                          block
                          ghost
                          danger
                          style={{
                            height: 38,
                            borderRadius: 10,
                            fontSize: 13,
                          }}
                        >
                          Ver detalhes
                        </Button>
                      </Flex>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Flex>
          </section>
        </Flex>
      </div>
    </div>
  );
}
