const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

const catalog = {
  'Hambúrgueres': [
    { name: 'Smash clássico', description: 'Dois discos na chapa, cheddar e molho da casa.', price: 29.9, oldPrice: 36.9, image: image('photo-1568901346375-23c9450c58cd'), badge: 'MAIS PEDIDO' },
    { name: 'Burger bacon crocante', description: 'Bacon artesanal, queijo e cebola caramelizada.', price: 34.9, oldPrice: 39.9, image: image('photo-1550547660-d9450f859349'), badge: 'FAVORITO' },
    { name: 'Batata rústica', description: 'Batatas douradas com páprica e aioli.', price: 18.9, oldPrice: 22.9, image: image('photo-1573080496219-bb080dd4f877'), badge: 'ACOMPANHAMENTO' },
  ],
  'Pizzas': [
    { name: 'Pizza Margherita', description: 'Molho artesanal, mozzarella e manjericão fresco.', price: 49.9, oldPrice: 59.9, image: image('photo-1571407970349-bc81e7e96d47'), badge: 'CLÁSSICA' },
    { name: 'Pizza calabresa', description: 'Calabresa fatiada, cebola roxa e orégano.', price: 54.9, oldPrice: 62.9, image: image('photo-1513104890138-7c749659a591'), badge: 'MAIS PEDIDA' },
    { name: 'Pizza quatro queijos', description: 'Mozzarella, gorgonzola, parmesão e catupiry.', price: 58.9, oldPrice: 66.9, image: image('photo-1579751626657-72bc17010498'), badge: 'FAVORITA' },
  ],
  'Japonesa': [
    { name: 'Combo Sushi Lovers', description: 'Sushis e sashimis preparados na hora.', price: 64.9, oldPrice: 79.9, image: image('photo-1579871494447-9811cf80d66c'), badge: 'MAIS PEDIDO' },
    { name: 'Temaki salmão', description: 'Salmão fresco, arroz temperado e cebolinha.', price: 32.9, oldPrice: 37.9, image: image('photo-1579584425555-c3ce17fd4351'), badge: 'FRESQUINHO' },
    { name: 'Guioza da casa', description: 'Seis unidades douradas com molho ponzu.', price: 25.9, oldPrice: 29.9, image: image('photo-1563245372-f21724e3856d'), badge: 'ACOMPANHAMENTO' },
  ],
  'Açaí': [
    { name: 'Açaí do seu jeito', description: 'Açaí cremoso, banana, morango e granola.', price: 22.9, oldPrice: 27.9, image: image('photo-1590301157890-4810ed352733'), badge: 'MONTE O SEU' },
    { name: 'Açaí tropical', description: 'Manga, maracujá, coco e melado.', price: 25.9, oldPrice: 29.9, image: image('photo-1511690743698-d9d85f2fbf38'), badge: 'REFRESCANTE' },
    { name: 'Açaí com paçoca', description: 'Açaí, paçoca artesanal e leite condensado.', price: 24.9, oldPrice: 28.9, image: image('photo-1490474418585-ba9bad8fd0ea'), badge: 'FAVORITO' },
  ],
  'Sobremesas': [
    { name: 'Torta de chocolate', description: 'Ganache cremosa com massa de cacau.', price: 19.9, oldPrice: 23.9, image: image('photo-1578985545062-69928b1d9587'), badge: 'MAIS PEDIDA' },
    { name: 'Cheesecake de frutas', description: 'Base crocante, creme leve e frutas vermelhas.', price: 21.9, oldPrice: 25.9, image: image('photo-1533134242443-d4fd215305ad'), badge: 'FEITO HOJE' },
    { name: 'Brownie com sorvete', description: 'Brownie de chocolate servido com gelato.', price: 24.9, oldPrice: 28.9, image: image('photo-1564355808539-22fda35bed7e'), badge: 'FAVORITO' },
  ],
  'Bebidas': [
    { name: 'Limonada da casa', description: 'Limão espremido na hora com um toque de hortelã.', price: 12.9, oldPrice: 15.9, image: image('photo-1513558161293-cdaf765edfd7'), badge: 'REFRESCANTE' },
    { name: 'Suco natural', description: 'Suco feito na hora com frutas selecionadas.', price: 14.9, oldPrice: 17.9, image: image('photo-1600271886742-f049cd451bba'), badge: 'NATURAL' },
    { name: 'Chá gelado cítrico', description: 'Chá preto, laranja e limão, pouco adoçado.', price: 11.9, oldPrice: 13.9, image: image('photo-1556679343-c7306c1976bc'), badge: 'LEVINHO' },
  ],
  'Sanduíches': [
    { name: 'Sanduíche de pernil', description: 'Pernil assado lentamente, vinagrete e queijo.', price: 28.9, oldPrice: 34.9, image: image('photo-1528735602780-2552fd46c7af'), badge: 'MAIS PEDIDO' },
    { name: 'Frango crocante', description: 'Frango empanado, alface fresca e maionese cítrica.', price: 27.9, oldPrice: 32.9, image: image('photo-1606755962773-d324e0a13086'), badge: 'CROCANTE' },
    { name: 'Caprese no ciabatta', description: 'Mozzarella, tomate, pesto e rúcula.', price: 25.9, oldPrice: 29.9, image: image('photo-1553909489-cd47e0ef937f'), badge: 'LEVINHO' },
  ],
  'Massas': [
    { name: 'Fettuccine ao molho da casa', description: 'Massa fresca envolvida em molho cremoso.', price: 39.9, oldPrice: 46.9, image: image('photo-1473093295043-cdd812d0e601'), badge: 'MASSA FRESCA' },
    { name: 'Ravioli de queijo', description: 'Ravioli artesanal com molho de tomate e manjericão.', price: 42.9, oldPrice: 49.9, image: image('photo-1551183053-bf91a1d81141'), badge: 'FEITO À MÃO' },
    { name: 'Nhoque ao sugo', description: 'Nhoque macio com molho de tomate cozido lentamente.', price: 36.9, oldPrice: 42.9, image: image('photo-1556761223-4c4282c73f77'), badge: 'FAVORITO' },
  ],
  'Saladas': [
    { name: 'Salada da estação', description: 'Folhas frescas, tomate, grãos e molho cítrico.', price: 27.9, oldPrice: 32.9, image: image('photo-1512621776951-a57141f2eefd'), badge: 'FRESQUINHA' },
    { name: 'Bowl de quinoa', description: 'Quinoa, abacate, legumes assados e ervas.', price: 31.9, oldPrice: 36.9, image: image('photo-1540420773420-3366772f4999'), badge: 'MAIS PEDIDO' },
    { name: 'Caesar crocante', description: 'Alface romana, parmesão, croutons e molho Caesar.', price: 29.9, oldPrice: 34.9, image: image('photo-1546793665-c74683f339c1'), badge: 'CLÁSSICA' },
  ],
  'Cafés': [
    { name: 'Cappuccino cremoso', description: 'Espresso, leite vaporizado e cacau.', price: 14.9, oldPrice: 17.9, image: image('photo-1495474472287-4d71bcdd2085'), badge: 'DA CASA' },
    { name: 'Latte gelado', description: 'Espresso duplo com leite gelado e gelo.', price: 16.9, oldPrice: 19.9, image: image('photo-1461023058943-07fcbe16d735'), badge: 'GELADINHO' },
    { name: 'Pão de queijo', description: 'Porção quentinha de pão de queijo mineiro.', price: 12.9, oldPrice: 15.9, image: image('photo-1509440159596-0249088772ff'), badge: 'ACOMPANHAMENTO' },
  ],
  'Frutos do mar': [
    { name: 'Camarão ao alho e limão', description: 'Camarões salteados com ervas e limão fresco.', price: 54.9, oldPrice: 64.9, image: image('photo-1559737558-2f5a35f4523b'), badge: 'MAIS PEDIDO' },
    { name: 'Peixe grelhado', description: 'Filé do dia com legumes e molho de ervas.', price: 49.9, oldPrice: 58.9, image: image('photo-1519708227418-c8fd9a32b7a2'), badge: 'DO MAR' },
    { name: 'Bolinho de bacalhau', description: 'Seis bolinhos dourados com aioli da casa.', price: 32.9, oldPrice: 38.9, image: image('photo-1579631542720-3a87824fff86'), badge: 'PORÇÃO' },
  ],
  'Comida brasileira': [
    { name: 'Feijoada da casa', description: 'Feijão-preto, carnes, arroz, couve e farofa.', price: 42.9, oldPrice: 49.9, image: image('photo-1547592180-85f173990554'), badge: 'TRADIÇÃO' },
    { name: 'Baião de dois', description: 'Arroz, feijão-de-corda, queijo coalho e cheiro-verde.', price: 36.9, oldPrice: 43.9, image: image('photo-1512058564366-18510be2db19'), badge: 'MAIS PEDIDO' },
    { name: 'Frango com quiabo', description: 'Receita caseira com arroz soltinho e angu.', price: 38.9, oldPrice: 45.9, image: image('photo-1604908176997-125f25cc6f3d'), badge: 'CASEIRO' },
  ],
  'Mexicana': [
    { name: 'Tacos da casa', description: 'Tortillas, carne temperada, pico de gallo e limão.', price: 32.9, oldPrice: 38.9, image: image('photo-1551504734-5ee1c4a1479b'), badge: 'MAIS PEDIDO' },
    { name: 'Burrito de frango', description: 'Frango, arroz, feijão, queijo e guacamole.', price: 35.9, oldPrice: 41.9, image: image('photo-1626700051175-6818013e1d4f'), badge: 'BEM RECHEADO' },
    { name: 'Nachos com guacamole', description: 'Nachos crocantes, guacamole e salsa fresca.', price: 26.9, oldPrice: 31.9, image: image('photo-1513456852971-30c0b8199d4d'), badge: 'PARA COMPARTILHAR' },
  ],
  'Árabe': [
    { name: 'Combo de esfihas', description: 'Esfihas abertas de carne, queijo e zaatar.', price: 29.9, oldPrice: 35.9, image: image('photo-1529006557810-274b9b2fc783'), badge: 'MAIS PEDIDO' },
    { name: 'Prato de falafel', description: 'Falafel, homus, salada e pão sírio.', price: 34.9, oldPrice: 40.9, image: image('photo-1593001874117-c99c800e3eb4'), badge: 'VEGETARIANO' },
    { name: 'Shawarma de frango', description: 'Frango temperado, molho tahine e vegetais no pão.', price: 31.9, oldPrice: 37.9, image: image('photo-1529006557810-274b9b2fc783'), badge: 'DA CASA' },
  ],
  'Tailandesa': [
    { name: 'Pad Thai', description: 'Macarrão de arroz, vegetais, amendoim e limão.', price: 39.9, oldPrice: 46.9, image: image('photo-1559847844-5315695dadae'), badge: 'MAIS PEDIDO' },
    { name: 'Curry verde', description: 'Curry aromático com leite de coco e arroz jasmim.', price: 42.9, oldPrice: 49.9, image: image('photo-1526318896980-cf78c088247c'), badge: 'AROMÁTICO' },
    { name: 'Rolinhos frescos', description: 'Rolinhos de vegetais com molho agridoce.', price: 25.9, oldPrice: 30.9, image: image('photo-1563245372-f21724e3856d'), badge: 'ENTRADA' },
  ],
  'Chinesa': [
    { name: 'Yakisoba especial', description: 'Macarrão, vegetais crocantes e molho da casa.', price: 36.9, oldPrice: 43.9, image: image('photo-1563245372-f21724e3856d'), badge: 'MAIS PEDIDO' },
    { name: 'Bao de porco', description: 'Pão no vapor macio com porco e picles orientais.', price: 28.9, oldPrice: 33.9, image: image('photo-1562802378-063ec186a863'), badge: 'FEITO NO VAPOR' },
    { name: 'Arroz frito da casa', description: 'Arroz salteado com ovo, cebolinha e legumes.', price: 31.9, oldPrice: 37.9, image: image('photo-1603133872878-684f208fb84b'), badge: 'FAVORITO' },
  ],
  'Indiana': [
    { name: 'Butter chicken', description: 'Frango ao molho cremoso de tomate e especiarias.', price: 42.9, oldPrice: 49.9, image: image('photo-1585937421612-70a008356fbe'), badge: 'MAIS PEDIDO' },
    { name: 'Paneer tikka masala', description: 'Queijo paneer ao molho de especiarias e tomate.', price: 39.9, oldPrice: 46.9, image: image('photo-1565557623262-b51c2513a641'), badge: 'VEGETARIANO' },
    { name: 'Samosa de legumes', description: 'Pastéis crocantes com batata e especiarias.', price: 22.9, oldPrice: 27.9, image: image('photo-1601050690597-df0568f70950'), badge: 'ENTRADA' },
  ],
  'Coreana': [
    { name: 'Bibimbap', description: 'Arroz, vegetais, ovo e molho gochujang.', price: 39.9, oldPrice: 46.9, image: image('photo-1498654896293-37aacf113fd9'), badge: 'MAIS PEDIDO' },
    { name: 'Frango coreano crocante', description: 'Frango crocante com molho agridoce picante.', price: 42.9, oldPrice: 49.9, image: image('photo-1626082927389-6cd097cdc6ec'), badge: 'CROCANTE' },
    { name: 'Kimbap de legumes', description: 'Arroz e vegetais enrolados em alga tostada.', price: 28.9, oldPrice: 33.9, image: image('photo-1617196034796-73dfa7b1fd56'), badge: 'LEVINHO' },
  ],
  'Vegana': [
    { name: 'Burger de grão-de-bico', description: 'Hambúrguer vegetal, folhas e maionese de ervas.', price: 31.9, oldPrice: 37.9, image: image('photo-1512621776951-a57141f2eefd'), badge: 'MAIS PEDIDO' },
    { name: 'Bowl colorido', description: 'Grãos, legumes assados, folhas e molho tahine.', price: 34.9, oldPrice: 40.9, image: image('photo-1540420773420-3366772f4999'), badge: '100% VEGETAL' },
    { name: 'Brownie vegano', description: 'Chocolate intenso com cacau e castanhas.', price: 18.9, oldPrice: 22.9, image: image('photo-1564355808539-22fda35bed7e'), badge: 'DOCE FINAL' },
  ],
  'Padarias': [
    { name: 'Pão de fermentação natural', description: 'Casca crocante e miolo macio, assado hoje.', price: 18.9, oldPrice: 22.9, image: image('photo-1509440159596-0249088772ff'), badge: 'ASSADO HOJE' },
    { name: 'Croissant de manteiga', description: 'Massa folhada leve com manteiga de verdade.', price: 14.9, oldPrice: 17.9, image: image('photo-1555507036-ab1f4038808a'), badge: 'FOLHADO' },
    { name: 'Pão de queijo quentinho', description: 'Porção de pães de queijo com queijo meia-cura.', price: 16.9, oldPrice: 19.9, image: image('photo-1509440159596-0249088772ff'), badge: 'FAVORITO' },
  ],
};

export function getRestaurantMenu(restaurant) {
  return (catalog[restaurant.category] ?? []).map((product, index) => ({
    ...product,
    id: `${restaurant.id}-item-${index + 1}`,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
  }));
}
