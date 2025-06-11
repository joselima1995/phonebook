const express = require('express')
const app = express()
const morgan = require('morgan')
app.use(express.json())
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

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get("/api/persons", (req, res)=>{
    console.log("/api/persons");
    res.json(persons);
})

app.get("/api/info", (req, res)=>{
    console.log("/api/info");
    const currentDate = new Date();
    res.send(`<p>Phonebook has info for ${persons.length} people</p>
            ${currentDate}`);
})

app.get("/api/persons/:id", (req, res)=>{
    console.log("get id: " + req.params.id);
    const id = req.params.id;
    const person = persons.find(person => person.id === id);
    if(person)
        res.json(person);
    else 
        res.status(404).end();
})

app.delete("/api/persons/:id", (req, res)=>{
    console.log("delete id: " + req.params.id);
    const id = req.params.id;
    persons = persons.filter(person => person.id !== id);
    res.status(204).end();
})

app.post("/api/persons", (req, res) => {
    console.log("post : " , req.body);  
    if(!req.body || !req.body.name || !req.body.number)
        return res.status(400).end();
    const nameExists = persons.some(person => person.name === req.body.name);
    if(nameExists)
        return res.status(400).send({error: 'name must be unique'});

    const id = generateId();
    console.log("generated id: " + id);
    const newPerson = {
        id: id,
        name: req.body.name,
        number: req.body.number
    }
    persons.push(newPerson);
    res.json(newPerson);
})

const generateId = () => {
    const id = persons.length > 0?
        Math.max(...persons.map(person => parseInt(person.id))) + 1 : 0
    return String(id);
}
