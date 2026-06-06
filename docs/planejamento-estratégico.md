# PLANEJAMENTO ESTRATÉGICO DE TI
## PETI (Plano Estratégico de Tecnologia da Informação)
### Finalidade do PETI

O Plano Estratégico de Tecnologia da Informação (PETI) tem como finalidade orientar o uso da tecnologia no empreendimento da confeitaria Doce & Cia, buscando melhorar a organização dos processos, o controle das informações e o atendimento aos clientes.

Atualmente, grande parte das atividades do negócio é realizada manualmente, utilizando *WhatsApp,* anotações e planilhas simples. Embora esse modelo atenda à demanda atual, ele apresenta limitações relacionadas ao controle de pedidos, organização da agenda e acompanhamento das informações financeiras e operacionais.

Dessa forma, o PETI busca definir ações que contribuam para a implementação de soluções tecnológicas capazes de reduzir falhas operacionais, melhorar a gestão das informações e aumentar a eficiência do negócio, além de preparar a empresa para um possível crescimento futuro.

### Pontos fortes e limitações do sistema
**Pontos Fortes**

Durante o projeto, foram identificados pontos positivos relacionados ao negócio e à solução proposta.
Entre os principais pontos fortes, destacam-se:
- Atendimento personalizado e próximo dos clientes;
- Produção artesanal com possibilidade de personalização dos produtos;
- Presença digital por meio de redes sociais e *website;*
- Utilização de tecnologias modernas, como *React, TypeScript, Node.js e Supabase;*
- Possibilidade de centralização das informações em um único sistema;
- Geração de relatórios e indicadores para apoio à tomada de decisão.

Além disso, a solução proposta foi planejada considerando a realidade e as necessidades do empreendimento.

**Limitações identificadas**

Também foram identificadas limitações importantes nos processos atuais da empresa.

O site atual funciona apenas como catálogo de produtos, sem integração com banco de dados, controle de pedidos ou pagamentos. Além disso, o controle das informações ocorre de forma manual, utilizando principalmente conversas no *WhatsApp,* anotações e planilhas.

Também foram identificadas limitações importantes nos processos atuais da empresa.
Entre as principais limitações observadas, destacam-se: 
- Ausência de relatórios gerenciais;
- Dificuldade no controle da agenda de produção; 
- Falta de integração entre pedidos, pagamentos e produção; 
- Risco de perda de informações; 
- Dependência excessiva de processos manuais; 
- Limitação da capacidade produtiva por depender apenas da empreendedora. 

Esses fatores demonstram a necessidade de melhorias tecnológicas para aumentar a organização e eficiência do negócio. 

### Diretrizes estratégicas de TI

Abaixo são listadas algumas melhorias e novas integrações que podem agregar ao processo desenvolvido:

- Integração pagamento: Permitir que sejam feitos pagamentos (cartão e pix) dentro do próprio site e gerando atualização nos pedidos automaticamente.
- Integração com api de rotas/mapas da *google:* Esta integração possibilitaria por exemplo definir taxas de entrega baseado em distância, exibir mapa com regiões atendidas entre outros recursos.
- Registro de receitas, ingredientes e valores: Possibilitando cadastro de receitas, ingredientes e valores de cotação para cada ingrediente, o administrador poderia atualizar preços de todos os produtos após atualizar valores de ingredientes com percentuais de lucro.
- API *WhatsApp:* Com integração com Whatsapp possibilitaria criar o primeiro contato com o cliente, notificar sobre pedido saindo para entrega dentre outras atualizações.

### Objetivos Estratégicos de TI

Os objetivos estratégicos de TI foram definidos com base nas necessidades identificadas durante o desenvolvimento do projeto, considerando as limitações atuais do negócio e as melhorias esperadas com a implementação do sistema. 

**Curto prazo (0 a 6 meses)**

No curto prazo, os objetivos estão voltados para a organização inicial dos processos e estruturação do sistema.
- Implementar sistema de gestão de pedidos; 
- Criar banco de dados para armazenamento das informações; 
- Melhorar o controle da agenda de produção; 
- Automatizar o registro de pedidos; 
- Centralizar informações atualmente dispersas. 

**Médio prazo (6 a 12 meses)**

No médio prazo, o foco será melhorar o controle gerencial e automatizar parte das atividades operacionais. 
- Desenvolver relatórios e dashboards gerenciais; 
- Implementar notificações automáticas para clientes; 
- Melhorar o acompanhamento dos pedidos; 
- Organizar agenda em formato de calendário; 
- Estruturar histórico de clientes e pedidos. 

**Longo prazo (1 a 2 anos)**

No longo prazo, os objetivos estão relacionados ao crescimento sustentável do negócio e ao fortalecimento do uso estratégico da tecnologia.  
- Implementar estratégias de fidelização de clientes; 
- Integrar pagamentos *online;* 
- Melhorar o planejamento da capacidade produtiva; 
- Reduzir processos manuais; 
- Ampliar o uso de indicadores estratégicos para apoio à tomada de decisão. 

### Indicadores de acompanhamento

O sistema desenvolvido disponibiliza dashboards gerenciais com indicadores que auxiliam no acompanhamento das operações da confeitaria e no apoio à tomada de decisão.

- Quantidade de pedidos do dia
  - Permite acompanhar o volume diário de pedidos registrados no sistema e comparar com períodos anteriores.


- Pedidos criados e cancelados
  - Possibilita monitorar a entrada de novos pedidos e a quantidade de cancelamentos, auxiliando na identificação de tendências e possíveis problemas operacionais.
 

- Pedidos em andamento
  - Exibe a quantidade de pedidos que estão em processo de produção, permitindo melhor controle da carga de trabalho.

- Faturamento diário
  - Apresenta o valor total dos pedidos programados para o dia, fornecendo uma visão rápida do desempenho financeiro da operação.

- *Ticket* médio
  - Calcula o valor médio dos pedidos realizados, permitindo avaliar o comportamento de compra dos clientes e identificar oportunidades de aumento de receita.

- Evolução do faturamento
  - Disponibiliza o histórico de faturamento dos últimos meses, possibilitando a análise de crescimento, sazonalidade e desempenho do negócio ao longo do tempo.

- Distribuição dos pedidos por *status*
  - Permite acompanhar a proporção de pedidos pendentes, confirmados, em produção, concluídos e cancelados.

- Distribuição por modalidade de entrega
  - Exibe a participação de pedidos para retirada no local e entrega em domicílio, auxiliando no planejamento logístico.

- Distribuição por forma de pagamento
  - Apresenta os meios de pagamento mais utilizados pelos clientes, fornecendo informações úteis para decisões financeiras e operacionais.

- Produtos mais vendidos
  - Identifica os produtos com maior volume de vendas e participação percentual nas vendas totais, auxiliando no planejamento de produção e estoque.

- Alertas operacionais
  - Pedidos pendentes de confirmação próximos da data de entrega.
  - Pedidos sem confirmação há mais de dois dias.
  - Pedidos com prazo de entrega vencido.

- Programação de entregas do dia
  - Disponibiliza a relação dos pedidos previstos para entrega ou retirada no dia, contribuindo para a organização da produção.

Esses indicadores permitem acompanhar o desempenho operacional da confeitaria, reduzir falhas no gerenciamento de pedidos e fornecer informações consolidadas para apoio à tomada de decisão.

## Auditoria e Governança de TI
### Segurança e proteção de dados

O sistema de gestão de pedidos da confeitaria foi desenvolvido como um site, garantindo segurança e proteção dos dados dos usuários conforme os princípios da Lei Geral de Proteção de Dados Pessoais (LGPD). O sistema armazenará informações como nome, telefone e histórico de pedidos dos clientes, utilizando esses dados exclusivamente para gerenciamento de pedidos, atendimento e acompanhamento de entregas.

O acesso ao sistema é realizado por meio de login e senha, autenticação via e-mail e integração com conta *Google (Google Auth),* permitindo maior praticidade e segurança no acesso. Também há recuperação de senha por *e-mail* para auxiliar usuários em caso de perda de acesso.

O sistema conta com dois níveis de usuários: cliente e administradora. O cliente pode visualizar produtos, realizar pedidos, acompanhar entregas e consultar pedidos anteriores. Já a administradora tem acesso total às funcionalidades do sistema, incluindo cadastro e remoção de produtos, visualização de dados dos clientes, gerenciamento de pedidos, relatórios de vendas e controle de entregas. Dessa forma, o controle de acesso é fundamental para limitar permissões e proteger informações sensíveis.

Os dados serão armazenados em banco de dados *PostgreSQL,* com utilização de criptografia para proteção das informações pessoais e senhas dos usuários. Como os pagamentos serão realizados fora do sistema, não haverá armazenamento de dados bancários ou cartões de crédito, reduzindo riscos relacionados à segurança financeira.

### Práticas recomendadas de segurança e proteção das informações

Considerando o contexto do sistema de informação desenvolvido para a confeitaria artesanal, a adoção de práticas de segurança da informação torna-se fundamental para garantir a proteção dos dados do negócio, a continuidade operacional e a conformidade com as exigências legais relacionadas ao tratamento de informações digitais. Mesmo tratando-se de um microempreendimento, o sistema manipula dados sensíveis relacionados a clientes, pedidos, pagamentos e informações administrativas, o que exige cuidados específicos quanto ao armazenamento, acesso e preservação dessas informações.

Uma das principais práticas recomendadas consiste na utilização de senhas seguras e na realização de trocas periódicas de credenciais de acesso. O uso de senhas fortes reduz significativamente os riscos de acesso indevido ao sistema administrativo, ao banco de dados e às plataformas integradas utilizadas pela aplicação. Recomenda-se que as senhas possuam combinação de letras maiúsculas e minúsculas, números e caracteres especiais, além de comprimento mínimo adequado. Também é importante evitar o uso de informações pessoais facilmente identificáveis, como datas de nascimento ou nomes próprios. A troca periódica das senhas contribui para minimizar vulnerabilidades decorrentes de possíveis vazamentos ou compartilhamentos indevidos de credenciais.

Além disso, o sistema incentiva a adoção de boas práticas de autenticação, especialmente para o perfil administrador, responsável pelo gerenciamento dos pedidos, produtos, informações financeiras e dados dos clientes. Essa medida contribui para preservar a integridade das informações e restringir o acesso apenas aos usuários autorizados.

Outra prática essencial refere-se à realização de backups periódicos dos dados armazenados no sistema. Considerando que a solução proposta centraliza informações importantes do empreendimento — como pedidos, histórico de clientes, produtos cadastrados, agenda de produção e relatórios gerenciais —, a perda desses dados poderia comprometer significativamente o funcionamento do negócio. Dessa forma, recomenda-se a implementação de rotinas automáticas de *backup* do banco de dados e dos arquivos armazenados na aplicação, garantindo a possibilidade de recuperação em casos de falhas técnicas, exclusões acidentais ou incidentes de segurança.

Mesmo em situações onde parte das informações ainda seja mantida em planilhas complementares ou documentos administrativos externos ao sistema, é importante que esses arquivos também sejam incluídos em políticas de *backup* frequente. Essa prática contribui para a continuidade das operações e reduz riscos relacionados à indisponibilidade de informações críticas para o planejamento da produção e gestão dos pedidos.

Para o projeto desenvolvido, também é recomendada a utilização de ferramentas confiáveis e ambientes seguros para armazenamento de dados e documentos digitais. Plataformas como *Google Drive,OneDrive* e serviços integrados ao *Supabase* oferecem mecanismos de redundância, controle de acesso e recuperação de arquivos, sendo alternativas adequadas para pequenos negócios que necessitam de soluções acessíveis e seguras.

O uso dessas plataformas favorece o armazenamento centralizado das informações administrativas, documentos do sistema, imagens de produtos, relatórios e backups, reduzindo a dependência de dispositivos locais e minimizando riscos de perda física dos dados. Além disso, serviços de armazenamento em nuvem geralmente contam com recursos adicionais de segurança, como autenticação em múltiplos fatores, criptografia de dados e controle de permissões de acesso.

Essas práticas tornam-se ainda mais relevantes considerando que o sistema desenvolvido possui integração entre *frontend, backend* e banco de dados, além de funcionalidades administrativas acessíveis via *internet.* Nesse cenário, a proteção das informações não deve ser tratada apenas como requisito técnico, mas como elemento estratégico para garantir confiabilidade, continuidade operacional e proteção dos dados dos clientes.

Adicionalmente, tais medidas contribuem para a conformidade com a Lei Geral de Proteção de Dados (LGPD), uma vez que auxiliam na preservação da confidencialidade, integridade e disponibilidade das informações pessoais tratadas pelo sistema. Dessa forma, a adoção de boas práticas de segurança fortalece não apenas a infraestrutura tecnológica da aplicação, mas também a credibilidade e a profissionalização do empreendimento perante seus clientes.

### Continuidade operacional e controle de alterações

Visto que a solução proposta centraliza o gerenciamento de dados vitais para o empreendimento, tais como pedidos, histórico de clientes, cronograma produtivo e registros financeiros, torna-se indispensável a adoção de um plano de continuidade simplificado. Tal medida visa assegurar o pronto restabelecimento das atividades operacionais diante de eventuais falhas técnicas, corrupção de informações ou períodos de indisponibilidade da plataforma.

**Plano de contingência**

Na ocorrência de incidentes que resultem em perda de dados ou mau funcionamento sistêmico, orienta-se que o empreendimento execute as seguintes diretrizes fundamentais:
- Identificar se a anomalia reside no acesso (conectividade e credenciais) ou na integridade funcional do sistema;
- Instaurar o registro manual transitório das encomendas por meio de planilhas ou anotações físicas, até a plena normalização do serviço digital;
- Solicitar intervenção junto ao suporte técnico responsável pela sustentação da ferramenta;
- Proceder com a reconciliação entre os registros manuais e a base de dados informatizada após o retorno à operação.

**Rotina de *backup* semanal**

Propõe-se a efetivação de *backups* semanais das informações da plataforma, abrangendo inclusive a base de dados *PostgreSQL* mantida no *Supabase.* Tal procedimento pode ser automatizado pela própria infraestrutura de nuvem, provendo segurança suficiente para a restauração em casos críticos. Os repositórios de salvaguarda devem ser alocados em ambientes protegidos, como *Google Drive ou OneDrive,* sob gestão exclusiva da administradora.

**Registro simplificado de modificações**

Quaisquer intervenções estruturais realizadas na aplicação como a inclusão de novos produtos, revisão de regras comerciais ou ajustes de parametrização deverão ser brevemente documentadas em um artefato de controle. Este registro, preferencialmente em formato de planilha ou documento de texto, deve consignar a data da ocorrência, a natureza da modificação e o agente responsável, favorecendo a rastreabilidade e a rápida detecção de gargalos após atualizações sistêmicas.

### Responsabilidades

No contexto do projeto, a definição de responsabilidades relacionadas à manutenção e ao acesso administrativo é um elemento essencial para garantir a continuidade, a segurança e a evolução da solução após sua implementação.

Inicialmente, a responsabilidade pela manutenção do sistema será compartilhada entre dois agentes principais. Em primeiro lugar, a equipe de desenvolvimento responsável pelo projeto (composta pelos integrantes do trabalho acadêmico) terá a função de realizar a manutenção corretiva e evolutiva inicial do sistema, especialmente durante o período de implantação, testes e estabilização da aplicação. Essa atuação inclui correção de possíveis falhas, ajustes de funcionalidades e suporte técnico inicial.

Em segundo lugar, após a fase de entrega e estabilização, a responsabilidade operacional passa a ser da empreendedora, que atuará como usuária administradora principal do sistema. Nesse contexto, ela será responsável pela gestão cotidiana da plataforma, incluindo o cadastro e atualização de produtos, acompanhamento de pedidos, controle de agenda de produção e utilização dos relatórios gerenciais disponibilizados pela aplicação.

Quanto ao acesso administrativo, o sistema será estruturado com perfis de acesso distintos, sendo obrigatória a existência de pelo menos um perfil administrador. Assim, prevê-se a existência de um usuário com permissões administrativas, que pode definir outros perfis como administradores para auxiliá-lo na gestão:
- Administrador principal (dona do Doce & Cia): responsável pela operação integral do sistema no contexto do negócio, incluindo gestão de pedidos, produtos, clientes e configurações gerais da plataforma.
- Administrador secundário (caso definido): com acesso às funcionalidades técnicas do sistema, atuando em atividades de manutenção, correções, atualizações e suporte, sem interferência nas decisões operacionais do negócio.

Dessa forma, a adoção de múltiplos perfis administrativos garante maior segurança operacional, reduz riscos de perda de dados e assegura suporte técnico contínuo, ao mesmo tempo em que preserva a autonomia da empreendedora na gestão do empreendimento.

### Governança Simplificada

Para que o sistema seja utilizado de forma organizada, eficiente e padronizada dentro de uma empresa, um conjunto básico de práticas e regras foi criado.

***Tela de Login***

A tela de *login* é utilizada para permitir o acesso seguro ao sistema por meio de usuário e senha cadastrados. Este manual apresenta as funções básicas da tela e orienta como realizar o acesso corretamente.
Como fazer *login:*
- Abra o sistema;
- Na tela inicial, localize os campos de *login;*
- Informe seu *E-mail;*
- Informe sua senha;
- Clique no botão Entrar.

***Tela de Cadastro***

A tela de cadastro de usuário permite o registro de novos usuários no sistema. Por meio dela, são inseridas informações pessoais e de acesso necessárias para a criação de uma conta.
Como realizar o cadastro:
- Acesse a tela de cadastro do sistema;
- Preencha todos os campos obrigatórios;
- Informe um telefone válido;
- Informe um *e-mail* válido;
- Crie uma senha segura;
- Informe endereço completo;
- Clique no botão “Cadastrar”.

***Tela de Redefinir Senha***

A tela de recuperação de senha tem como finalidade:
- Auxiliar usuários que esqueceram a senha;
- Garantir a recuperação segura do acesso ao sistema;
- Permitir a criação de uma nova senha de forma rápida e segura.

Como recuperar a senha: 
- Acesse a tela de recuperação de senha;
- Informe o *e-mail* cadastrado;
- Clique no botão “Enviar”;
- Verifique sua caixa de entrada no *e-mail* informado;
- Abra a mensagem recebida;
- Clique no *link* de redefinição de senha;
- Cadastre uma nova senha;
- Confirme a nova senha e finalize o processo.

***Tela de Confirmação da Recuperação de Senha***

A tela de confirmação da recuperação de senha informa ao usuário que o processo de redefinição de senha foi realizado com sucesso e que as instruções de recuperação foram enviadas corretamente. 
Exibe uma mensagem informando o *status* da recuperação de senha:
*“O e-mail para redefinição de senha foi enviado com sucesso!”*

***Pop-up de logout***

O *pop-up* de *logout* é uma janela de confirmação exibida quando o usuário solicita sair do sistema. Sua função é evitar saídas acidentais e garantir maior segurança durante o uso da aplicação. 
O *pop-up* de *logout* tem como finalidade:
- Confirmar a intenção do usuário de sair do sistema;
- Evitar encerramentos acidentais da sessão;
- Garantir maior segurança das informações acessadas;
- Finalizar a sessão do usuário corretamente.

Exibe uma pergunta para confirmar a ação de saída:
*“Deseja realmente sair do sistema?”*

Caso o usuário selecione o botão “Sair”, o sistema encerra a sessão do usuário e realiza o *logout* do sistema. Se o usuário selecionar o botão “Cancelar”, o sistema fecha o *pop-up* e mantém o usuário conectado ao sistema.

***Footer***

O *footer* é a área localizada na parte inferior da interface do site. Ele reúne informações complementares, *links* importantes e dados institucionais para auxiliar o usuário durante a navegação.
Objetivo do *footer:*
- Facilitar o acesso a páginas importantes;
- Exibir contatos e suporte;
- Melhorar a navegação do usuário.

O *footer* disponibiliza também canais de comunicação para suporte ou atendimento:
- *E-mail;*
- Telefone;
- *Instagram;*
- Horário de funcionamento.

### Telas acessíveis apenas para o usuário administrador
***Tela de exibição dos dashboards***

A tela de exibição dos *dashboards* permite visualizar informações, gráficos, indicadores e dados importantes do sistema de forma organizada e dinâmica. Ela auxilia no acompanhamento de resultados, métricas e desempenho das operações. 
Visualizar informações:
- Acesse a tela de *dashboards;*
- Observe os indicadores e gráficos disponíveis;
- Analise os dados apresentados conforme a necessidade.

***Tela de gerenciamento dos pedidos em lista***

A tela de gerenciamento dos pedidos em lista tem como finalidade exibir os pedidos cadastrados, facilitar o controle e acompanhamento dos pedidos e auxiliar na organização operacional do sistema.
Como utilizar a tela:
- Visualizar Pedidos;
- Acesse a tela de pedidos;
- Consulte a lista exibida na tela;
- Role a página para visualizar outros pedidos, se necessário.

***Tela de gerenciamento dos pedidos com o pedido detalhado***

A tela de gerenciamento dos pedidos com pedido detalhado permite visualizar, acompanhar e administrar os pedidos cadastrados no sistema, além de acessar informações completas de cada solicitação realizada.
Como utilizar a tela:
- Visualizar Lista de Pedidos;
- Acesse a tela de pedidos;
- Consulte os pedidos exibidos;
- Utilize a rolagem para visualizar outros registros.

***Tela de gerenciamento dos pedidos por calendário***

A tela de gerenciamento dos pedidos por calendário permite visualizar e organizar os pedidos conforme datas específicas, facilitando o acompanhamento de agendamentos, entregas e prazos de forma prática e visual.
Visualizar pedidos no calendário:
- Acesse a tela  pedidos por calendário;
- Observe os pedidos distribuídos nas datas;
- Navegue entre os períodos utilizando os botões do calendário.

***Tela de solicitação de um novo pedido***

A tela de novo pedido permite cadastrar e registrar novos pedidos no sistema. Por meio dela, o usuário pode inserir informações do cliente, produtos ou serviços solicitados, formas de pagamento e demais dados necessários para o processamento do pedido.
Informações necessárias:
- Nome do cliente;
- Data e hora do pagamento;
- Estimativa de retirada/entrega;
- Meio de pagamento;
- Modalidade;
- Adicionar produto.

Clicando em “Salvar”, o sistema registra o pedido. Se selecionar o botão “Cancelar”, o cadastro do pedido é cancelado sem salvar as informações.

Como utilizar a tela:
- Acesse a tela Novo Pedido;
- Informe os dados do cliente;
- Adicione os produtos;
- Escolha a forma de pagamento;
- Informe a data do pagamento;
- Informe estimativa de retirada;
- Clique em “Salvar”.

***Tela de gerenciamento dos produto***

A tela de gerenciamento dos produtos permite cadastrar, visualizar, editar e controlar os produtos disponíveis no sistema. Ela auxilia na organização do catálogo, controle de estoque e atualização das informações dos itens.
A tela tem como finalidade:
- Cadastrar novos produtos;
- Editar informações de produtos existentes;
- Controlar estoque e disponibilidade;
- Organizar o catálogo de produtos;
- Facilitar consultas e pesquisas.

Os filtros são utilizados para organizar os produtos exibidos:
- Categoria;
- Faixa de preço;
- Características;
- Descrição;
- *Status* do produto;
- Ações.

O botão “Novo Produto” permite cadastrar um novo produto no sistema e o botão “Editar” é responsável por alterar informações de um produto já cadastrado.

***Tela de cadastro de um novo produto***

A tela de cadastro de um novo produto permite registrar novos itens no sistema, possibilitando o controle de estoque, organização do catálogo e gerenciamento das informações dos produtos disponíveis.
A tela tem como finalidade:
- Cadastrar novos produtos;
- Armazenar informações detalhadas dos itens;
- Controlar estoque e preços;
- Disponibilizar produtos para vendas ou pedidos.

Cadastrar um novo produto:
- Acesse a tela de cadastro de produto;
- Preencha o nome do produto;
- Informe o código de identificação; 
- Informe descrição do produto;
- Informe o preço;
- Insira uma imagem do produto;
- Escolha o *status* do item;
- Clique em “Salvar”.

***Tela de gerenciamento das categorias de produtos***

A tela de gerenciamento das categorias de produtos permite organizar os produtos do sistema em grupos específicos, facilitando a busca, controle e administração do catálogo.
A tela possui:
- Campo de pesquisa: Permite localizar categorias específicas pelo nome ou descrição;
- Botão “Nova Categoria”: Responsável por abrir o formulário de cadastro de uma nova categoria;
- Botão “Editar”: Permite alterar informações de uma categoria existente;
- Botão “Excluir”: Remove a categoria do sistema, conforme permissões do usuário.

***Tela de cadastro de uma nova categoria de produtos***

A tela de cadastro de uma nova categoria de produtos permite criar grupos organizacionais para os produtos cadastrados no sistema. As categorias facilitam a organização, pesquisa e gerenciamento do catálogo de produtos.
Cadastrar uma nova categoria:
- Acesse a tela de cadastro de categoria;
- Preencha o nome da categoria;
- Adicione uma descrição;
- Ordem;
- Escolha o status da categoria;
- Clique em “Salvar”.

***Tela de gerenciamento das características dos produtos***

A tela de gerenciamento das características dos produtos permite cadastrar, visualizar, editar e organizar atributos específicos relacionados aos produtos do sistema. Essas características ajudam na identificação, classificação e detalhamento dos itens cadastrados.
A tela possui:
- Botão “Nova Característica”: Responsável por abrir o formulário de cadastro de uma nova característica;
- Botão “Editar”: Permite alterar informações de uma característica existente;
- Botão “Excluir”: Remove a característica do sistema, conforme permissões do usuário.

***Tela de cadastro de uma nova característica de produtos***

A tela de cadastro de uma nova característica de produtos permite criar atributos específicos que serão utilizados para detalhar e organizar os produtos cadastrados no sistema.
- Cadastrar uma nova característica:
- Acesse a tela de Nova características;
- Preencha o nome da característica;
- Defina o status;
- Clique em “Salvar”.

Após a confirmação, a característica ficará disponível para utilização nos produtos cadastrados.

***Tela de gerenciamento das informações sobre o negócio***

A tela tem como finalidade centralizar as informações do negócio, atualizar dados institucionais, configurar informações exibidas no sistema como imagem, facilitar o gerenciamento administrativo e garantir que os dados da empresa estejam corretos e atualizados.
Atualizar informações do negócio:
- Acesse a tela de gerenciamento da página;
- Preencha ou atualize os campos necessários;
- Adicione logo e informações de contato;
- Revise os dados informados;
- Clique em “Salvar”.

Alterar imagem:
- Clique na opção trocar imagem;
- Selecione o arquivo desejado;
- Aguarde o carregamento;
- Salve as alterações.

***Tela de gerenciamento das configurações do site***

A tela de gerenciamento das configurações do site permite administrar parâmetros gerais da plataforma, personalizar funcionalidades e configurar informações importantes relacionadas ao funcionamento do sistema.
Atualizar configurações do site:
- Acesse a tela de configurações;
- Atualize as informações necessárias;
- Revise os dados informados;
- Clique em “Salvar”.

Configurar segurança:
- Acesse a área de autenticação em dois fatores ;
- Defina as configurações desejadas;
- Salve as alterações realizadas.

### Telas acessíveis para os usuários clientes
***Tela de acesso aos produtos do catálogo para usuários não logados***

A tela de acesso aos produtos do catálogo para usuários não logados permite que visitantes visualizem os produtos disponíveis no sistema sem a necessidade de realizar *login* ou cadastro.
A tela tem como finalidade:
- Permitir visualização pública dos produtos;
- Facilitar o acesso ao catálogo;
- Apresentar informações dos produtos aos visitantes;
- Incentivar o cadastro e futuras compras;
- Melhorar a experiência de navegação do usuário.

Visualizar produtos:
- Acesse o catálogo público;
- Navegue pelos produtos exibidos;
- Utilize a rolagem para visualizar outros itens.

***Tela de detalhamento dos produtos do catálogo para usuários não logados***

A tela de detalhamento dos produtos do catálogo para usuários não logados permite que visitantes visualizem informações completas sobre um produto sem a necessidade de realizar *login* no sistema.
Visualizar informações do produto:
- Acesse o catálogo público;
- Selecione o produto desejado;
- Visualize as informações detalhadas exibidas na tela.

Consultar características:
- Role a página até a seção de características;
- Verifique os detalhes técnicos e especificações do item.

***Tela de detalhamento dos produtos do catálogo para usuários não logados***

A tela de acesso aos produtos do catálogo para usuários logados permite que usuários autenticados visualizem, pesquisem e interajam com os produtos disponíveis no sistema.
Visualizar produtos:
- Acesse o catálogo após realizar *login;*
- Navegue pelos produtos disponíveis;
- Utilize a rolagem para visualizar mais itens.

Pesquisar produtos:
- Localize o campo de pesquisa;
- Digite o nome desejado;
- Visualize os resultados apresentados.

***Tela de detalhamento dos produtos do catálogo para usuários logados***

A tela de detalhamento dos produtos do catálogo para usuários logados permite visualizar informações completas dos produtos disponíveis no sistema, além de acessar funcionalidades exclusivas para usuários autenticados.
Visualizar informações do produto:
- Acesse o catálogo após realizar *login;*
- Selecione o produto desejado;
- Consulte as informações exibidas na tela.

***Tela de detalhamento dos produtos adicionados ao carrinho de compras***

A tela de detalhamento dos produtos adicionados ao carrinho de compras permite visualizar os itens selecionados pelo usuário antes da finalização do pedido ou compra.
Visualizar produtos do carrinho:
- Acesse o carrinho de compras;
- Consulte os produtos adicionados;
- Verifique quantidades, preços e valores totais.

***Tela de histórico de pedidos***

A tela de histórico de pedidos permite ao usuário visualizar e acompanhar todos os pedidos realizados no sistema, incluindo informações sobre nome do cliente, itens, pagamento e detalhes de cada solicitação.
Visualizar histórico de pedidos:
- Acesse a tela de meus pedidos;
- Consulte a lista de pedidos exibidos;
- Utilize a rolagem para visualizar outros registros.

***Tela de histórico de pedidos com o detalhamento do pedido selecionado***

A tela de histórico de pedidos com detalhamento do pedido selecionado permite ao usuário visualizar todos os pedidos realizados e acessar informações completas de um pedido específico.
Visualizar histórico de pedidos detalhado:
- Acesse a tela meus pedidos;
- Consulte os pedidos exibidos na lista;
- Utilize filtros e pesquisa, se necessário;
- Selecione um pedido.

***Tela de visualização das informações sobre o negócio***

A tela de visualização das informações sobre o negócio permite que usuários consultem dados institucionais da empresa, loja ou estabelecimento cadastrados no sistema.
Visualizar informações do negócio:
- Acesse a tela de informações do negócio;
- Consulte os dados exibidos na página;
- Role a tela para visualizar todas as informações disponíveis.
