Progress = {
	upload : function(e){
		if(e.lengthComputable) var Porcentagem = Math.round((e.loaded * 100) / e.total) + "%";
		else var Porcentagem = "";
		document.getElementById('request_status').innerHTML = "Enviando "+Porcentagem;
	},download:function(e){
		if(e.lengthComputable) var Porcentagem = Math.round((e.loaded * 100) / e.total) + "%";
		else var Porcentagem = "";
		document.getElementById('request_status').innerHTML = "Recebendo "+Porcentagem;
	}, end:function(){
		document.getElementById('request_status').innerHTML = "Pronto";
	}	
}

function BeautifyJSON(json){
	
	json = json.replace(/"([^\"]+?)":/gi,function(a,b){ return '<br><div class="json_string">'+b+'</div> : '; });
	json = json.replace(/\{/gi,'<div class="json_cr_bracket">{</div><div class="json_block">');
	json = json.replace(/\}/gi,'<div class="json_cr_bracket">}</div></div>');
	json = json.replace(/\[/gi,'<div class="json_sq_bracket">[</div><div class="json_block">');
	json = json.replace(/\]/gi,'<div class="json_sq_bracket">]</div></div>');
	json = json.replace(/: ([^,"]+),/gi,function(a,b){ return ': <div class="json_number">'+b+'</div>,'; });
	
	return json;
}