const express = require ('express');
const mongoose = require ('mongoose');
const bodyParser = require ('body-parser');
const Person = require('./Modals/PersonModal');
require('dotenv').config()   //environment variables

const app = express(); 

//DB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("Connected Database Successfully");
});

//Body-Parser
app.use(bodyParser.json());

//Create Person and Save()
app.post('/person', (req, res, next) => {
    const person = new Person({
        _id: new mongoose.Types.ObjectId(),
        name : req.body.name,
        age: req.body.age,
        favouriteFoods: req.body.favouriteFoods,
    })
    person 
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Person created",
        createdUser: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });

})

//Create Many Records

app.get("/createMany", (req, res) => {
  const createManyPeople = function(arrayOfPeople) {
        Person.create(arrayOfPeople, (req.body))
          res.send("");
    };
    createManyPeople();
});


//Find person with same name
const findPeopleByName = function(personName, done) {
  
    Person.find({name: personName}, (error, arrayOfResults) => {
      if(error){
        console.log(error)
      }else{
        done(null, arrayOfResults)
      }
    })
  };

  //Find just one person which has a certain food in the person's favorites
  const findOneByFood = function(food, done) {
    Person.findOne({favouriteFoods: {$all : [food]}}, function(err, data) {
      if(err) return done(err);
      return done(null, data);
    });  
  };

  //Find the (only!!) person having a given _id
  const findPersonById = function(personId, done) {
      Person.findById(personId, (error, result) => {
        if(error){
            console.log(error)
        }else{
            done(null, result)
        }
      }) 
  };

  //Perform Classic Updates by Running Find, Edit, then Save
function addHamb(food) {
    let test = false;
    food.map((el) => {
        if (el.toLowerCase() === "hamburger") {
            test = true;
            return food;
        }
    });
    if (!test) food.push("Hamburger");
    return food;
}
app.put("/updateFood/:id", (req, res) => {
    Person.findById({ _id: req.params.id }, (err, result) => {
        if (err) res.send("Error");
        else {
            addHamb(result.favouriteFoods);
            result.save(function (err) {
                if (err) console.error("ERROR!");
            });
            res.send(result);
        }
    });
});

//Perform New Updates on a Document Using model.findOneAndUpdate()
app.put("/updateAge/:name", (req, res) => {
    Person.findOneAndUpdate({ name: req.params.name }, { age: 20 }, { new: true })
        .then((docs) => res.send(docs))
        .catch((err) => res.send(err));
});
//find all persons
app.get("/", (req, res) => {
    console.log(req.params);
    Person.find()
        .exec()
        .then((doc) => {
            res.status(200).send(doc);
        })
        .catch((err) => res.send(err));
});

// Delete One Document Using model.findByIdAndRemove
app.delete("/delete/:id", (req, res) => {
    Person.findByIdAndRemove({ _id: req.params.id }, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.send(`<h1>Removed user: </h1>${result}`);
        }
    });
});

// MongoDB and Mongoose - Delete Many Documents with model.remove()
app.delete("/deleteMary", (req, res) => {
    Person.remove({ name: "Mary" }, (err, result) => {
        if (err) {
            res.send(err);
        } else res.send(result);
    });
});

// Chain Search Query Helpers to Narrow Search Results
app.get("/burrito", (req, res) => {
    Person.find({ favouriteFoods: "burrito" })
        .sort({ name: 1 })
        .limit(2)
        .select({ age: false })
        .exec((err, data) => {
            if (err) {
                res.send(err);
            } else {
                if (!data[0]) {
                    res.send("<h1>No person lik Burrito</h1>");
                } else res.send(data);
            }
        });
});

    





























//Port Listen 2000
app.listen(2000,function(req,res){
console.log("Server is started on port 2000");
});




  