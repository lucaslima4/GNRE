var Lote = new Object;

function ParseXML(){

    /* Abrir XML da Nota Fiscal e parsear */
    var RawXML = document.getElementById('campo_send_lote').value;

    if (window.DOMParser){
        with(new DOMParser())
            var XML = parseFromString(RawXML, "text/xml");
    }else{ // Internet Explorer
        XML = new ActiveXObject("Microsoft.XMLDOM");
        XML.async = false;
        XML.loadXML(RawXML);
    }

    var DadosXML = { ICMSTot:{}, ide:{}, emit:{enderEmit:{}}, dest:{enderDest:{}} };

    /*Pegar dados do Emitente*/
    var XMLEmit = XML.getElementsByTagName("emit");
    if(XMLEmit.length>0){
        for(var c=0;c<XMLEmit[0].childNodes.length;c++){
            var Child = XMLEmit[0].childNodes[c];
            if(Child.tagName!="enderEmit") DadosXML.emit[Child.tagName] = Child.innerHTML;
        }
        /* Pegar dados de endereço do Emitente */
        var enderEmit = XMLEmit[0].getElementsByTagName("enderEmit");
        if(enderEmit.length>0){
            for(var c=0;c<enderEmit[0].childNodes.length;c++){
                var Child = enderEmit[0].childNodes[c];
                DadosXML.emit.enderEmit[Child.tagName] = Child.innerHTML;
            }
        }else{
            throw new Error("XML não contém o campo <enderEmit>");
            return;
        }				
    }else{
        throw new Error("XML não contém o campo <emit>");
        return;
    }
    /*Pegar dados do Destinatário*/
    var XMLDest = XML.getElementsByTagName("dest");
    if(XMLDest.length>0){
        for(var c=0;c<XMLDest[0].childNodes.length;c++){
            var Child = XMLDest[0].childNodes[c];
            if(Child.tagName!="enderDest") DadosXML.dest[Child.tagName] = Child.innerHTML;
        }
        /* Pegar dados de endereço do Destinatário */
        var enderDest = XMLDest[0].getElementsByTagName("enderDest");
        if(enderDest.length>0){
            for(var c=0;c<enderDest[0].childNodes.length;c++){
                var Child = enderDest[0].childNodes[c];
                DadosXML.dest.enderDest[Child.tagName] = Child.innerHTML;
            }
        }else{
            throw new Error("XML não contém o campo <enderDest>");
            return;
        }
    }else{
        throw new Error("XML não contém o campo <dest>");
        return;
    }

    /*Pegar dados do IDE*/
    var XMLIde = XML.getElementsByTagName("ide");
    if(XMLIde.length>0){
        for(var c=0;c<XMLIde[0].childNodes.length;c++){
            var Child = XMLIde[0].childNodes[c];
            DadosXML.ide[Child.tagName] = Child.innerHTML;
        }
    }else{
        throw new Error("XML não contém o campo <ide>");
        return;
    }
    
     /*Pegar dados do Total de valores*/
    var ICMSTot = XML.getElementsByTagName("ICMSTot");
    if(ICMSTot.length>0){
        for(var c=0;c<ICMSTot[0].childNodes.length;c++){
            var Child = ICMSTot[0].childNodes[c];
            DadosXML.ICMSTot[Child.tagName] = Child.innerHTML;
        }
    }else{
        throw new Error("XML não contém o campo <ICMSTot>");
        return;
    }

    var chNFe = XML.getElementsByTagName("chNFe");
    if(chNFe.length>0){
        DadosXML.chNFe = chNFe[0].innerHTML;
    }else{
        throw new Error("XML não contém o campo <chNFe>");
        return;
    }
    console.log(DadosXML);
    EnviaLote([DadosXML]);
}





function EnviaLote(Dados){
    /*
        Os dados recebidos para a emissão da GNRE seguem o padrão do XML da Nota.
    */		

    var RawXML = '<?xml version="1.0" encoding="utf-8" standalone="yes"?>'+
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
        '<soap:Header>'+
        '<gnreCabecMsg xmlns="http://www.gnre.pe.gov.br/webservice/GnreLoteRecepcao">'+
        '<versaoDados>1.00</versaoDados>'+
        '</gnreCabecMsg>'+
        '</soap:Header>'+
        '<soap:Body>'+
        '<gnreDadosMsg xmlns="http://www.gnre.pe.gov.br/webservice/GnreLoteRecepcao">'+
        '<TLote_GNRE xmlns="http://www.gnre.pe.gov.br">'+
        '<guias></guias>'+
        '</TLote_GNRE>'+
        '</gnreDadosMsg>'+
        '</soap:Body>'+
        '</soap:Envelope>';

    //Parsear a String acima em um XML
    if (window.DOMParser){
        var parser = new DOMParser();
        var XML = parser.parseFromString(RawXML, "text/xml");
    }else{ // Internet Explorer
        XML = new ActiveXObject("Microsoft.XMLDOM");
        XML.async = false;
        XML.loadXML(RawXML);
    }

    for(var Guia_Num = 0;Guia_Num<Dados.length;Guia_Num++){

        /*
        /    --------------------------- Preparar os dados para envio ---------------------------
        /
        /    Calcular data do vencimento para 2 dias a frente
        /    Caso o vencimento seja no mês seguinte, o sistema automaticamente retorna os dias, colocando o último dia do mês como vencimento.
        */

        //Selecionar quantidade de dias de cada mês e avaliar se o ano é bissexto
        var Dias_Meses = Array(0,31,28,31,30,31,30,31,31,30,31,30,31);
        if(new Date(new Date().getFullYear(), 1, 29).getMonth() == 1) Dias_Meses[2] = 29;

        var d = new Date(),DiaVenc,MesVenc,AnoVenc;
        if(d.getDate()+2>Dias_Meses[d.getMonth()+1]){
            DiaVenc = zero(d.getDate()+2-Dias_Meses[d.getMonth()+1]);
            MesVenc = zero(d.getMonth()+2);
            if(MesVenc > 12){
                MesVenc = "01";
                AnoVenc=d.getFullYear()+1;
            }else{
                AnoVenc=d.getFullYear();
            }
        }else{
            DiaVenc = zero(d.getDate()+2);
            MesVenc = zero(d.getMonth()+1);
            AnoVenc = d.getFullYear();
        }
        if(MesVenc != zero(d.getMonth()+1)){
            MesVenc = zero(d.getMonth()+1);
            DiaVenc = Dias_Meses[Number(d.getMonth()+1)];
        }

        var dataVencimento = AnoVenc+"-"+MesVenc+"-"+DiaVenc;
        var dataPagamento = AnoVenc+"-"+MesVenc+"-"+DiaVenc;

        /* Variáveis selecionáveis */
                
        var produto = "33";
        var receita = "100099";
        var tipoDocOrigem = "10"; //10 para Nota Fiscal
        var uf = Dados[Guia_Num].dest.enderDest.UF;
        var tipoIdentificacaoEmitente = '1'; //Emitente possui CNPJ (1)
        var convenio = "0";
        var periodo = "0"; //Período Mensal
            
        /* Definir Códigos do Município */
        
        var municipioEmitente = Dados[Guia_Num].emit.enderEmit.cMun.substr(2);
        var municipioDestinatario = Dados[Guia_Num].dest.enderDest.cMun.substr(2);
        
        /* Definir documento do Emitente */
        if(tipoDocOrigem=="10")        
            var docOrigem = Dados[Guia_Num].ide.nNF;
            
        if("CNPJ" in Dados[Guia_Num].dest) //Se o destinatário possuir um CNPJ
            var tipoIdentificacaoDestinatario = "1";
        else if("CPF" in Dados[Guia_Num].dest) //Se o destinatário possuir um CPF
            var tipoIdentificacaoDestinatario = "2";
        
        /*Criação da Guia*/
        
        var Guia = document.createElementNS(Ns1,"TDadosGNRE");
        XML.getElementsByTagName("guias")[0].appendChild(Guia);

        for(var e=0;e<EnviaLote_Campos.length;e++){  //Enquanto houver campos para serem incluídos

            if(!(EnviaLote_Campos[e].Tag in EnviaLote_Receitas[uf].Receitas[receita].Campos) ||
               EnviaLote_Campos[e].Tag in EnviaLote_Receitas[uf].Receitas[receita].Campos && EnviaLote_Receitas[uf].Receitas[receita].Campos[EnviaLote_Campos[e].Tag] === true){

                // Criar a Tag usando o NameSpace padrão
                var Tag = document.createElementNS(Ns1,EnviaLote_Campos[e].Tag);

                if("CampoXML" in EnviaLote_Campos[e]){
                    console.log(EnviaLote_Campos[e].CampoXML);
                    var Variavel = 'Dados[Guia_Num]';
                    
                    EnviaLote_Campos[e].CampoXML.split(".").forEach(function(child){
                        Variavel += '["'+child+'"]';
                    });
                    
                    try{
                        Tag.innerHTML = eval(Variavel);
                    }catch(e){
                         console.warn("O campo '"+EnviaLote_Campos[e].Tag+"' solicitou uma variável inexistente: '"+Variavel+"'");
                    }

                }else if("Valor" in EnviaLote_Campos[e]){
                    try{
                        Tag.innerHTML = eval(EnviaLote_Campos[e].Valor.toString());
                    }catch(e){
                         console.warn("O campo '"+EnviaLote_Campos[e].Tag+"' solicitou uma variável inexistente: '"+EnviaLote_Campos[e].Valor+"'");
                    }
                }
                
                if("Parent" in EnviaLote_Campos[e]){
                    var Parent = Guia.getElementsByTagName(EnviaLote_Campos[e].Parent);
                    if(Parent.length > 0)
                        Parent[0].appendChild(Tag);
                    else
                        console.warn("O campo '"+EnviaLote_Campos[e].Tag+"' tem como elemento pai '"+EnviaLote_Campos[e].Parent+"', que não está no XML");
                }else{
                    Guia.appendChild(Tag);
                }
            }
        }

        // Acrescentar campos extras exigidos pela Receita selecionada
        
        if("Campos_Adicionais" in EnviaLote_Receitas[uf].Receitas[receita]){
        
            for(var x=0;x<EnviaLote_Receitas[uf].Receitas[receita].Campos_Adicionais.length;x++){
                var Campo_Adicional = EnviaLote_Receitas[uf].Receitas[receita].Campos_Adicionais[x];
                if(Campo_Adicional.Uso === true){
                    if("Valor" in Campo_Adicional){
                        Tag = document.createElementNS(Ns1,"campoExtra");

                        with(campoExtra_Codigo = document.createElementNS(Ns1,"codigo")) innerHTML = Campo_Adicional.Codigo;
                        Tag.appendChild(campoExtra_Codigo);

                        with(campoExtra_Tipo = document.createElementNS(Ns1,"tipo")) innerHTML = Campo_Adicional.Tipo;
                        Tag.appendChild(campoExtra_Tipo);

                        with(campoExtra_Valor = document.createElementNS(Ns1,"valor")) innerHTML = eval(Campo_Adicional.Valor);
                        Tag.appendChild(campoExtra_Valor);

                        Guia.getElementsByTagName('c39_camposExtras')[0].appendChild(Tag);
                    }
                }
            }
        }
        
        /* Acrescentar informações adicionais */
        
        
        // Incluir o documento do Destinatário
        var Tag_idContribuinteDestinatario = Guia.getElementsByTagName('c35_idContribuinteDestinatario');
        if(Tag_idContribuinteDestinatario.length > 0){
            if("CNPJ" in Dados[Guia_Num].dest) //Se o destinatário possuir um CNPJ
                with(Tag = document.createElementNS(Ns1,"CNPJ"))
                    innerHTML = Dados[Guia_Num].dest.CNPJ;
            else if("CPF" in Dados[Guia_Num].dest) //Se o destinatário possuir um CPF
                with(Tag = document.createElementNS(Ns1,"CPF"))
                    innerHTML = Dados[Guia_Num].dest.CPF;            
            
            Tag_idContribuinteDestinatario[0].append(Tag);
        }
        
        // Incluir o documento do Emitente
        var Tag_idContribuinteEmitente = Guia.getElementsByTagName('c03_idContribuinteEmitente');
        if(Tag_idContribuinteEmitente.length > 0){
            if("CNPJ" in Dados[Guia_Num].emit) //Se o emitente possuir um CNPJ
                with(Tag = document.createElementNS(Ns1,"CNPJ"))
                    innerHTML = Dados[Guia_Num].emit.CNPJ;
            
            Tag_idContribuinteEmitente[0].append(Tag);
        }
        
        
        /* Retirar TAGs vazias */
        
        for(var g=0;g<Guia.childNodes.length;g++){
            if(Guia.childNodes[g].childNodes.length == 0){
                Guia.removeChild(Guia.childNodes[g]);
            }
        }
        
        /* Retirar tag <c17_inscricaoEstadualEmitente> caso a UF de origem seja diferente da UF de destino */
        
        if(Dados[Guia_Num].emit.enderEmit.UF != Dados[Guia_Num].dest.enderDest.UF)
            Guia.removeChild(Guia.getElementsByTagName("c17_inscricaoEstadualEmitente")[0]);
        
    }
    
    /* Serializar o XML e enviar a requisição */
    with(new XMLSerializer()) var soapRequest = serializeToString(XML);
    Request(EnviaLote_Url,"processar",soapRequest,"EnviaLote_Callback");
}





function EnviaLote_Callback(xhr){

    /* Função para lidar com o retorno da requisição SOAP */

    var XML = xhr.responseXML;
    var Envia_Situacao = XML.getElementsByTagNameNS(Ns1,"situacaoRecepcao");

    if(Envia_Situacao.length > 0){
        var Codigo_Situacao = Envia_Situacao[0].childNodes[0].innerHTML;

        if(Codigo_Situacao != 100){ //Se o código retornado não for 402 (Sucesso)
            var Descricao_Situacao = Envia_Situacao[0].childNodes[1].innerHTML;
            throw new Error("Situação "+Codigo_Situacao+" - "+Descricao_Situacao);
            return;
        }
        
        var Recibo = XML.getElementsByTagNameNS(Ns1,"recibo");
                
        if(Recibo.length > 0){
                        
            var Recibo_Numero = Recibo[0].getElementsByTagNameNS(Ns1,"numero")[0].innerHTML;
            var Recibo_Data = Recibo[0].getElementsByTagNameNS(Ns1,"dataHoraRecibo")[0].innerHTML;
            var Recibo_Tempo_Processamento = Number(Recibo[0].getElementsByTagNameNS(Ns1,"tempoEstimadoProc")[0].innerHTML);
            
            /*
                A esse ponto, os dados de retorno da Guia já estão disponíveis. O site irá realizar o processamento e deve retornar no tempo estimado em Recibo_Tempo_Processamento
                
                A partir do tempo de processamento, pode-se consultar a guia para receber os dados completos.
                
                O código abaixo consulta a guia no tempo estimado, portanto, pode ser alterado para outras necessidades
            */
            
            document.getElementById('campo_request_lote').value = Recibo_Numero;
            document.getElementById('campo_request_lote').disbaled = true;
            
            setTimeout(function(){
                    document.getElementById('campo_request_lote').disbaled = false;
                    ConsultaLote();
                }
                       ,Recibo_Tempo_Processamento);
            
        }else{
            throw new Error("A resposta retornada não contém o campo 'Recibo'");
            return;
        }
        
    }else{ //Se não houver uma Situação de Processamento
        throw new Error("A consulta não retornou uma Situação de Processamento.");
        console.debug(callback);
        return;
    }

}