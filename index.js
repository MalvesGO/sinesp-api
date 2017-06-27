var sinesp = require('sinesp-nodejs');
var express = require('express');
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

	sinesp.consultaPlaca(placa, function (retorno) {
	    res.json(retorno);
	});

});

app.use('/api', router).listen(port);
console.log('Servidor rodando na porta ' + port);