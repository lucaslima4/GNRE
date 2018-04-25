
var GNRE_ConsultaLote_Url = "https://www.gnre.pe.gov.br/gnreWS/services/GnreResultadoLote"; //"https://www.gnre.pe.gov.br/gnreWS/services/GnreResultadoLote"

function GNRE_ConsultaLote(){
	
	/* Função para formação da requisição SOAP com os dados de Ambiente e número do Lote a ser consultado */
	
	var Lote = document.getElementById('campo_request_lote').value;
		
	var soapRequest =
		'<?xml version="1.0" encoding="utf-8" standalone="yes"?>'+
		'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
			'<soap:Header>'+
				'<gnreCabecMsg xmlns="http://www.gnre.pe.gov.br/wsdl/consultar">'+
				'<versaoDados>1.00</versaoDados>'+
				'</gnreCabecMsg>'+
			'</soap:Header>'+
			'<soap:Body>'+
				'<gnreDadosMsg xmlns="http://www.gnre.pe.gov.br/webservice/GnreResultadoLote">'+
				'<TConsLote_GNRE xmlns="http://www.gnre.pe.gov.br">'+			
					'<ambiente>'+GNRE_Ambiente+'</ambiente>'+
					'<numeroRecibo>'+Lote+'</numeroRecibo>'+			
				'</TConsLote_GNRE>'+
				'</gnreDadosMsg>'+
			'</soap:Body>'+
		'</soap:Envelope>';
		
		GNRE_Request(GNRE_ConsultaLote_Url,"consultar",soapRequest,"GNRE_ConsultaLote_Callback");
}


function GNRE_ConsultaLote_Callback(http){
		
	/* Função para lidar com o retorno da requisição SOAP */
	
	var XML = http.responseXML;
	var GNRE_Consultar_Situacao = XML.getElementsByTagNameNS("http://www.gnre.pe.gov.br","situacaoProcess");
	
	if(GNRE_Consultar_Situacao.length>0){ //Se houver uma Situação de Processamento
		
		var Codigo_Situacao = GNRE_Consultar_Situacao[0].childNodes[0].innerHTML;
					
		if(Codigo_Situacao != 402){ //Se o código retornado não for 402 (Sucesso)
			var Descricao_Situacao = GNRE_Consultar_Situacao[0].childNodes[1].innerHTML;
			throw new Error("Situação "+Codigo_Situacao+" - "+Descricao_Situacao);
			return;
		}
		
		var Resultado_Lote = XML.getElementsByTagNameNS("http://www.gnre.pe.gov.br","resultado");
		
		if(Resultado_Lote.length>0){ //Se houver um Resultado do lote
		
			var Resultado_Split = new String(Resultado_Lote[0].innerHTML).split(/\n/);
							
			var Cabecalho = Resultado_Split[0];
			var Resultado = Resultado_Split[1];
			var Rodape = Resultado_Split[2];
			
			var Guias = Number(Rodape.substr(11,4));			
			
			for(var n=0;n<Guias;n++){ //Enquanto houver guias			

				/* Criação de Objeto com todos os dados retornados na consulta */
				var Valores = new Array();
				Valores[n] = new Object();
				
				var Campos = [{Nome:"Identificador",Tamanho:1,Tipo:"String"},
					  {Nome:"Sequencial_Guia",Tamanho:4,Tipo:"Number"},
					  {Nome:"Situacao_Guia",Tamanho:1,Tipo:"Number"},
					  {Nome:"UF_Favorecida",Tamanho:2,Tipo:"String"},
					  {Nome:"Codigo_Receita",Tamanho:6,Tipo:"String"},
					  {Nome:"Tipo_Documento_Emitente",Tamanho:1,Tipo:"Number"},
					  {Nome:"Documento_Emitente",Tamanho:16,Tipo:"String"},
					  {Nome:"Razao_Social_Emitente",Tamanho:60,Tipo:"String"},
					  {Nome:"Endereco_Emitente",Tamanho:60,Tipo:"String"},
					  {Nome:"Municipio_Emitente",Tamanho:50,Tipo:"String"},
					  {Nome:"UF_Emitente",Tamanho:2,Tipo:"String"},
					  {Nome:"CEP_Emitente",Tamanho:8,Tipo:"String"},
					  {Nome:"Telefone_Emitente",Tamanho:11,Tipo:"String"},
					  {Nome:"Tipo_Documento_Destinatario",Tamanho:1,Tipo:"Number"},
					  {Nome:"Documento_Destinatario",Tamanho:16,Tipo:"String"},
					  {Nome:"Municipio_Destinatario",Tamanho:50,Tipo:"String"},
					  {Nome:"Produto",Tamanho:255,Tipo:"Number"},
					  {Nome:"Documento_Origem",Tamanho:18,Tipo:"Number"},
					  /*
					  	O Documento de Origem está definido como Number, porém deve-se atentar para o tipo de documento enviado.
						Caso o número do documento enviado possa iniciar com o numeral 0, o tipo deve ser alterado para String, a fim de evitar alteração no número original.
					  */					  
					  {Nome:"Convenio",Tamanho:30,Tipo:"String"},
					  {Nome:"Complementar",Tamanho:300,Tipo:"String"},
					  {Nome:"Data_Vencimento",Tamanho:8,Tipo:"Date"},
					  {Nome:"Data_Limite",Tamanho:8,Tipo:"Date"},
					  {Nome:"Periodo_Referencia",Tamanho:1,Tipo:"String"},
					  {Nome:"Mes_Ano_Referencia",Tamanho:6,Tipo:"String"},
					  {Nome:"Parcela",Tamanho:3,Tipo:"Number"},
					  {Nome:"Valor_Principal",Tamanho:15,Tipo:"Money"},
					  {Nome:"Valor_Atualizado",Tamanho:15,Tipo:"Money"},
					  {Nome:"Valor_Juros",Tamanho:15,Tipo:"Money"},
					  {Nome:"Valor_Multa",Tamanho:15,Tipo:"Money"},
					  {Nome:"Representacao_Numerica",Tamanho:14,Tipo:"String"},
					  {Nome:"Codigo_Barras",Tamanho:44,Tipo:"String"},
					  {Nome:"Vias",Tamanho:1,Tipo:"Number"},
					  {Nome:"Controle",Tamanho:16,Tipo:"String"},
					  {Nome:"Identificador_Guia",Tamanho:10,Tipo:"String"},
					  {Nome:"Contingencia",Tamanho:1,Tipo:"Number"},
					  {Nome:"Reservado",Tamanho:126,Tipo:"String"}
					  ];
					  
				var Posicao_Campo = 0;
				for(var g=0;g<Campos.length;g++){
					var Valor_Campo = Resultado.substr(Posicao_Campo,Campos[g].Tamanho);
					Valor_Campo = Valor_Campo.replace(/[\s]{2,}/gi,""); //Retirar espaços extras do valor do campo
					switch(Campos[g].Tipo){
						case "Number" :
							if(!Number.isNaN(Number(Valor_Campo))) Valor_Campo = Number(Valor_Campo);
							break;
						case "Date" :
							var d = new Date(Valor_Campo.substr(4,4),Valor_Campo.substr(2,2),Valor_Campo.substr(0,2));
							Valor_Campo = d.toJSON();
							break;
						case "Money" :
							Valor_Campo = Number(Valor_Campo).toString();
							Valor_Campo = Number(Valor_Campo.substr(0,Valor_Campo.length-2)) + "." + Number(Valor_Campo.substr(Valor_Campo.length-2));
							Valor_Campo = Number(Valor_Campo);
							break;
					}
					Valores[n][Campos[g].Nome] = Valor_Campo;
					Posicao_Campo += Campos[g].Tamanho;
				}
				//O Resultado será contado a partir do final dessa guia
				Resultado = Resultado.substr(Posicao_Campo);					
			}
			/*  
				A esse ponto os dados de todas as guias do lote estão disponível em Valores
				O código abaixo exibe o conteúdo da guia na página inicial, portanto, pode ser alterado para outras necessidades
			*/
			
			var Serial = JSON.stringify(Valores);
			Serial = BeautifyJSON(Serial);
			document.getElementById('bloco_resposta').innerHTML += '<div class="bloco_header">'+http.getAllResponseHeaders().replace(/\n/gi,"<br>")+'</div>' + Serial;
			
		}else{ //Se não houver um Resultado do lote
			throw new Error("A consulta não retornou Resultados.");
			console.debug(callback);
			return;
		}
	}else{ //Se não houver uma Situação de Processamento
		throw new Error("A consulta não retornou uma Situação de Processamento.");
		console.debug(callback);
		return;
	}
}
/*
	Durante os testes, alguns estados retornaram dados inconsistentes ou incompatíveis com a quantidade delimitada de caracteres.
	Abaixo, estão alguns dos códigos utilizados para analisar e corrigir algumas dessas inconsistências.
	No futuro, essas soluções poderão ser avaliadas para serem aplicadas ou descartadas.
	
	var tryout = 10;
	if(Valores[n].UF_Favorecida=="RN"){
		while(resultado.substr(92,60).match(/[\s]{3,}[^\s^\n]+/gi)&&tryout>0){
			resultado = resultado.substr(0,92)+""+resultado.substr(92,60).replace(/([\s]{3,})([^\s^\n]+)/,function(a,b,c){ return b+" "+c })+""+resultado.substr(152);
			tryout--;
		}
	}
	var tryout = 10;
	if(Valores[n].UF_Favorecida=="BA"){
		resultado_backup = resultado;
		while(resultado.substr(912,4).replace(/\s{2,}/gi,"")!=d.getFullYear()&&tryout>0){
			resultado = resultado.substr(0,893)+resultado.substr(892);
			tryout--;
		}
	}				
	var tryout = 5;
	if(Valores[n].UF_Favorecida=="SC"){
		resultado_backup = resultado;
		if(resultado.length<1306){
			resultado = resultado.substr(0,543)+resultado.substr(542);
		}
	}
	
	if(Valores[n].UF_Favorecida=="PI"){
		resultado = resultado.substr(0,290)+""+resultado.substr(290);
	}
				
	var tryout = 10;
	while(resultado.substr(290,255).match(/[\s]{3,}[^\s^\n]+/gi)&&tryout>0){
		resultado = resultado.substr(0,290)+""+resultado.substr(290,255).replace(/([\s]{3,})([^\s^\n]+)/,function(a,b,c){ return b+" "+c })+""+resultado.substr(545);
		tryout--;
	}
	

*/













/*


	
GNRE={

 cidades:function (num){
	var estado=Array('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RN','RS','RO','RR','SC','SE','TO');
	popup(true);
	if(num==0){
		cidade = new Object();
		document.getElementById('pop_content').innerHTML="<h3>Listar Código das Cidades do Sistema GNRE</h3>"
	}
	document.getElementById('pop_content').innerHTML+="Buscando cidades de "+estado[num]+"<br>";
	setTimeout(function(){
		municipios=JSON.parse(GetPage("http://www.gnre.pe.gov.br/gnre/v/guia/municipios/"+estado[num],""));
		cidade[estado[num]]=new Object();
		for (var i = 0; i < municipios.length; i++){
			cidade[estado[num]][municipios[i].nome] = municipios[i].codigo;
		}
		document.getElementById('pop_content').innerHTML+="Cidades de "+estado[num]+" contabilizadas<br>";
		if(num<estado.length-1){ 
			setTimeout(function(){ lista_cidades_gnre(Number(num)+1); }, 500);
		}else{
			writefile('data/cidades.json',JSON.stringify(cidade));
			document.getElementById('pop_content').innerHTML+="Arquivo de cidades atualizado."					
		}
	},100);
}, boleto:function(dados_gnre,dados_nota){
	/*if(id.length==44){
		var dados_nota=DB.query("SELECT * FROM notas WHERE chave='"+id+"'");
		var numero_gnre=dados_nota[0].gnre;
	}else{
		var numero_gnre=id;
		var dados_gnre_banco = DB.query("SELECT * FROM timeline WHERE dado='"+id+"'");
		var dados_nota = DB.query("SELECT * FROM notas WHERE chave='"+dados_gnre_banco[0].chave+"'");
	}
	dados_gnre=GNRE.all.consultar(numero_gnre);*//*
	var numero_gnre = dados_gnre.gnre.lote;
	var banco_empresa = DB.query("SELECT * FROM empresas WHERE cnpj='"+dados_nota[0].emitente+"'");
	var template = File.Read('templates/boletognre.htm');
	
	var barcd=document.createElement('div');
	$(barcd).barcode(dados_gnre.boleto.representacao, "code128", {showHRI:false, barWidth: 1, barHeight: 40}); 
	barcd=barcd.innerHTML;
	
	barcd = barcd.replace(/WIDTH\: ([0-9]+)px;/g,function(a,b){ if(Number(b)>0){ b = Number(b) + Number(1); }  return "WIDTH: "+b+"px;"; })
//	barcd = barcd.replace(/BORDER-LEFT: ([^\s]+) ([0-9]+)px/g,function(a,c,b){ if(Number(b)>0){ b = Number(b) + Number(1); }  return "BORDER-LEFT: "+c+" "+b+"px"; })
	
	var datamatrixkey=document.createElement('div');
	$(datamatrixkey).barcode(dados_nota[0].chave, "datamatrix", {output:"css",moduleSize:"2",showHRI:false});
	datamatrixkey=datamatrixkey.innerHTML;
	
	template=template.replace("%TOTAL%",GNRE.formata.valor(dados_gnre.boleto.valor)).replace("%JUROS%",GNRE.formata.valor(dados_gnre.boleto.juros)).replace("%MULTA%",GNRE.formata.valor(dados_gnre.boleto.multa)).replace("%VALOR%",GNRE.formata.valor(dados_gnre.boleto.atualizacao));
	template=template.replace("%LINHACODIGO%",GNRE.formata.barcode(dados_gnre.boleto.representacao)).replace("%BARCODE%",barcd).replace("%N_CONTROLE%",dados_gnre.boleto.controle);
	template=template.replace("%VENC%",GNRE.formata.data(dados_gnre.boleto.vencimento)).replace("%N_GNRE%",numero_gnre).replace("%UF%",dados_gnre.gnre.uf);
	template=template.replace("%CNPJ_EMITENTE%",formatar.documento(Number(dados_gnre.gnre.emitente.documento))).replace("%CNPJ_DEST%",formatar.documento(Number(dados_nota[0].documento)));
	template=template.replace("%RECEITA%",dados_gnre.gnre.receita);
	template=template.replace("%DATAMATRIXKEY%",datamatrixkey);
	template=template.replace("%RAZAO_EMITENTE%",banco_empresa[0].razao);
	template=template.replace("%ENDERECO_EMITENTE%",banco_empresa[0].endereco);
	template=template.replace("%CIDADE_EMITENTE%",banco_empresa[0].cidade);
	template=template.replace("%UF_EMITENTE%",banco_empresa[0].uf);
	template=template.replace("%RAZAO_DEST%",dados_nota[0].razao);
	template=template.replace("%ENDERECO_DEST%",dados_nota[0].endereco);
	template=template.replace("%CIDADE_DEST%",dados_nota[0].municipio);
	template=template.replace("%UF_DEST%",dados_nota[0].uf);
	template=template.replace("%N_NF%",dados_nota[0].nf);
	template=template.replace("%SERIE_NF%",dados_nota[0].serie);
	template=template.replace("%CHAVE_NF%",dados_nota[0].chave);
	template=template.replace("%EMISSAO_NF%",formatar.data(dados_nota[0].dataemissao));
	template=template.replace("%OBS%",dados_gnre.gnre.complementar);
	template=template.replace("%EMISSAO%",formatar.data(dados_nota[0].dataemissao));
	return template;

}, formata:{
	data:function(data){
		return data.substr(0,2)+"/"+data.substr(2,2)+"/"+data.substr(4);
	},
	valor:function(val){
		val=Number(val);
		valor=val.toString();
		valor = valor.replace(/\D/gi,"");		
		if(valor=="0"){
			centavos = "00";
			inteiro = "0";
		}else{
			//valor = valor.substr(0,val.length-2)+","+val.substr(val.length-2);
			var centavos = valor.substr(valor.length-2,2);
			var inteiro = valor.substr(0,valor.length-2);
			var casas = inteiro.length-1;
			while(casas%3!=0&&casas>0) casas--;
			
			for(var n=0; n<casas/3 ;n++){
				var long = (inteiro.length)-(n+3+(3*n));
				inteiro = inteiro.substr(0,long)+"."+inteiro.substr(long);
			}
		}
		return inteiro+","+centavos;
	},
	barcode:function(brcd){
		brcd=brcd.substr(0,12)+"&nbsp;&nbsp;"+brcd.substr(12,12)+"&nbsp;&nbsp;"+brcd.substr(24,12)+"&nbsp;&nbsp;"+brcd.substr(36);
		return brcd;
	}
}*/