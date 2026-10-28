# Assistente de suporte da ND Food

O chat oferece respostas locais para perguntas frequentes e usa a Gemini API para perguntas abertas quando o servidor tem uma chave configurada. Nesse caso, o texto da pergunta é enviado ao Google Gemini. O projeto funciona como demonstração escolar: o checkout e o histórico são locais, sem pedidos, pagamentos ou entregas reais.

## Configurar a Gemini API

1. Crie uma chave no Google AI Studio e escolha o projeto Google desejado.
2. Copie `.env.example` para `.env.local` na raiz do projeto.
3. Preencha `GEMINI_API_KEY` em `.env.local` e mantenha o arquivo fora do controle de versão.
4. Execute `npm run dev` e abra o endereço local exibido pelo Vite. O servidor usa a chave e chama a Gemini API; o navegador nunca recebe a chave.

O modelo padrão é `gemini-3.5-flash-lite`. Para trocar, ajuste `GEMINI_MODEL` em `.env.local`. O servidor aplica limite de tamanho, limite simples de mensagens por minuto e remoção de formatos comuns de dados pessoais antes de encaminhar as mensagens. O chat não envia carrinho, endereço salvo ou histórico de pedidos.

## Privacidade e demonstração

O Google informa que conteúdo do Free Tier pode ser usado para melhorar produtos. A interface alerta para não enviar dados pessoais ou de pagamento. O histórico da conversa existe somente na memória da página aberta. As respostas locais de acompanhamento consultam apenas o último pedido armazenado neste navegador e identificam o registro como demonstrativo.

O Live Server/Go Live entrega apenas a interface. Para testar a página pelo Go Live e usar respostas abertas do Gemini, deixe também `npm run dev` em execução na porta local 5173. Em `localhost` ou `127.0.0.1`, o chat encaminha as chamadas de API do Go Live para esse servidor Vite; a chave continua somente no processo Node. Se o Vite não estiver ativo, as perguntas frequentes continuam funcionando e o chat informa que a IA está indisponível. Para a demonstração em uma única origem, use diretamente o endereço do Vite ou `npm run preview`.
