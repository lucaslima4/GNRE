# GNRE

Projeto para automatização na geração de guias de GNRE para os estados Acre (AC), Alagoas (AL), Amapá (AP), Amazonas (AM), Bahia (BA), Ceará (CE), Distrito Federal (DF), Goiás (GO), Maranhão (MA), Mato Grosso (MT), Mato Grosso do Sul (MS), Minas Gerais (MG), Pará (PA) , Paraíba (PB), Paraná (PR), Pernambuco (PE), Piauí (PI), Rio Grande do Norte (RN), Rio Grande do Sul (RS), Rondônia (RO), Roraima (RR), Santa Catarina (SC), Sergipe (SE), Tocantins (TO).

## Visão geral

A GNRE (Guia Nacional de Recolhimento de Tributos Estaduais) é uma guia de imposto emitida por diversas empresas para o recolhimento de ICMS. O projeto tem como objetivo automatizar o processo de emissão dessas guias, utilizando-se do Webservice disponibilizado pelo próprio [Portal da GNRE de Pernambuco](http://www.gnre.pe.gov.br/gnre/portal/GNRE_Principal.jsp), no qual é possível consultar e emitir as guias manualmente. O portal também disponibiliza a documentação necessária para o consumo do Webservice.

Vale ressaltar que, devido à estrutura do sistema, o portal permite a emissão de guias para todos os estados, com exceção de Espírito Santo (ES), Rio de Janeiro (RJ) e São Paulo (SP) que, por sua vez, têm portais próprios para a emissão do documento.

## Obrigatoriedades

### Certificado digital

Por se tratar da emissão de guias de imposto estadual, o portal solicita o uso de um Certificado Digital do tipo e-CNPJ válido para o funcionamento do Webservice. O certificado deve estar instalado na máquina que consumirá o serviço e será utilizado tanto no **Ambiente de Homologação** quanto no **Ambiente de Produção**.

As requisições realizadas para a geração de Guias devem ter como emitente o mesmo CNPJ do certificado utilizado na conexão.

### Habilitação do uso

É necessário solicitar a habilitação do uso do serviço através da [Página de Automação](http://www.gnre.pe.gov.br/gnre/portal/automacao.jsp) do portal, tanto para o **Ambiente de Homologação** quanto para o **Ambiente de Produção**.

## Funcionamento do Webservice

O Webservice disponibilizado tem duas principais funções para a emissão de Guias: o Envio das informações, e a Consulta da Guia.

#### Envio
Na primeira etava são enviadas todas as informações para a emissão da Guia através de um XML que pode conter 1 ou mais guias a serem processadas. Esse payload é chamado de Lote. O retorno dessa requisição é a situação de processamento do lote, ou seja, se ele foi aprovado ou se há algum erro com as informações no XML.

Caso tudo ocorra bem, o sistema retorna o número do Lote enviado para consulta posterior. 

#### Consulta

Na consulta é enviado o número do Lote recebido para checagem das informações da Guia através de um XML. O retorno dessa requisição é um XML com a situação da Guia, informando se ela já foi processada.

Se o processamento já ocorreu, pode ser que as Guias enviadas naquele Lote tenham sido aprovadas ou reprovadas. Em ambos os casos, o portal retorna, dentro do XML, os dados da Guia sequenciados, contendo os dados da Guia ou os dados da Rejeição.

## Estrutura do projeto

O projeto é dividido em 3 arquivos principais, com suas funções:

- **[Request.js](js/Request.js)**
  - Função Request(_Url , soapAction , soapRequest , callback_) - Responsável pelas requisições via XMLHTTPRequest.
  - Função Zero(_n_) - Função para o preenchimento de duas casas, com o acréscimo do 0 esquerdo.  
- **[EnviaLote.js](js/EnviaLote.js)**
  - ParseXML() - Parser do XML da Nota Fiscal
  - EnviaLote(_Dados_) - Função para formar o XML (soapRequest) através das informações fornecidas em _Dados_
  - EnviaLote_Callback(_xhr_) - Função que lida com o retorno da requisição
- **[ConsultaLote.js](js/ConsultaLote.js)**
  - ConsultaLote() - Responsável por formar o XML (soaprequest) para a consulta de um Lote
  - ConsultaLote_Callback(_xhr_) - Função que lida com o retorno da requisição e analisa os dados, distribuindo-os em um objeto amigável.
  - ConsultaLote_Parse(_Conteudo_) - Parser dos retornos de cada tipo de dados (Cabeçalho, Rodapé, Guia e Rejeição de Guia).
  
O projeto também possui arquivos JSON que contêm as informações para parseamento e identificação dos dados:
  
- **[ConsultaLote_Campos.json](json/ConsultaLote_Campos.json)**
  - Contém os dados dos Campos retornados na Consulta do Lote, permitindo a identificação dos dados sequenciados.
- **[Legendas.json](json/Legendas.json)**
  - Legendas e Identificações das informações da Guia.
- **[Produtos.json](json/Produtos.json)**
  - Identificação de todos os produtos.
- **[Receitas.json](json/Receitas.json)**
  - Identificação de todas as receitas.
- **[Detalhamento_Receita.json](json/Detalhamento_Receita.json)**
  - Identificação de todos os Detalhamentos de Receitas (podem ser solicitados de acordo com o Estado e a Receita selecionados)
- **[EnviaLote_Campos.json](json/EnviaLote_Campos.json)**
  - TAGs do XML que irão compor cada Guia.
- **[EnviaLote_EstruturaUF.json](json/EnviaLote_EstruturaUF.json)**
  - Todos os detalhes e obrigatoriedades de cada Estado e Receita.

## Observações

- É possível que, na emissão de certas guias, o sistema solicite Campos Extras diferentes dos listados no arquivo [EnviaLote_EstruturaUF.json](json/EnviaLote_EstruturaUF.json), uma vez que o portal da GNRE não disponibiliza todas as informações sobre os Campos Extras. Nesse caso, basta abrir o arquivo e incluir o campo solicitado no Array de **Campos_Adicionais** da Receita correspondente, da seguinte maneira:

```json
{"Codigo":"","Titulo":"","Tipo":"T","Valor":"Dados[Guia_Num].chNFe"}
```
Sendo ***Codigo***, o código solicitado pelo portal e o ***Valor***, sendo o valor a ser colocado dentro desse campo. A variável ***Titulo*** é opcional.

- Dentro do arquivo [EnviaLote.js](js/EnviaLote.js), existem variáveis que estarão dentro do XML e que são compulsórias. Essas informações não podem ser obtidas automaticamente através do XML da Nota Fiscal, portanto, devem ser definidas de maneira manual. As variáveis são:

  - produto
    - Tipo do produto presente na NF (consulte [Produtos.json](json/Produtos.json) para detalhes e [EnviaLote_EstruturaUF.json](json/EnviaLote_EstruturaUF.json) para verificar a disponibilidade dos produtos em cada UF).
  - receita
    - Receita na qual se encaixa a operação da Guia (consulte [Legendas.json](json/Legendas.json) para detalhes e [EnviaLote_EstruturaUF.json](json/EnviaLote_EstruturaUF.json) para verificar a disponibilidade das receitas em cada UF).
  - tipoDocOrigem
    - Tipo do documento a ser enviado (consulte [Legendas.json](json/Legendas.json) para opções).
  - convenio = "0";
    - Campos não obrigatório, costuma ter valor 0;
  - periodo
    - Periodicidade de envio da Guia (consulte [Legendas.json](json/Legendas.json) para opções).



  
  
  
