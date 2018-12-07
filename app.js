var express = require('express'); //Varíavel para utilização do framework express
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');   //Varíavel para conectar ao banco de dados MongoDB

//var dbConn = mongodb.MongoClient.connect('mongodb://localhost:27017'); // Inicializa a conexão com banco de dados

var app = express();

mongodb.MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  if (err) return console.log(err)
  db = client.db('test') // coloque o nome do seu DB

  app.listen(3000, () => {
    console.log('Server running on port 3000')
  })
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, '/../public'))); //Criando arquivos estásticos do Express


// Acessar página Principal
app.get('/',  function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});


//app.post('/post-cadastro', function (req, res) {
//    dbConn.then(function(db) {
//        delete req.body._id; // delete do ID da requisição por questões de segurança
//        db.collection('noites').insertOne(req.body);
//    });    
//    res.send('Data received:\n' + JSON.stringify(req.body));
//});
app.post('/post-cadastro', function(req, res) {
  db.collection('noites').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('Objeto Salvo no Banco de Dados com Sucesso')
    res.redirect('/view-cadastros')
  })
});


app.get('/view-cadastros',  function(req, res) {
	db.collection('noites').find({}, { projection: { _id: 0, nome: 1, "localizacao.coordinates": 1} }).toArray((err, results) => {
    	if (err) return console.log(err)
    		res.status(200).json(results);
    	//res.render('show.ejs', { data: results })
  	})
 //   dbConn.then(function(db) {
 //       db.collection('noites').find({}).then(function(noites) {
 //           res.status(200).json(noites);
 //       }).catch(function (errors) {
 //       	res.status(400).json(errors);
 //       });
 //   });
});

app.get('/return-local',  function(req, res) {
db.collection('noites').aggregate(
    [
        { "$geoNear": {
            "near": {
                "type": "Point",
                "coordinates": [-26.304331, -48.848721]
            },
            "spherical": true,
            "distanceField": "distance"
        }},
        { $group:
        {   _id: "$_id",
            nome: { '$first': '$nome' },
            distance: { $first: "$distance" }
        }
        },
        { $project : {
        	_id: 0,
            nome: 1,
            distance: 1,
        }},
        { "$sort": { "distance": 1 } }
    ]).toArray((err, results) => {
    //function(error, places) {
        if (err) return console.log(err)
        res.status(200).json(results);
    })
});
//app.get('/return-local',  function(req, res) {
//	db.collection('noites').aggregate([
//{
//	$geoNear : {
//		near : {
//			coordinates: [-26.304331,-48.848721],
//			type : "Point"
//		},
//		distanceField : "distancia.calculada",
//		spherical : true,
//		num : 3
//	}
//}
//])

//app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0' );