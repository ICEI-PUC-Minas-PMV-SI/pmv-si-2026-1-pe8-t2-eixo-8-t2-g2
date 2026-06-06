# Desenvolvimento de Alternativas de Soluções de SI
## Conexão com o Plano de IC e Planejamento da Solução

### Processos que serão resolvidos pela aplicação

O documento mapeia seis processos principais que apresentam limitações operacionais no empreendimento de confeitaria artesanal Doce & Cia:
1. Captação e atendimento ao cliente
Hoje ocorre via *WhatsApp* de forma manual e não estruturada. O processo de coleta de dados do pedido (tipo de produto, quantidade, sabor, personalização, data de entrega) depende inteiramente de conversas individuais, gerando risco de perda de informação e limitando o atendimento simultâneo de múltiplos clientes.

2. Registro e gestão de pedidos
Pedidos são anotados em blocos de notas digitais (descartados após conclusão), conversas de WhatsApp e planilhas pontuais. Não há histórico consolidado, controle de status nem rastreabilidade do ciclo de vida do pedido (confirmação → produção → entrega).

3. Confirmação de pagamento e financeiro
O pagamento de 50% antecipado é gerenciado manualmente, sem integração com o registro do pedido. Não há relatórios financeiros estruturados nem controle de saldos pendentes por pedido.

4. Planejamento da produção e agenda
A agenda de produção é feita por anotações manuais, sem visão consolidada dos prazos. Isso gera risco de conflito de datas, sobrecarga produtiva e atrasos, especialmente em períodos de alta demanda (festas de fim de ano, eventos).

5. Gestão do catálogo de produtos no site
O site atual é completamente estático — qualquer alteração de produto exige modificação no código-fonte. Não há *backend*, banco de dados nem sistema de carrinho integrado ao fluxo de pedido.

6. Acompanhamento gerencial e tomada de decisão
Não existem métricas de produção, relatórios de vendas ou indicadores de desempenho. A empreendedora não tem como avaliar capacidade produtiva, sazonalidade ou fidelização de clientes com base em dados concretos.

### Funcionalidades iniciais a serem desenvolvidas

Com base nos requisitos funcionais e nas histórias de usuário documentadas no TCC, as funcionalidades foram organizadas por módulo e prioridade:
- Autenticação e controle de acesso:
  - Cadastro de usuário (cliente e administrador/empreendedora).
  - *Login* com *e-mail* e senha.
  - Recuperação de senha.
  - Controle de perfis: cliente acessa apenas seus pedidos; empreendedora acessa tudo.

- Catálogo de produtos (administrado pela empreendedora):
  - Cadastro, edição e inativação de produtos.
  - Organização por categorias (biscoitos, doces, tortas, *brunch*, etc.).
  - *Upload* de imagem, descrição e preço base por produto.
  - Listagem pública com busca e filtro por categoria.

- Carrinho e realização de pedido (pelo cliente):
  - Adição e remoção de itens do carrinho.
  - Cálculo automático do valor total.
  - Campo para descrição (sabor, recheio, decoração).
  - Escolha de data de entrega/retirada.
  - Finalização do pedido com registro automático de data e hora.

- Gestão de pedidos (pela empreendedora):
  - Cadastro manual de pedidos recebidos fora do site (ex: *WhatsApp*).
  - Aceite ou rejeição de pedidos recebidos.
  - Atualização de status: Aguardando confirmação → Confirmado → Em produção → Pronto → Entregue.
  - Visualização de todos os pedidos com filtros por data e status.
  - Histórico completo de pedidos por cliente.

- Gestão de pagamento:
  - Registro do valor total, valor pago antecipadamente (50%) e saldo restante.
  - Registro da forma de pagamento (Pix, cartão, transferência).
  - Confirmação de pagamento antes do envio do pedido.

- Agenda de produção:
  - Visualização dos pedidos em formato de calendário.
  - Alerta de conflito de datas (sobrecarga de produção).
  - Indicação de prazo mínimo de antecedência por tipo de pedido.

- Notificações ao cliente (pelo *e-mail* e/ou plataforma):
  - Confirmação do pedido.
  - Atualização de status.
  - Aviso de pedido pronto para retirada/entrega.

- Relatórios e *dashboard* (para a empreendedora):
  - Volume de pedidos por período (dia, semana, mês).
  - Receita por período.
  - Produtos mais e menos vendidos.
  - Clientes recorrentes vs. novos clientes.
  - Percentual de atrasos e entregas bem sucedidas.

Figura 3 - Quadro-Resumo
<img width="948" height="364" alt="image" src="https://github.com/user-attachments/assets/dbba9cba-83c3-4d4c-8362-825e1c2ff014" />
Fonte: Elaborado pelos autores (2026).

## Levantamento de Requisitos e Modelagem Inicial
### Histórias de usuários
- Cliente:
  - Como cliente, quero acessar o sistema através de *login* para visualizar meu histórico de pedidos e informações pessoais.
  - Como cliente, quero visualizar os produtos disponíveis para escolher o que comprar.
  - Como cliente, quero realizar um pedido para encomendar produtos da confeitaria.
  - Como cliente, quero editar meus dados para mantê-los atualizados.
  - Como cliente, quero acompanhar o *status* do meu pedido para saber quando estará pronto.

#### Empreendedora:
- Pedidos
  - Como empreendedora, quero cadastrar pedidos manualmente para registrar pedidos feitos fora do site.
  - Como empreendedora, quero avaliar e definir o *status* inicial dos pedidos (aceito ou rejeitado) para controlar quais serão produzidos.
  - Como empreendedora, quero visualizar todos os pedidos para gerenciar a produção.
  - Como empreendedora, quero atualizar o *status* dos pedidos (Aceito, em produção, saiu para entrega, entregue, etc.) para organizar o fluxo de trabalho.

- Produtos
  - Como empreendedora, quero cadastrar produtos para disponibilizá-los no site.
  - Como empreendedora, quero editar produtos para atualizar preço ou descrição.
  - Como empreendedora, quero inativar produtos que não estão mais disponíveis naquele momento.

- Clientes
  - Como empreendedora, quero visualizar clientes cadastrados para manter contato.
- Como empreendedora, quero editar clientes cadastrados para manter os dados atualizados.

- Sistema
  - Como empreendedora, quero acessar o sistema através de *login* para gerenciar clientes, pedidos e produtos.
  - Como empreendedora, quero visualizar relatórios de pedidos/vendas para acompanhar o faturamento.
  - Como empreendedora, quero visualizar relatórios de tempo médio de entrega para melhorar a satisfação do cliente.

## Requisitos funcionais e não funcionais

Com base nas necessidades identificadas ao longo do projeto, foram definidos os requisitos funcionais e não funcionais da solução, visando garantir o suporte adequado à gestão de pedidos e ao planejamento da produção no contexto do microempreendimento analisado.

Quadro 1 - Requisitos funcionais do sistema
| CATEGORIA         | REQUISITOS FUNCIONAIS |
|  :----:   | ----------- |
| Cadastro e gestão de usuários | O sistema deve permitir o cadastro de usuários com nome, *e-mail*, telefone e senha. |
| Cadastro e gestão de usuários | O sistema deve permitir edição dos dados cadastrais. |
| Cadastro e gestão de usuários | O sistema deve permitir exclusão de contas. |
| Autenticação e controle de acesso | O sistema deve permitir *login* por meio de *e-mail* e senha. |
| Autenticação e controle de acesso | O sistema deve permitir recuperação de senha. |
| Autenticação e controle de acesso | O sistema deve manter a sessão do usuário ativa durante o uso. |
| Cadastro e gestão de produtos | O sistema deve permitir ao administrador gerenciar os produtos e suas categorias. |
| Listagem, busca e navegação | O sistema deve exibir os produtos disponíveis. |
| Listagem, busca e navegação | O sistema deve permitir busca por nome ou categoria. |
| Carrinho de compras | O sistema deve permitir adicionar produtos ao carrinho. |
| Carrinho de compras | O sistema deve permitir remover produtos do carrinho. |
| Carrinho de compras | O sistema deve calcular automaticamente o valor total do pedido. |
| Gestão de pedidos | O sistema deve permitir a finalização de pedidos. |
| Gestão de pedidos | O sistema deve registrar automaticamente a data e horário do pedido. |
| Gestão de pedidos | O sistema deve permitir o acompanhamento do *status* do pedido, incluindo: aguardando confirmação, confirmado, em produção, pronto para entrega e entregue. |
| Pagamento | O sistema deve permitir o registro de pagamento antecipado. |
| Pagamento | O sistema deve confirmar o pagamento antes da validação do pedido. |

Fonte: Elaborado pelos autores (2026).

Quadro 2 - Requisitos não funcionais do sistema
| CATEGORIA         | REQUISITOS FUNCIONAIS |
|  :----:   | ----------- |
| Disponibilidade | O sistema deve estar disponível para acesso via *internet*. |
| Disponibilidade | O sistema deve apresentar disponibilidade mínima de 95% do tempo. |
| Desempenho | O sistema deve apresentar tempo de resposta inferior a 2 segundos para operações comuns (exibição de produtos, navegação e *login*). |
| Escalabilidade | O sistema deve suportar aumento no volume de pedidos sem degradação significativa de desempenho. |
| Segurança | O sistema deve utilizar protocolo HTTPS para comunicação segura. |
| Segurança | O sistema deve garantir a integridade, confidencialidade e consistência dos dados. |
| Usabilidade | O sistema deve permitir que um usuário iniciante seja capaz de realizar um pedido completo em até 3 minutos, sem necessidade de suporte externo. |
| Responsividade | O sistema deve ser responsivo para dispositivos com largura de tela entre 320px e 1920px, incluindo *smartphones, tablets e desktops*. |
| Compatibilidade | O sistema deve ser compatível com os navegadores: *Google Chrome; Microsoft Edge e Mozilla Firefox*. |
| Manutenibilidade | O sistema deve possuir arquitetura que facilite manutenção, correções e evolução. |
| Confiabilidade | O sistema deve garantir a execução correta das operações, evitando perda ou inconsistência de dados. |

Fonte: Elaborado pelos autores (2026).

### Ferramentas e plataformas a serem utilizadas

A definição das tecnologias, ferramentas e plataformas adotadas no desenvolvimento deste sistema foi realizada com base em critérios como curva de aprendizagem, tempo disponível para desenvolvimento, complexidade da aplicação e custo de implementação, assegurando a viabilidade técnica e financeira do projeto.

Sob a perspectiva técnica, será utilizado o *Visual Studio Code* como ambiente de desenvolvimento integrado, devido à sua natureza gratuita, ampla compatibilidade com linguagens e diversas extensões que ampliam sua capacidade de suporte ao time. Tal escolha contribui para a produtividade da equipe e redução de barreiras técnicas durante o desenvolvimento.

O *backend* da aplicação será implementado com *Node.js*, permitindo a utilização de uma única linguagem (*TypeScript*) em toda a aplicação. Essa padronização reduz a complexidade do desenvolvimento e facilita a manutenção. No *frontend*, será empregada a biblioteca React com *TypeScript*, possibilitando a construção de interfaces reativas, modulares e com maior segurança de tipos.

Para a camada de persistência, será utilizado a plataforma Supabase, que fornece um banco de dados *PostgreSQL* gerenciado, além de serviços adicionais como armazenamento de arquivos. O uso do Supabase *Storage* para armazenamento das imagens dos produtos mostra-se tecnicamente adequado por oferecer integração nativa com o banco de dados e API, simplificando a arquitetura do sistema e reduzindo a necessidade de serviços externos.

Como ferramenta de mapeamento objeto-relacional, será adotado o Prisma, que facilita a comunicação entre a aplicação e o banco de dados por meio de uma abstração de alto nível. Essa escolha reduz a complexidade na escrita de consultas SQL e contribui para maior segurança e produtividade no desenvolvimento.

A hospedagem da aplicação será realizada na Vercel, que oferece integração contínua com repositórios Git e suporte otimizado para aplicações *frontend* desenvolvidas com *React*. Sua utilização permite implantações rápidas e automatizadas, sendo adequada ao escopo do projeto. Além disso, a cliente, por meio do auxílio da irmã, já utiliza esta plataforma como hospedagem do site atual, reduzindo a complexidade de futuras atualizações.

Adicionalmente, o sistema contará com integração com serviços da *Google*, incluindo o *Google Calendar* para gerenciamento de agendamentos e serviços de SMTP (como *Gmail*) para envio de *e-mails* automatizados. Essas integrações são amplamente documentadas e possuem APIs consolidadas, o que favorece sua implementação.

Para a construção da interface do usuário, será utilizada a biblioteca *Ant Design*, que disponibiliza um conjunto de componentes prontos e padronizados. Essa abordagem reduz o esforço necessário para desenvolvimento de interfaces e garante consistência visual ao sistema.

No que se refere à viabilidade financeira, o projeto apresenta custos iniciais extremamente reduzidos, uma vez que a maior parte das tecnologias adotadas possui versões gratuitas ou é de código aberto:
- *Visual Studio Code*: gratuito;
- *Node.js* e *React*: gratuitos e *open source*;
- Prisma: gratuito em sua versão base;
- *Supabase* (incluindo banco de dados e *storage*): plano gratuito adequado para aplicações de pequeno porte;
- *Vercel:* plano gratuito com recursos suficientes para hospedagem do sistema;
- *Ant Design*: gratuito e *open source*;
- APIs do *Google*: gratuitas dentro de limites de uso;

A adoção do *Supabase Storage* elimina a necessidade de contratação de serviços adicionais para armazenamento de imagens, centralizando a infraestrutura e reduzindo custos operacionais. Além disso, o modelo de cobrança escalável dessas plataformas permite que eventuais custos futuros sejam proporcionais ao crescimento do sistema.

Em termos de benefícios, a solução proposta contribui para a automação e organização dos processos da confeitaria, promovendo maior controle sobre produtos e agendamentos, redução de erros operacionais e melhoria na comunicação com clientes por meio de notificações automatizadas.

Dessa forma, conclui-se que o sistema apresenta alta viabilidade técnica, em função da escolha de tecnologias modernas, bem documentadas e compatíveis entre si, e alta viabilidade financeira, devido ao baixo custo de implementação aliado ao potencial de impacto positivo na eficiência operacional do negócio.

### Diagrama de Casos de Uso
Figura 4 - Diagrama de Casos de Uso
<img width="585" height="573" alt="image" src="https://github.com/user-attachments/assets/e57ed2b0-5d18-43d4-baa9-90ee1e2dc884" />
Fonte: Elaborado pelos autores (2026).

### Modelo Relacional
Figura 5 - Modelo Relacional
<img width="761" height="564" alt="image" src="https://github.com/user-attachments/assets/8abe1dcb-509c-4c2a-badb-4e98b537d0ae" />
Fonte: Elaborado pelos autores (2026).

## Protótipo e Planejamento da Arquitetura

Figura 6 - Tela de *login*
<img width="662" height="370" alt="image" src="https://github.com/user-attachments/assets/7188d44d-8396-4240-a697-1961a6e4d96b" />

Figura 7 - Tela de cadastro de usuário
<img width="659" height="369" alt="image" src="https://github.com/user-attachments/assets/1bb24f02-96ee-46bc-91fc-5ad4d08718d8" />

Figura 8 - Tela de recuperação de senha
<img width="660" height="371" alt="image" src="https://github.com/user-attachments/assets/a0f70d88-74eb-4bf9-8121-f09f4ce13512" />

Figura 9 - Tela de confirmação da recuperação de senha
<img width="661" height="371" alt="image" src="https://github.com/user-attachments/assets/4218e4df-6714-4599-a3a4-06cab108ea86" />

Figura 10 - Pop-up de *logout*
<img width="689" height="130" alt="image" src="https://github.com/user-attachments/assets/ad9e42f1-ef33-4e88-803c-2238db0234bd" />

Figura 11 - *Footer* 
<img width="555" height="110" alt="image" src="https://github.com/user-attachments/assets/d60465eb-df23-4fba-922c-7d0e73b48314" />

### Telas acessíveis apenas para o usuário administrador

Figura 12 - Tela de exibição dos *dashboards*
<img width="662" height="498" alt="image" src="https://github.com/user-attachments/assets/3b3c1c42-4cde-4ae2-ac70-bf93d3107c01" />

Figura 13 - Tela de gerenciamento dos pedidos em lista
<img width="662" height="497" alt="image" src="https://github.com/user-attachments/assets/b28a205e-dcb7-427e-8cb0-8756f905fa06" />

Figura 14 - Tela de gerenciamento dos pedidos com o pedido detalhado
<img width="666" height="493" alt="image" src="https://github.com/user-attachments/assets/fd55d22c-7584-4b77-a5eb-47af0932a077" />

Figura 15 - Tela de gerenciamento dos pedidos por calendário
<img width="663" height="497" alt="image" src="https://github.com/user-attachments/assets/66df9f0a-54a9-4915-8486-fa11e695b21c" />

Figura 16 - Tela de solicitação de um novo pedido
<img width="662" height="495" alt="image" src="https://github.com/user-attachments/assets/5f6a2598-5bb4-4943-91c4-88497885201b" />

Figura 17 - Tela de gerenciamento dos produtos
<img width="662" height="490" alt="image" src="https://github.com/user-attachments/assets/b95c1c9f-86a5-4e90-b9c4-175b78d0850e" />

Figura 18 - Tela de cadastro de um novo produto
<img width="658" height="492" alt="image" src="https://github.com/user-attachments/assets/4167cec9-31a0-4dfe-afa3-855890b9e7f1" />

Figura 19 - Tela de gerenciamento das categorias de produtos
<img width="665" height="492" alt="image" src="https://github.com/user-attachments/assets/0fea5dae-0841-4a2e-8314-f86cdb455a75" />

Figura 20 - Tela de cadastro de uma nova categoria de produtos
<img width="662" height="492" alt="image" src="https://github.com/user-attachments/assets/4a81581c-60cd-4b1a-b271-912c0975a24d" />

Figura 21 - Tela de gerenciamento das características dos produtos
<img width="666" height="498" alt="image" src="https://github.com/user-attachments/assets/0e03b8ba-9479-4bab-86c4-4a2b2f486144" />

Figura 22 - Tela de cadastro de uma nova característica de produtos
<img width="661" height="491" alt="image" src="https://github.com/user-attachments/assets/4d278323-e4ac-4e99-8ce7-f822d5ce295e" />

Figura 23 - Tela de gerenciamento das informações sobre o negócio
<img width="529" height="752" alt="image" src="https://github.com/user-attachments/assets/1f55ef87-06b5-47f0-84c6-639f6a48b206" />

Figura 24 - Tela de gerenciamento das configurações do site
<img width="585" height="434" alt="image" src="https://github.com/user-attachments/assets/d0c82b79-d3d2-470e-b3aa-719a3b579914" />

### Telas acessíveis para os usuários clientes

Figura 25 - Tela de acesso aos produtos do catálogo para usuários não logados
<img width="479" height="677" alt="image" src="https://github.com/user-attachments/assets/cdc30bb6-c5f6-42ac-ae0b-f182ddcbceba" />

Figura 26 - Tela de detalhamento dos produtos do catálogo para usuários não logados
<img width="479" height="675" alt="image" src="https://github.com/user-attachments/assets/a5078dae-ccc3-45a8-b114-c28d03f33347" />

Figura 27 - Tela de acesso aos produtos do catálogo para usuários logados
<img width="479" height="673" alt="image" src="https://github.com/user-attachments/assets/c891280f-4681-4983-be7a-c8346304cd3f" />

Figura 28 - Tela de detalhamento dos produtos do catálogo para usuários logados
<img width="477" height="677" alt="image" src="https://github.com/user-attachments/assets/23150d4a-027a-4f72-a5a2-4344436ac6e8" />

Figura 29 - Tela de detalhamento dos produtos adicionados ao carrinho de compras
<img width="477" height="674" alt="image" src="https://github.com/user-attachments/assets/3bb4451e-23c5-4ce5-8299-763dfb784fd2" />

Figura 30 - Tela de histórico de pedidos
<img width="484" height="195" alt="image" src="https://github.com/user-attachments/assets/8b5d3539-4e69-4cc5-bbe2-1637d382135e" />

Figura 31 - Tela de histórico de pedidos com o detalhamento do pedido selecionado
<img width="489" height="184" alt="image" src="https://github.com/user-attachments/assets/e3a95e7a-7ad2-4fa7-9119-70adf91ebb0e" />

Figura 32 - Tela de visualização das informações sobre o negócio
<img width="480" height="633" alt="image" src="https://github.com/user-attachments/assets/280f92c1-09d6-42dd-9e2b-771366400a5c" />

Figura 33 - Tela de gerenciamento das configurações do site
<img width="477" height="362" alt="image" src="https://github.com/user-attachments/assets/cbf96cc7-d48b-4ae3-a79b-76d62b65bb53" />

Fontes: Elaborados pelos autores (2026).

Com base nas necessidades do negócio, identificadas através do levantamento dos requisitos funcionais e não funcionais, foram definidos dois perfis principais de acesso: administrador e cliente. O administrador possui acesso às funcionalidades de gerenciamento interno da plataforma, enquanto os clientes possuem acesso ao catálogo de produtos, histórico de pedidos e informações do negócio.

Durante o processo de modelagem inicial, foram elaborados *wireframes* e protótipos navegáveis no *Figma,* permitindo visualizar previamente a estrutura do sistema, a disposição dos elementos visuais e o fluxo de navegação entre as telas. Essa etapa foi essencial para validar a experiência do usuário, organizar a arquitetura das informações e reduzir possíveis inconsistências antes da implementação do sistema.

As primeiras telas desenvolvidas correspondem ao fluxo de autenticação dos usuários, incluindo a tela de *login*, cadastro de usuário, recuperação de senha, confirmação da recuperação de senha e *pop-up* de *logout*. Essas interfaces foram projetadas com foco em simplicidade e acessibilidade, permitindo que os usuários realizem o acesso à plataforma de forma intuitiva e segura.

Também foi criada a estrutura padrão de navegação do sistema, incluindo o rodapé (*footer*), responsável por centralizar informações institucionais e facilitar o acesso às principais funcionalidades da aplicação.

Para o perfil administrador, foram desenvolvidas telas voltadas ao gerenciamento completo da confeitaria. Entre elas estão a tela de *dashboards*, responsável pela visualização estratégica de indicadores do negócio; o gerenciamento de pedidos em lista e por calendário; o detalhamento dos pedidos; a solicitação de novos pedidos; além das telas de gerenciamento de produtos, categorias e características dos produtos.

O sistema administrativo também contempla funcionalidades de cadastro, edição e exclusão de informações, presentes nas telas de cadastro de novos produtos, categorias e características. Além disso, foram modeladas telas específicas para gerenciamento das informações do negócio e configurações gerais do site, permitindo maior controle administrativo da plataforma.

Para os usuários clientes, foram desenvolvidas telas voltadas à navegação e compra de produtos. O catálogo foi projetado para funcionar tanto para usuários não autenticados quanto para usuários logados, oferecendo visualização dos produtos disponíveis, detalhamento dos itens e acesso ao carrinho de compras. As telas de detalhamento dos produtos apresentam informações completas, imagens e opções relacionadas ao pedido.

Também foram desenvolvidas telas de histórico de pedidos e detalhamento dos pedidos realizados, permitindo que os clientes acompanhem suas compras e consultem informações anteriores. Além disso, foi criada uma tela de visualização das informações sobre o negócio, aproximando o cliente da identidade da confeitaria.

No planejamento da arquitetura do sistema, foi definida uma estrutura baseada na separação entre *front-end*, *back-end* e banco de dados. O fluxo de navegação foi organizado para garantir facilidade de uso, com menus intuitivos, controle de permissões por perfil de usuário e integração entre as funcionalidades administrativas e comerciais.

O armazenamento dos dados foi planejado para contemplar informações de usuários, produtos, categorias, pedidos, configurações e dados institucionais do negócio. O acesso às informações ocorre por meio de APIs responsáveis pela comunicação entre a interface e o banco de dados, garantindo segurança, organização e escalabilidade da aplicação.

Dessa forma, o processo de levantamento de requisitos, prototipação e planejamento arquitetural possibilitou estruturar uma solução alinhada às necessidades do negócio, oferecendo uma visão clara do funcionamento do sistema antes do início da implementação, além de contribuir para uma melhor experiência dos usuários e maior eficiência no desenvolvimento do projeto.

### Estrutura de navegação do sistema

A estrutura de navegação do sistema foi planejada com foco na organização, na simplicidade de uso e na separação de responsabilidades, considerando dois perfis principais de acesso: cliente e administrador. Essa divisão permite que cada tipo de usuário tenha acesso apenas às funcionalidades necessárias, garantindo maior clareza no uso e segurança nas operações.

Para o cliente, a navegação tem início na página inicial de produtos, que funciona como principal ponto de entrada do sistema. Nessa tela, os usuários podem visualizar os itens disponíveis, navegar por categorias e acessar os detalhes de cada produto. Usuários não autenticados possuem acesso apenas à visualização dos produtos, ao passo que usuários autenticados passam a ter acesso a funcionalidades adicionais, como o gerenciamento do carrinho de compras, o acompanhamento do *status* dos pedidos e o histórico de compras. O fluxo contempla ainda rotinas de cadastro de novos usuários e de redefinição de senha, possibilitando o controle completo do acesso à plataforma.

Para o administrador, a navegação compreende um conjunto mais amplo de funcionalidades, organizadas em módulos específicos. Dentre esses módulos, destacam-se o gerenciamento de produtos, categorias e pedidos, permitindo controle integral sobre o catálogo e o fluxo de vendas. Além disso, o sistema disponibiliza um painel de controle (*dashboard*) administrativo, que apresenta uma visão consolidada das operações, incluindo o acompanhamento de pedidos, prazos e *status* de produção.

O fluxo principal do sistema integra ambos os perfis: inicia-se com a navegação e a seleção de produtos pelo cliente, passando pela adição ao carrinho e pela finalização do pedido. Em seguida, o pedido torna-se disponível para o administrador, que pode acompanhá-lo, atualizá-lo e organizá-lo dentro do processo produtivo. Essa estrutura garante um fluxo contínuo de informações entre cliente e gestão, promovendo maior eficiência operacional e controle integrado das atividades do negócio.

### Gerenciamento de Dados

Do ponto de vista arquitetural, essas funcionalidades estão diretamente associadas às entidades do sistema. Os produtos exibidos na interface estão vinculados à entidade *Product*, organizados por meio de *Category* e enriquecidos com atributos específicos. Os pedidos realizados pelos usuários são representados pela entidade *Scheduler*, que centraliza informações como data, *status*, forma de pagamento e modalidade de entrega, enquanto os itens de cada pedido são armazenados na entidade *SchedulerItem*.

O controle de acesso e a diferenciação entre os perfis de cliente e administrador são realizados por meio da entidade *User*, a qual define níveis distintos de utilização do sistema. Essa separação contribui para a segurança e a integridade das operações, restringindo o acesso a funcionalidades sensíveis exclusivamente ao perfil administrativo.

A integração entre *frontend* e *backend* ocorre por meio de uma camada intermediária responsável pelo processamento das requisições, pela persistência dos dados e pela aplicação das regras de negócio. Dessa forma, as ações realizadas na interface — como a criação de pedidos, a atualização de *status* ou o cadastro de produtos — são refletidas diretamente no banco de dados, assegurando a consistência das informações em todo o sistema.

Essa arquitetura não apenas viabiliza o funcionamento adequado das operações atuais, como também favorece a escalabilidade do sistema, permitindo a futura incorporação de novas funcionalidades, como integração com meios de pagamento, automação de notificações e geração de relatórios gerenciais.

## Preparação do Desenvolvimento
Figura 26 - Plano de execução inicial
<img width="1103" height="501" alt="image" src="https://github.com/user-attachments/assets/f02c90a3-f6a4-4167-8a9d-cc589ce7b431" />
Fonte: Elaborado pelos autores (2026).

## Geração de *Dashboards* Internos

Foram desenvolvidos *dashboards* com o objetivo de transformar os dados operacionais da confeitaria em informações estratégicas, permitindo que a empresa respondesse às KIQs (*Key Intelligence Questions*) definidas no plano de Inteligência Competitiva. A solução possibilita acompanhar indicadores em tempo real, identificar padrões de consumo, prever demandas e apoiar decisões gerenciais com maior precisão.

Figura 27 - *Dashboard* da visão geral do negócio junto a demanda e o volume de vendas
<img width="1600" height="618" alt="image" src="https://github.com/user-attachments/assets/c8905e77-91a9-428a-b2bc-754a4db7edae" />

Figura 28 - *Dashboard* sobre os produtos, a produção e o faturamento no último semestre
<img width="1600" height="580" alt="image" src="https://github.com/user-attachments/assets/d3fe5ecb-6cd7-4c6e-a554-ae4cac7865c6" />

Figura 29 - *Dashboard* de controle de agenda e planejamento dos pedidos
<img width="1600" height="410" alt="image" src="https://github.com/user-attachments/assets/e633b624-69e5-4ae0-a07d-70d39b7086a2" />
Fontes: Elaborados pelos autores (2026).

Os indicadores presentes no *dashboard* permitem avaliar a evolução das vendas em comparação com períodos anteriores. Com indicadores que demonstram em comparativo aumentos ou reduções em pedidos e receita é possível avaliar o potencial de expansão das operações.

Outro ponto relevante presente nos *dashboards* é o controle do status dos pedidos, permitindo a análise rápida de índices críticos como taxas de cancelamentos elevadas. Essa análise responde à KIQ relacionada à eficiência operacional e satisfação do cliente, evidenciando se o fluxo produtivo está funcionando de maneira adequada.

Os gráficos de demanda e volume de pedidos permitem identificar tendências de crescimento mensal. Com estes gráficos torna-se possível identificar a sazonalidade e crescimento da procura pelos produtos. Essa informação responde à KIQ sobre o comportamento da demanda e auxilia a empresa no planejamento de estoque, compra de insumos e organização da produção em períodos de maior movimento.

A análise de produtos mais vendidos, fornece inteligência sobre quais produtos possuem maior aceitação pelo público, permitindo à empresa direcionar campanhas promocionais, aumentar investimentos nos itens mais rentáveis e revisar produtos com menor saída.

O *dashboard* de tempo médio de produção evidencia que bolos decorados e *naked cakes* possuem maior tempo de preparo, enquanto produtos como brigadeiros *gourmet* e bolo no pote demandam menos tempo operacional. Essa análise responde à KIQ relacionada à eficiência produtiva, permitindo identificar gargalos na produção e auxiliar no balanceamento das atividades da equipe.

O painel de agenda e planejamento apresenta as entregas do dia, horários e *status* dos pedidos, oferecendo uma visão clara da operação diária. Além disso, o gráfico de antecedência mínima por produto demonstra quais itens exigem maior prazo para encomenda. Bolos decorados e tortas apresentam necessidade de planejamento antecipado superior a 70 horas, enquanto produtos simples demandam menor antecedência. Essas informações ajudam na definição de políticas de pedidos e organização da capacidade produtiva.
Com base nas informações apresentadas no *dashboard*, a depender dos valores, algumas decisões estratégicas podem ser tomadas pela empresa:
- Intensificar campanhas promocionais dos produtos mais vendidos, aproveitando sua alta aceitação e rentabilidade;
- Criar estratégias para redução da taxa de cancelamento, como confirmação automática de pedidos e melhoria da comunicação com clientes;
- Ajustar o planejamento de estoque e produção conforme os períodos de maior demanda identificados nos dashboards;
- Otimizar o processo produtivo dos produtos com maior tempo de preparo, reduzindo gargalos e aumentando a capacidade operacional;
- Utilizar os dados de antecedência mínima para definir regras claras de encomenda e melhorar o controle logístico;
- Investir em ações voltadas aos métodos de pagamento mais utilizados, como Pix e cartão, visando facilitar a experiência do cliente;
- Monitorar continuamente os indicadores financeiros e operacionais para apoiar decisões rápidas e estratégicas.

Dessa forma, os *dashboards* demonstram sua importância como ferramenta de Inteligência Competitiva, pois permitem transformar dados em conhecimento estratégico, fornecendo suporte à tomada de decisão, melhoria operacional e crescimento sustentável da empresa.
