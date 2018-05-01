function ConsultaLote(){
	
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
					'<ambiente>'+Ambiente+'</ambiente>'+
					'<numeroRecibo>'+Lote+'</numeroRecibo>'+			
				'</TConsLote_GNRE>'+
				'</gnreDadosMsg>'+
			'</soap:Body>'+
		'</soap:Envelope>';
		
    
        document.getElementById('bloco_resposta').innerHTML += '<textarea>'+soapRequest+'</textarea>';
    
		Request(ConsultaLote_Url,"consultar",soapRequest,"ConsultaLote_Callback");
}


function ConsultaLote_Callback(xhr){
		
	/* Função para lidar com o retorno da requisição SOAP */
	
	var XML = xhr.responseXML;
	var Consultar_Situacao = XML.getElementsByTagNameNS(Ns1,"situacaoProcess");
	    
	if(Consultar_Situacao.length>0){ //Se houver uma Situação de Processamento
		
		var Codigo_Situacao = Consultar_Situacao[0].childNodes[0].innerHTML;
					
		if(Codigo_Situacao != 402 && Codigo_Situacao != 403){ //Se o código retornado não for 402 (Sucesso) ou 403 (Sucesso com restrições)
			var Descricao_Situacao = Consultar_Situacao[0].childNodes[1].innerHTML;
			console.warn("Situação "+Codigo_Situacao+" - "+Descricao_Situacao);
            return;
		}
		
		var Resultado_Lote = XML.getElementsByTagNameNS(Ns1,"resultado");
		
		if(Resultado_Lote.length>0){ //Se houver um Resultado do lote
		  
            var Valores = {Guias:{}};
            
			var Resultado_Split = new String(Resultado_Lote[0].innerHTML).split(/\n/);
                        
            for(var r = 0;r<Resultado_Split.length;r++){
                var Tipo_Resposta = Resultado_Split[r].substr(0,1);
                var Parsed_Resposta = ConsultaLote_Parse(Resultado_Split[r]);
                
                if(Parsed_Resposta.Nome == "Guia")
                    Valores.Guias[Parsed_Resposta.Sequencial_Guia] = Parsed_Resposta;
                else if(Parsed_Resposta.Nome == "Rejeicao")
                    Valores.Guias[Parsed_Resposta.Sequencial_Guia].Rejeicao = Parsed_Resposta;                    
                else
                    Valores[Parsed_Resposta.Nome] = Parsed_Resposta;
            }
            
            
			/*  
				A esse ponto os dados de todas as guias do lote estão disponível no objeto Valores
				O código abaixo exibe o conteúdo da guia na página inicial, portanto, pode ser alterado para outras necessidades
			*/
			
			var Serial = JSON.stringify(Valores);
			Serial = BeautifyJSON(Serial);
			with(document.getElementById('bloco_resposta'))
                innerHTML = '<div class="bloco_header">'+http.getAllResponseHeaders().replace(/\n/gi,"<br>")+'</div>' + Serial + innerHTML;
			
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

function ConsultaLote_Parse(Conteudo){
    
    var TipoConteudo = Conteudo.substr(0,1);
    
    /*Checar se o Tipo de Conteúdo é um dos tipos válidos, como descrito no JSON ConsultaLote_Rules */
    if(!ConsultaLote_Campos[TipoConteudo]){
        throw new Error("O tipo de conteúdo "+TipoConteudo+" não foi encontrado");
		console.debug(Conteudo);
		return;
    }
    
    var Valores = { Nome:ConsultaLote_Campos[TipoConteudo].Nome };
    var Posicao_Campo = 0;
    
    /* Checar se a string enviada possui o tamanho esperado de caracteres */
    if(ConsultaLote_Campos[TipoConteudo].Tamanho != Conteudo.length){
        throw new Error("O "+ConsultaLote_Campos[TipoConteudo].Nome+" retornado deve possuir "+ConsultaLote_Campos[TipoConteudo].Tamanho+" caracteres, porém, foi retornado contendo "+Conteudo.length);
		console.debug(Conteudo);
		return;
    }
    
    for(var g=0;g<ConsultaLote_Campos[TipoConteudo].Campos.length;g++){
        
        var Campo = ConsultaLote_Campos[TipoConteudo].Campos[g];
        
        var Valor_Campo = Conteudo.substr(Posicao_Campo,Campo.Tamanho);
        
        Valor_Campo = Valor_Campo.replace(/[\s]{2,}/gi,""); //Retirar espaços extras do valor do campo
        
        switch(Campo.Tipo){
            case "Number" :
                if(!Number.isNaN(Number(Valor_Campo))) Valor_Campo = Number(Valor_Campo);
                break;
            case "Text" :
                Valor_Campo = Valor_Campo.replace(/#@#/gi,"\n");
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
            case "Document" :
                Valor_Campo = Number(Valor_Campo).toString();
                if(Valor_Campo.length > 11 && Valor_Campo < 14)
                    while(Valor_Campo.length < 14) Valor_Campo = "0" + Valor_Campo; 
                else if(Valor_Campo.length < 11)
                    while(Valor_Campo.length < 11) Valor_Campo = "0" + Valor_Campo;
                break;
        }
        
        Valores[Campo.Nome] = Valor_Campo;
        
        /* Verificar se há uma legenda para descrever o valor do campo */
        if(Legendas.ConsultaLote[Campo.Nome])
            if(Legendas.ConsultaLote[Campo.Nome][Valor_Campo])
                Valores["Legenda_"+Campo.Nome] = Legendas.ConsultaLote[Campo.Nome][Valor_Campo];
            else
                console.warn("Há um registro de legenda para o campo '"+Campo.Nome+"', porém seu valor não possui uma descrição válida.");
        
        /* Atualizar a posição */
        Posicao_Campo += ConsultaLote_Campos[TipoConteudo].Campos[g].Tamanho;
    }
    return Valores;				
}