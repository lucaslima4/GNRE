# GNRE

Projeto para automatização na geração de guias de GNRE para os estados Acre (AC), Alagoas (AL), Amapá (AP), Amazonas (AM), Bahia (BA), Ceará (CE), Distrito Federal (DF), Goiás (GO), Maranhão (MA), Mato Grosso (MT), Mato Grosso do Sul (MS), Minas Gerais (MG), Pará (PA) , Paraíba (PB), Paraná (PR), Pernambuco (PE), Piauí (PI), Rio Grande do Norte (RN), Rio Grande do Sul (RS), Rondônia (RO), Roraima (RR), Santa Catarina (SC), Sergipe (SE), Tocantins (TO).

## Visão geral

A GNRE (Guia Nacional de Recolhimento de Tributos Estaduais) é uma guia de imposto emitida por diversas empresas para o recolhimento de ICMS. O projeto tem como objetivo automatizar o processo de emissão dessas guias, utilizando-se do Webservice disponibilizado pelo próprio [Portal da GNRE de Pernambuco](http://www.gnre.pe.gov.br/gnre/portal/GNRE_Principal.jsp), no qual é possível consultar e emitir as guias manualmente. O portal também disponibiliza a documentação necessária para o consumo do Webservice.

Vale ressaltar que, devido à estrutura do sistema, o portal permite a emissão de guias para todos os estados, com exceção de Espírito Santo (ES), Rio de Janeiro (RJ) e São Paulo (SP) que, por sua vez, têm portais próprios para a emissão do documento.

## Obrigatoriedades

Por se tratar da emissão de guias de imposto estadual, o portal solicita o uso de um Certificado Digital do tipo e-CNPJ válido para o funcionamento do Webservice. O certificado deve estar instalado na máquina que consumirá o serviço e será utilizado tanto no **Ambiente de Homologação** quanto no **Ambiente de Produção**.

As requisições realizadas para a geração de Guias devem ter como emitente o mesmo CNPJ do certificado utilizado na conexão, além disso, é necessário solicitar a habilitação do uso do serviço através da [Página de Automação](http://www.gnre.pe.gov.br/gnre/portal/automacao.jsp) do portal, tanto para o **Ambiente de Homologação** quanto para o **Ambiente de Produção**.

