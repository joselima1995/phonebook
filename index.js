require("dotenv").config();
const express = require('express')
const app = express()
const morgan = require('morgan')
app.use(express.json())
app.use(express.static('dist')) 

// app.use(morgan('tiny'))


app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}));

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
 

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_CLIENT).then(()=>{
  console.log("connection established");  
}).catch(err => {
  console.log("connection with mongo failed"); 
}); 

const Person = require('./modules/person')

app.get("/api/people", async (req, res, next)=>{
    console.log("/api/people");
    try {
      const people = await Person.find({});
      res.json(people);
    } catch (error) {
      next(error);
    }
  
})

app.get("/api/info",async  (req, res, next)=>{
    const people = await Person.find({});
    const currentDate = new Date();
    res.send(`<p>Phonebook has info for ${people.length} people</p>
            ${currentDate}`); 
})

app.get("/api/people/:id", async (req, res, next)=>{
    console.log("get id: " + req.params.id);
    const id = req.params.id;
    try {
      const person = await Person.findById(id);
      if(person)
        res.json(person);
      else 
        res.status(404).end();
    } catch (error) {
      next(error);
    }

})

app.delete("/api/people/:id", async (req, res, next)=>{
    console.log("delete id: " + req.params.id);
    const id = req.params.id;
    try {
      const deletedPerson = await Person.findByIdAndDelete(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
    
})

app.post("/api/people", async (req, res, next) => {
    console.log("post : " , req.body);  
    if(!req.body || !req.body.name || !req.body.number)
        return res.status(400).end();
    // const nameExists = await Person.findOne({name: req.body.name}, {_id:1});
    // console.log("nameExists: ", nameExists);
    // if(nameExists)
    //     return res.status(400).send({error: 'name must be unique'});
  
    const newPerson = new Person({ 
        name: req.body.name,
        number: req.body.number
    })
    try {
      const createdPerson = await newPerson.save();
      res.json(createdPerson);
    } catch (error) {
      next(error);
    }  
}) 

app.put("/api/people/:id", async (req, res, next)=>{
  console.log("put: ", req.body);
  if(!req.body || !req.body.number) 
    return res.status(400).end();

  const number = req.body.number;
  const id = req.params.id;
  try {
    const person = await Person.findByIdAndUpdate(id, {number: number}, {new: true});
    if(person){
      res.json(person);
    }else{
      return res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)




// let persons = [
//     { 
//       "id": "1",
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": "2",
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": "3",
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": "4",
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]