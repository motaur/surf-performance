//npm i -g nodemon; start CLI: nodemon app
// nodemon src/app/tools/apiServer.js

//imports
// const Joi = require('joi');         // input validation  ---> npm i joinpm
const express = require('express'); //npm i express
const bodyParser = require('body-parser');  //npm i body-parser
const garminApi = require('garmin-api-handler')

const { GarminConnect } = require('garmin-connect');
// Create a new Garmin Connect Client
// const GCClient = new GarminConnect();


//============= SERVER ===============//
const port = process.env.PORT || 3000;
const app = express();
//Here we are configuring express to use body-parser as middle-ware.
//app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Listen to port 3000
app.listen(port, () => console.log(`Dev app listening on port ${port}!`) );

//============= CONTROLLERS ===============//

app.get('/api/login/', async (req, res) => {
  // Uses credentials from garmin.config.json or uses supplied params
  // await GCClient.login('berlinkovlev@gmail.com', 'Ga36963696!');
  // let a = await GCClient.getUserInfo().emailAddres
  // console.log(a)
  let api = new garminApi.GarminApi()
  console.log(api)
  api.login('', '').then((res) => res.send(res)).catch(err => res.send(err))

});


app.get('/api/activities/', async (req, res) =>{
  res.send(await GCClient.getActivities())
});
