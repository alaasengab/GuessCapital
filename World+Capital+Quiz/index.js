import  express  from "express";
import bodyParser from "body-parser";
import pg from "pg"; 


// DataBase 
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "macbookpro",
    port: 5432,
})


// Constants 
const app = express();
const port = 3000;

//static 
app.use(express.static("public"));

//connect to database 
db.connect(); 


//Variables 
var hearts = 3; 
var condition = false; 
var hintLevel = 1; 
var chosenCapital= "";
var chosenCountry= ""; 
var hintLetters=""; 
var totalCorrect = 0; 
let currentQuestion ={} ; 
let message = ""; 
let hint =""; 

// initiate dataset and hold it on your server temporarly
let quiz = []
    // { country: "France", capital: "Paris" },
    // { country: "United Kingdom", capital: "London" },
    // { country: "United States of America", capital: "New York" },
  //];


//import data and save it into quiz 
db.query("SELECT * FROM capitals", (err,res) =>{
    if(err){
        console.log("Error executing query", err.stack);
    }else{
        quiz = res.rows;
    }
    db.end();
});


//middleware 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



//post new country 
app.get("/", async (req,res) =>{
    await nextQuestion();
    condition = false;
    hearts=3;
    hintLevel=1;
    console.log(typeof currentQuestion.capital);
    console.log(condition);
    res.render("index1.ejs" , { 
        question: currentQuestion,
        condition: condition,
        lives: hearts, 
     }); 
});




// recieve the input from the user and check if it correct 
app.post("/submit" ,(req,res) => {
    let answer = req.body.answer.trim();
    let isCorrect= false; 
    console.log(answer);

    if (currentQuestion.capital.toLowerCase()===answer.toLowerCase()) {
        totalCorrect++;
        console.log(totalCorrect);
        isCorrect = true;
        message = getMessage(isCorrect, condition);
        nextQuestion();
    }else{
        hearts--;
        countHearts(hearts);
        message= getMessage(isCorrect,condition); 
        hint = getHint(currentQuestion);
    }
    
    res.render("index1.ejs",{
        question: currentQuestion,
        wasCorrect: isCorrect,
        totalScore: totalCorrect,
        message: message,
        condition: condition,
        hint: hint,
        lives: hearts,
    });
});


// Function to get a random country  
async function nextQuestion() {
    const randomCountry= quiz[Math.floor(Math.random() *quiz.length )];
    
    currentQuestion = randomCountry;
}



// Get message if user answered right or wrong 
function getMessage(isCorrectAnswer, isGameOver){
    if (isCorrectAnswer){
        return "well done on answering the previous one right! " ;
    }else if(!isGameOver){
        return "you were wrong, Please try again!";
    }else{
        return  "GAME OVER the capital of " + chosenCountry + "is: " + chosenCapital;
    }
}


// count number of hearts player has 
function countHearts (event){
    if(event <= 0){
        condition = true; 
    }
}

// hint function 
function getHint(city){
    chosenCountry= city.country;
    chosenCapital= city.capital;
    hintLetters = chosenCapital.substring(0,hintLevel);
    hintLevel++;
    console.log(hintLetters);
    return hintLetters; 
}

// initiation  
app.listen(port,() =>{
    console.log("running on local port");
});