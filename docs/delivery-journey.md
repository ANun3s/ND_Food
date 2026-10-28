# Percurso de entrega — ND Food

## Tamanho e conceito

**Hero — diorama isométrico.** A rua em miniatura é um corte físico do pedido: o motoboy parte do ponto de espera, chega ao restaurante, encaixa a sacola térmica na moto, percorre a via até a casa, recebe o pagamento ilustrativo, entrega a refeição e a pessoa começa a comer. O percurso e os rótulos de etapa compartilham um ciclo contínuo; a cena é demonstrativa e não realiza pagamentos.

## Lista de peças (96)

- **Base e passeio (14):** 1 plataforma chanfrada; 4 pés; 4 parafusos; 1 filete de contorno; 1 faixa de guia tátil; 1 meio-fio; 1 calçada; 1 ilha de grama.
- **Restaurante (18):** 1 fundação; 1 parede frontal; 1 parede lateral; 1 platibanda; 1 cobertura; 1 marquise; 2 suportes; 1 placa ND Food; 1 placa de janela; 1 vitrine; 1 balcão; 1 porta; 1 puxador; 1 janela; 1 caixilho; 1 floreira; 1 toldo.
- **Casa e moradora (17):** 1 fundação; 1 parede frontal; 1 parede lateral; 1 telhado; 1 beiral; 1 porta; 1 maçaneta; 1 janela; 1 caixilho; 1 cortina; 1 luz de varanda; 1 degrau; 1 vaso; 1 planta; 1 mesa; 1 prato; 1 pessoa.
- **Rua e orientação (18):** 1 faixa de asfalto; 2 faixas de calçada; 1 curva de rota; 4 marcas de faixa; 2 postes; 2 luminárias; 2 placas de direção; 2 balizadores; 1 ralo; 1 caixa de inspeção.
- **Moto e motoboy (22):** 2 pneus; 2 aros; 2 cubos; 2 discos de freio; 1 chassi; 1 garfo; 1 guidão; 1 farol; 1 banco; 1 escapamento; 1 motor; 1 caixa térmica; 1 tampa; 1 viseira; 1 capacete; 1 torso; 2 braços; 2 pernas.
- **Pedido, pagamento e entrega (7):** 1 embalagem térmica; 1 lacre; 1 cartão de pedido; 1 celular de pagamento; 1 tela PIX; 1 bandeja; 1 refeição.

## Estados do ciclo

1. Motoboy chega ao restaurante para buscar o pedido.
2. A sacola passa do balcão para a caixa térmica.
3. A moto percorre a via até a casa.
4. Na porta, acontece o pagamento demonstrativo.
5. O motoboy entrega a refeição e a pessoa começa a comer.
6. A cena volta suavemente ao estado inicial e reinicia.

Respeitar `prefers-reduced-motion`; parar o ciclo fora da área visível; manter etapas e descrição acessíveis sem depender da animação.

## Refinamento — 26/10/2026

- Composição em largura total: título compacto acima, diorama central e etapas abaixo. Fundo, borda, sombra e moldura do banner removidos em ambos os temas; a plataforma física faz parte do modelo.
- Câmera a 55° de azimute e 34° de elevação; moto ampliada a 1,28× dentro da cena.
- Novas peças: árvores com copas facetadas, canteiros, banco com ripas e suportes, lixeira, pavimentação, cerca, telhado de duas águas com juntas de telhas, cumeeira, chaminé, janela lateral, luz de varanda, painel lateral do restaurante, tubulação externa, exaustor e climatização na cobertura.
- Moto: espessura dos pneus, raios móveis, para-lamas, aletas do motor, faixa refletiva e identidade na caixa térmica. Sombreamento de faces aplicado às peças coloridas.
- Ciclo de 30 segundos com aceleração e desaceleração, giro das rodas proporcional ao deslocamento, leve suspensão em movimento, sacola em arco do balcão à moto e da moto à porta após o pagamento ilustrativo, seguida da mesa. Braço da pessoa se move na etapa da refeição.
- Pausa manual, preservação do tempo fora da tela e suspensão quando a aba fica oculta. Movimento reduzido apresenta a cena estática. Etapas agora são selecionadas a partir da seção inteira, com indicação acessível da etapa atual.
- Compilação Vite concluída; composição observada no navegador em desktop. Sem suíte de testes automatizados nesta alteração.


## Motoboy com volumes — 26/10/2026

Modelo separado em `src/components/iso/courier-model.js`, usado por `DeliveryJourney.js`. O personagem anterior formado por silhuetas planas foi substituído por superfícies de volumes projetados: tronco, ombros, braços articulados, pernas, luvas e botas. Capacete integral com viseira curva, reflexo, proteção de queixo e pivô lateral; jaqueta com faixa refletiva.

A moto ganhou pneus arredondados com sulcos, aros, discos de freio e fixadores; chassi tubular, suspensão, motor com aletas, escapamento, para-lamas com espessura, farol, piscas, retrovisores, banco e caixa térmica com fechos e marca ND. Superfícies ocultas são descartadas e as demais ordenadas em profundidade. Geometria estática calculada uma vez na montagem; deslocamento e raios das rodas mantêm a animação existente. Sem novas bibliotecas.


## Percurso alinhado — 27/10/2026

Câmera ajustada para azimute de 90° e elevação de 34°. O eixo da rua e o trajeto do motoboy agora ficam retos e horizontais na página, enquanto a profundidade dos edifícios e as faces superiores continuam visíveis em isometria. A cena segue usando a mesma projeção para o diorama, a rota, as rodas e a posição da sacola.


## Texturas e alinhamento frontal — 27/10/2026

- Juntas das telhas organizadas em cursos alternados: as juntas verticais agora terminam exatamente nos encontros das fileiras, em vez de pararem no meio delas.
- Linhas de argamassa em fileiras desencontradas sob portas e janelas, ocultas pelas molduras e aberturas.
- Grãos baixos e esparsos no asfalto; juntas de dilatação limitadas às faixas das calçadas. Textura do gramado em traços curtos sobre a superfície.
- Trajeto de entrega deslocado para uma faixa livre ao lado do tracejado central, preservando a sinalização viária e evitando que as marcas se sobreponham. A textura do asfalto deixa uma área livre ao redor dessa faixa.

## Motoboy integrado ao diorama — 27/10/2026

- Roupa, capacete, viseira, moto e peças metálicas receberam tons mais quentes e dessaturados, próximos à terracota, madeira, areia e folhagem do cenário.
- O sombreamento das faces ficou mais suave e os contornos de pneus, jaqueta e capacete foram simplificados para acompanhar a ilustração facetada das construções e árvores.
- Detalhes de costura e reflexo foram suavizados, preservando a leitura do personagem e das peças funcionais da moto.

## Figure simplificada — 28/10/2026

Conceito: a sacola liga o balcão à casa; o motoboy percorre uma rua horizontal e aguarda o pagamento antes de entregar. A solicitação de simplificação prevalece sobre a densidade decorativa padrão da Anatomy.

Peças funcionais planejadas: rua e dois pontos de parada; restaurante com base, paredes, cobertura, janela, vidro, porta, painel, balcão, toldo, seis faixas e identificação; casa com base, paredes, duas águas, janela, vidro, porta, painel, degrau, cliente, braço, mesa, prato e refeição; moto com dois pneus, dois aros, dois cubos, chassi, carenagem, banco, garfo, guidão, caixa, tampa, tronco, perna, braço, capacete e viseira; sacola com corpo, etiqueta e alça; pagamento com aparelho, tela e confirmação. Sem árvores, mobiliário urbano, textura granular, tijolos, telhas, climatização ou plataforma de exposição.
