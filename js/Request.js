/*
/   Aqui estão as principais variáveis para execução do código.
/   Confira a documentação para saber mais detalhes sobre as URLs corretas e os ambientes de Produção e Homologação
*/

var Ns1 = "http://www.gnre.pe.gov.br"; //Namespace principal
var Certificado = "";
var Ambiente = "2"; // 1 = Produção, 2 = Homologação
var ConsultaLote_Url = "https://www.testegnre.pe.gov.br/gnreWS/services/GnreResultadoLote"; //"https://www.gnre.pe.gov.br/gnreWS/services/GnreResultadoLote"
var EnviaLote_Url = "https://www.testegnre.pe.gov.br/gnreWS/services/GnreLoteRecepcao"; //"https://www.gnre.pe.gov.br/gnreWS/services/GnreResultadoLote"

function Request(Url,soapAction,soapRequest,callback){ 
	
	/*  Função para execução do SoapRequest do WebService
	/	Por se tratar de um XMLHttpRequest, o certificado obrigatório será requisitado assim que a função for executada, porém, também é possível utilizar um certificado 
    /   fixo através de um objeto MSXML2.ServerXMLHTTP.6.0, caso esteja usando o código no IE, da seguinte maneira:
	/	
	/	with(new ActiveXObject("MSXML2.ServerXMLHTTP.6.0")){
	/		setOption(3) = Certificado;
	/	}
	/	
	/	Sendo Certificado o nome do certificado em questão. O restante dos cabeçalhos permanecem os mesmos. 
	*/
    var xhr;
    with(xhr = new XMLHttpRequest()){
        open("POST", Url, true);
		setRequestHeader("Content-Type", "text/xml; charset=utf-8");
		setRequestHeader("SOAPAction", soapAction); //Cabeçalho com a ação a ser processada nessa requisição
        timeout = 20000;
		send(soapRequest); //Enviar requisição SOAP
		onreadystatechange = function(){
			if(readyState == 4){ 
                /* Se o estado da requisição for "pronto", retornar o valor para o callback */
				if(status == 200) eval(callback+"(xhr)");
				else throw new Error("Status "+status+" - Não foi possível acessar o portal de emissão de GNRE no momento.");
			}
		}
		ontimeout = function(e){
			throw new Error("Timeout - O portal de emissão de GNRE está indisponível no momento.");
		}
        
        /* Contabilização do Progresso opcional. As funções abaixo estão no arquivo Geral.js */
        
		addEventListener("progress", Progress.download, false);
		if("upload" in xhr) upload.addEventListener("progress", Progress.upload,false);
		onloadend = Progress.end;
	}
}

/* Função para o preenchimento de duas casas, com o acréscimo do 0 esquerdo*/
function zero(n){
	if(n<10) return "0"+n;
	else return n;
}