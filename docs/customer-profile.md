# Conta e endereço do cliente

O cadastro e o perfil pertencem à demonstração local. As contas e os pedidos ficam no armazenamento deste navegador; não use senha ou CPF real. O CEP preenche logradouro, bairro, cidade e estado quando esses dados estão disponíveis. Os campos continuam editáveis porque um CEP pode representar mais de um endereço.

O perfil permite exportar um arquivo JSON com nome, Gmail, CPF, endereço, datas da conta e pedidos vinculados à sessão. Pedidos feitos com a pessoa conectada registram o ID da conta e uma cópia dos dados do cliente. Pedidos antigos ou feitos sem login não são atribuídos automaticamente a uma conta. O arquivo exportado contém dados pessoais da demonstração e não inclui senha nem hash da senha.

## Google Maps Geocoding

Para usar o Google Geocoding, habilite Geocoding API no projeto Google Cloud e adicione `GOOGLE_MAPS_API_KEY` ao `.env.local` da raiz. A chave é lida apenas pelo middleware do Vite e não deve usar o prefixo `VITE_`. Restrinja a chave à Geocoding API e, conforme o ambiente de execução, aos IPs autorizados. Não envie a chave ao navegador nem a publique no repositório.

Com a chave configurada, o site consulta o CEP no Google Maps Geocoding API com filtros de país e código postal. Se o Google não fornecer algum campo do endereço, o site completa os dados disponíveis usando ViaCEP. Sem chave Google, ViaCEP mantém o preenchimento automático disponível.

Rode o site pelo Vite (`npm run dev` ou `npm run preview`) para que a rota local `/api/cep` e a chave de servidor estejam disponíveis. Ao abrir a interface pelo Go Live na porta 5500, mantenha também `npm run dev` ativo na porta 5173; a interface encaminha a consulta a esse servidor local.

## Referências

- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding): origem da consulta de CEP e dos componentes de endereço.
- [Boas práticas de segurança de chaves do Google Maps Platform](https://developers.google.com/maps/api-security-best-practices): manter a chave de serviço fora do navegador e restringir seu uso.
