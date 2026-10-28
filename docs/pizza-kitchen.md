# Da massa ao forno — ND Food

## Direção

Circuito com modelos 3D reais em Three.js, câmera ortográfica e acabamento de desenho técnico, inspirado nas referências de cozinha tradicional e Raptor enviadas pelo usuário. Substitui a animação de entrega na home. A sequência explica a preparação de uma pizza: abertura da massa, molho, ingredientes, entrada no forno, cocção e retirada. Contornos pretos/brancos acompanham o tema; a pizza em preparo e o interior do forno recebem cor. O pedido mais recente de volumes 3D substitui a restrição anterior da primeira versão.

Agency Agents direcionou a construção do componente ao agente Frontend Developer. Integração e revisão ficam com o agente principal. Graphify cobria a cena anterior de entrega, mas não esta nova cozinha; os arquivos originais e a referência visual orientaram a implementação.

## Conceito e peças

Quatro estações separadas: abertura da massa, montagem, forno a lenha e saída. A mesma pizza muda de forma, recebe ingredientes e percorre o circuito apoiada em uma pá durante os deslocamentos. Uma câmera comum mantém superfícies, utensílios e pizza na mesma perspectiva. Malhas tridimensionais, iluminação neutra e buffer de profundidade determinam os volumes e as oclusões. O desenho SVG permanece como alternativa sem WebGL.

Grupos funcionais planejados: tampo, borda, pernas, apoios, prateleira inferior, tábua, recipientes de molho, queijo e ingredientes, tampas e bordas, pote de farinha, rolo e cabos, utensílio de molho, massa, borda da pizza, molho, queijo, coberturas, pá e cabo, corpo do forno, arco, boca, soleira, chaminé, conexões, painel de forno, lenha, chamas internas e indicadores. As peças e repetições atendem à função da preparação; sem cidade ou decoração externa.

## Comportamento

Contornos pretos no tema claro e brancos no escuro, herdando o seletor de tema do site. Cores naturais concentradas na massa, molho e coberturas da pizza em movimento; estrutura e utensílios continuam neutros. Chamas recortadas pela abertura do forno. Sequência contínua, com controles para pausar, escolher etapas e percorrer o tempo. Animação suspensa fora da área visível e quando a aba está oculta. Movimento reduzido oferece quadro estático e navegação manual.

## Integração

`index.html` hospeda `[data-pizza-kitchen]` e o CSS. `src/site.js` carrega `src/components/PizzaKitchen.js`. A antiga `DeliveryJourney.js` permanece no projeto como histórico, sem ser carregada na home.

## Histórico de verificação da primeira versão plana — 28/10/2026

Build Vite concluído. Função `pizzaFrame` conferida em nove limites da sequência: posição, escala, massa, molho, pá e ferramentas permanecem contínuos; o reinício acontece com a pizza invisível. Confirmada a entrada no forno, a retirada assada e os valores finitos de todos os quadros. Interface conferida em desktop nos temas claro e escuro e em 390 px no tema escuro; pausa, escolha de etapa e slider respondem. A pizza é recortada pelo corpo do forno durante a passagem; superfícies fechadas da soleira ocultam as linhas da bancada. A opção de movimento reduzido foi revisada no código, sem alterar preferências do sistema. SVG 2D não utiliza shader ou auditoria de sólidos 3D.

## Circuito tradicional — revisão em 28/10/2026

Nova direção autorizada pelo usuário: modelos com volume 3D em perspectiva isométrica, mantendo o acabamento de contorno preto/branco da versão anterior. A restrição anterior contra modelagem 3D foi substituída por este pedido. Referências: cozinha tradicional com bancadas de preparo, cubas de ingredientes e forno a lenha; ilustração técnica Raptor da Anatomy. Escopo Hero concentrado no circuito de produção, sem simular todo um restaurante.

A mesma pizza percorre estações fisicamente separadas: mesa de abertura da massa → bancada de molho e cobertura → forno a lenha → mesa de saída. Cada deslocamento deve ter suporte da pá, desaceleração ao pousar e continuidade de posição. Posições e pontos de apoio devem vir de uma única projeção do mundo, incluindo a boca do forno e o plano das pizzas.

### Inventário de referência para os modelos

- Mesa de massa (22): tampo, espessura frontal, espessura lateral, quatro pernas, quatro sapatas, duas travessas, prateleira inferior, duas caixas de fermentação, duas tampas, farinha, tábua de trabalho, raspador e recipiente de farinha.
- Mesa de montagem (23): tampo, duas bordas, quatro pernas, duas travessas, prateleira, três cubas, três aros, três bases, concha, garrafa de azeite, tábua e bandeja.
- Ingredientes e pizza (23 grupos): massa, borda superior, parede lateral, base, molho, espiral de aplicação, queijo ralado, discos de tomate, sementes, folhas de manjericão, nervuras, marcas de cocção, farinha na bancada, tomates inteiros, caules, queijo na cuba, manjericão na cuba, molho na cuba, pá, cabo, ligação da pá, rolo e mãos de preparo.
- Forno (25 grupos): base, pés, pedestal, nicho de lenha, toras, tampo refratário, cúpula, contorno posterior, arco externo, aduelas do arco, arco interno, parede da boca, soleira superior, espessura da soleira, piso interno, parede interna, chaminé, duas emendas, chapéu, termômetro, aro, ponteiro, chamas e brasas.
- Saída e utensílios (12): tampo de apoio, duas faces, quatro pernas, travessa, tábua de servir, pratos empilhados, suporte das pás e pá de reserva.

Peças finais podem ser agrupadas no código, mas cada detalhe deve fazer parte de um objeto e respeitar a profundidade. Sem linhas atravessando tampo, pizza atravessando parede ou fogo vazando para fora da boca.

## Refinamento de foco e oclusão — 28/10/2026

O usuário pediu cor apenas no elemento principal do circuito e modelos mais polidos, sem sobreposição. A pizza é o foco: massa/aro dourado suave, molho e tomate em terracota, queijo creme e folhas verdes. O fogo mantém sua cor. Bancadas, recipientes, pás e estrutura do forno preservam o acabamento técnico neutro e contornos conforme o tema. As estações devem ter separação tanto no espaço físico quanto na silhueta projetada, evitando que a mesa de saída cubra o nicho do forno.

## Entrega do circuito refinado — 28/10/2026

Implementado em `PizzaKitchenGeometry.js` (projeção e peças), `PizzaKitchen.js` (sequência e controles) e `PizzaKitchen.css` (temas e acabamento). Ciclo de 48 segundos, com quatro estações e seis etapas. Bancadas distribuídas em duas por duas, com folgas entre silhuetas. A entrada/saída do forno usa uma aproximação alinhada ao eixo da boca; o recorte combina o semiplano frontal da pizza com a abertura do forno. O douramento acompanha o progresso da cocção.

Build Vite concluído. Revisão visual em desktop escuro e celular de 390 px claro/escuro ao longo do refinamento; controles de etapa e slider usados na inspeção. Corrigidos recorte diagonal na pizza e dimensão ausente no poste do suporte das pás. Inspeção do SVG final não encontrou coordenadas NaN/Infinity. Movimento reduzido e suspensão fora da tela permanecem no código; não foi feita uma auditoria automatizada de colisões 3D.

## Modelagem 3D real — revisão solicitada em 28/10/2026

Nova orientação do usuário: ampliar o detalhe e substituir o desenho projetado por modelos realmente tridimensionais. A camada principal passa a Three.js, já presente no projeto. `PizzaKitchenModel.js` define malhas com espessura, superfícies curvas, forno oco e contornos de arestas; `PizzaKitchenScene.js` controla câmera ortográfica, luz, tema, enquadramento responsivo e descarte. O SVG anterior permanece como alternativa quando WebGL não estiver disponível. O ciclo e os controles continuam compartilhando `pizzaFrame`. A cor permanece concentrada na pizza e no fogo, e as quatro estações ficam espacialmente separadas.

### Entrega 3D

Modelos: tampos com bordas arredondadas, pés cilíndricos, travessas e prateleiras; caixas de fermentação empilhadas; cubas ocas por revolução; crosta em torus, massa em disco, molho, queijo, sementes de tomate e folhas extrudadas; forno com casca traseira, abóbada, arco vazado, piso interno escuro, chaminé, termômetro e nicho de lenha; pás de lâmina fina e suporte. Peças estáticas agrupadas por material para reduzir chamadas de desenho. Nenhuma dependência nova instalada.

Build concluído. Cena WebGL confirmada no navegador, com entrada da pizza no forno no desktop escuro e saída no celular de390px em tema claro. As quatro estações cabem no enquadramento e ficam separadas. Nenhum erro de console capturado na inspeção final. Tema reage ao seletor existente; pausa e navegação manual continuam disponíveis. Não foi executada suíte automatizada nem auditoria exaustiva de colisões em todos os quadros.
