
var GNRE_Ambiente = "1";

function GNRE_Request (Url,soapAction,soapRequest,callback){ 
	
	/*  Função para execução do SoapRequest do WebService
		Por se tratar de um XMLHttpRequest, o certificado obrigatório será requisitado assim que a função for executada, porém, também é possível utilizar um certificado fixo através de um objeto MSXML2.ServerXMLHTTP.6.0, da seguinte maneira:
		
		with(new ActiveXObject("MSXML2.ServerXMLHTTP.6.0"){
			setOption(3, GNRE_Certificado);
		}
		
		Sendo GNRE_Certificado o nome do certificado em questão. O restante dos cabeçalhos permanecem os mesmos. 
	*/
	
	with(xhr = new XMLHttpRequest()){
		open("POST", Url, true);
		setRequestHeader("Content-Type", "text/xml; charset=utf-8");
		setRequestHeader("SOAPAction", soapAction); //processar
		send(soapRequest); //Enviar requisição SOAP
		timeout = 10000;
		onreadystatechange = function(){
			if(readyState == 4){ //Se o estado da requisição for "pronto", retornar o valor para o callback
				if(status == 200) eval(callback+"(xhr)");
				else throw new Error("Status "+status+" - O portal de emissão de GNRE está indisponível no momento.");
			}
		}
		ontimeout = function(e){
			console.log(e);
			throw new Error("Timeout - O portal de emissão de GNRE está indisponível no momento.");
		}
		
		/* Contabilização do Progresso opcional. As funções abaixo estão no arquivo Geral.js */
		
		onupload = Progress.upload;
		onprogress = Progress.download;
		onloadend = Progress.end;
		
	}
}

var Estados = Array('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO');
var CidadesIBGE_List = new Object(); 

function GNRE_CidadesIBGE(Callback,n){
	
	if(Callback){
		CidadesIBGE_List[Estados[n]] = new Object()
		var Lista = JSON.parse(Callback.responseText);
		for(var x=0;x<Lista.length;x++) CidadesIBGE_List[Estados[n]][Lista[x].nome] = Lista[x].codigo;		
		n++;
	}else{
		n=0;
	}
	
	if(n==Estados.length){
		console.log(CidadesIBGE_List);
		document.getElementById('bloco_resposta').innerHTML = '<textarea>'+JSON.stringify(CidadesIBGE_List)+'</textarea>';
		return;
	}
	console.log("Buscando estado: "+Estados[n]);
	with(xhr = new XMLHttpRequest()){
		open("GET","http://www.gnre.pe.gov.br/gnre/v/guia/municipios/"+Estados[n],true);
		send();
		onreadystatechange = function(){
			if(readyState == 4){ //Se o estado da requisição for "pronto", retornar o valor para o callback
				if(status == 200) GNRE_CidadesIBGE(xhr,n);
				else throw new Error("Status "+status+" - O portal da GNRE está indisponível no momento.");
			}
		}
	}	
}