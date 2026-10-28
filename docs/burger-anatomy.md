# Hambúrguer — refinamento Anatomy Hero

Conceito: sete conjuntos de ingredientes se aproximam com a rolagem até formar um hambúrguer duplo. O detalhe deve explicar cada alimento: crosta e miolo do pão, carne grelhada, cheddar amolecido, polpa e sementes de tomate, folhas com nervuras.

Plano de peças, antes da geometria: dois corpos de pão e suas faces de miolo; 68 sementes de gergelim orientadas pela normal da casca; duas carnes com contorno irregular, 28 fragmentos de crosta em cada uma e marcas de grelha; uma lâmina de cheddar com quatro cantos caídos e espessura; tomate com casca, polpa, miolo, cinco câmaras e vinte sementes; alface completa com doze nervuras principais e vinte e quatro secundárias. As microtexturas ficam nas superfícies dos alimentos. Peças repetidas usam instancing, materiais e geometrias compartilhadas.

Integração: manter Three.js e os sete grupos usados tanto no React quanto no Live Server. A geometria é criada uma vez; a rolagem move apenas grupos. Cores determinísticas e relevo procedural, sem imagens externas. Manter limite de pixel ratio, pausa fora da tela e movimento reduzido existentes.

Medidas são artísticas, sem alegações de fidelidade industrial ou nutricional. A auditoria SVG da Anatomy não se aplica ao modelo Three.js; não tratar compilação como prova de ausência de interseções.
