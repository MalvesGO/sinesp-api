var crypto = require('crypto');
var express = require('express');
var requests = require('request');
var parseXML = require('xml2js').parseString;
const uuidV4 = require('uuid/v4');

var app = express();
var port = process.env.PORT || 8080;
var router = express.Router();

router.get('/consultaPlaca', function(req, res) {

	/** Verifica se a placa foi informada */
	if (!req.query.placa) {
		res.json({ error: 'Informe o parâmetro placa.' });
	} else {
		var placa = req.query.placa;
	}

	/** Chave secreta para criptografia */
	var secret = 'TRwf1iBwvCoSboSscGne';

	/** Criptografa a placa usando a chave do aplicativo */
	var token = crypto.createHmac('sha1', placa+secret).update(placa).digest('hex');

	/** Gerar a data da requisição */
	var data = new Date().toISOString().replace("T", " ").substr(0, 19);

	/** Cria o XML de chamada do serviço SOAP */
	var xml = '<?xml version=\'1.0\' encoding=\'UTF-8\'?>\
	<v:Envelope xmlns:i="http://www.w3.org/2001/XMLSchema-instance"\
	xmlns:d="http://www.w3.org/2001/XMLSchema" xmlns:c="http://schemas.xmlsoap.org/soap/encoding/"\
	xmlns:v="http://schemas.xmlsoap.org/soap/envelope/">\
	  <v:Header>\
	    <b>motorola XT1635-02</b>\
	    <c>ANDROID</c>\
	    <d>7.0</d>\
	    <e>4.1.5</e>\
	    <f>192.168.0.100</f>\
	    <g>'+token+'</g>\
	    <h>0.0</h>\
	    <i>0.0</i>\
	    <k/>\
	    <l>'+data+'</l>\
	    <m>8797e74f0d6eb7b1ff3dc114d4aa12d3</m>\
	  </v:Header>\
	  <v:Body>\
	    <n0:getStatus xmlns:n0="http://soap.ws.placa.service.sinesp.serpro.gov.br/">\
	      <a>'+placa+'</a>\
	    </n0:getStatus>\
	  </v:Body>\
	</v:Envelope>';

	/** Montagem dos cabeçalhos da requisição */
	var headers = {
		"User-Agent": "ksoap2-android/2.6.0+",
		"SOAPAction": "",
		"Content-type": "text/xml;charset=UTF-8",
		"Accept-Encoding": "gzip",
		"Content-length": xml.length,
		"Host": "sinespcidadao.sinesp.gov.br",
		"Connection": "Keep-Alive"
	};

	/** Tenta realizar a requisição */
	try {

		requests.post({
				rejectUnauthorized: false,
				headers: headers,
				url: 'https://sinespcidadao.sinesp.gov.br/sinesp-cidadao/mobile/consultar-placa',
				body: xml
			}, function(error, response, body){

				console.log(body);

				/** Se não ocorrer nenhum erro */
				if (error===null) {
					/** Faz o parse do XML recebido */
					parseXML(body, {
						explicitArray: false
					}, function (err, result) {
						resultado = result['soap:Envelope']['soap:Body']['ns2:getStatusResponse']['return'];
					});

					/** Retorna para o browser o resultado final */
					res.json(resultado);
				/** Retorna o erro que ocorreu na chamada (se houve) */
				} else {
					res.json({ error: error });
				}
			}
		);

	} catch (err) {
		/** Retorna erro se não conseguir fazer a requisição do SOAP por qualquer motivo */
		res.json({ error: err });
	}

});

app.use('/api', router).listen(port);
console.log('Servidor rodando na porta ' + port);