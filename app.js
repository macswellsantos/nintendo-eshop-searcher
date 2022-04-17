const express = require('express')
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const path = require('path')
const { getGamesBrazil, getQueriedGamesBrazil, getShopsByCountryCodes} = require('nintendo-switch-eshop');
const { lookup } = require('country-data')

const app = express();

//Configurations
  //dotenv
    require('dotenv').config();
  // Template Engine
    app.engine('handlebars', engine({defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
      isZero : (value) =>{
        return value === 0;
      }
    }  
  }))
    app.set('view engine', 'handlebars')
  // Body Parser
    app.use(bodyParser.urlencoded({extended: false}))
    app.use(bodyParser.json())
  // Public
    app.use(express.static(path.join(__dirname, 'public')))


    //routes

  app.get('/', async (req, res)=> {
    var games = await getGamesBrazil()
    games = games.sort(GetSortOrder("title"));
    res.render('home', {games: games})
  })

  app.get('/low', async (req, res)=> {
    var games = await getGamesBrazil()
    games = games.sort(GetSortOrder("msrp")).filter(function(el, index) {
      return el.msrp !== 0 && el.msrp !== null
    });
    res.render('home', {games: games})
  })

  
  app.get('/sale', async (req, res)=> {
    var games = await getGamesBrazil()
    games = games.filter(function(el, index) {
      return el.salePrice !== null && el.priceRange !== null
    }).sort(GetSortOrder("salePrice"));
    res.render('home', {games: games})
  })

  app.get('/high', async (req, res)=> {
    var games = await getGamesBrazil()
    games = games.sort(GetSortOrderDesc("msrp"));
    res.render('home', {games: games})
  })

  app.post('/search', async (req, res)=> {
    const item = req.body.item
    console.log(item)
    var games 
    
    try {
      games = await getQueriedGamesBrazil(item)
      games = games.sort(GetSortOrder("title"));
      res.render('home', {games: games})
    } catch(error) {
      console.log("Error: "+error)
      res.render("home", {games:null})
    }
    
  })
 
  app.get('/free', async(req, res) => {
    var games = await getGamesBrazil()
    games = games.filter(function(el, index) {
      return el.msrp === 0
    }).sort(GetSortOrder("title"));
    res.render('home', {games: games})
  })

  app.get('/teste', async (req, res) => {
    const data = await getShopsByCountryCodes(['BR'],'70010000000185',1)

    res.send(data)
  })

  app.get('/list', async (req, res)=> {
    var games = await getGamesBrazil()
    games = games.sort(GetSortOrder("title"));
    res.render('list-search', {games: games})
  })

  app.get('/details/:id', async (req, res)=> {
    const item = req.params.id
    var games = await getQueriedGamesBrazil(item)
    res.render('details', {games: games})
  })

//Comparer Function    
  function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a[prop] > b[prop]) {    
            return 1;    
        } else if (a[prop] < b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
  }
  
  function GetSortOrderDesc(prop) {    
    return function(a, b) {    
        if (a[prop] < b[prop]) {    
            return 1;    
        } else if (a[prop] > b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
  }
  

//Server initializer
  const port = process.env.PORT || 8080
  app.listen(port, () => {
     console.log("Server running on port " + port);
  })