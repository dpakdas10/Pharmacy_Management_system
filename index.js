const express = require("express");
const mysql = require('mysql2');
const app = express();
const port = 8070;
const path = require("path");
const methodOverride = require("method-override");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public/css")));
app.use(express.static(path.join(__dirname, "/public/js")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'medstore',
    password: 'Sita@#1009'
});

app.get('/', (req, res) => {
    res.send("root is working");
})

//admin route
app.get("/admin", (req, res) => {
    res.render("admin.ejs", {port});
})

//login route
app.get("/login", (req, res) => {
    let error = req.query.error;
    res.render("login.ejs", { error });
});

// admin/login
app.post("/login", (req, res) => {
    let {email, password} = req.body;
    let q = `select * from admin where email="${email}" and password="${password}"`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            console.log(result);
            if(result.length > 0)
                res.redirect("/patients");
            else
                res.render("login.ejs", {error: {msg: "Incorrect email or password"}});
        })
    } catch (err) {
        console.log(err);
    }
});

// patients details
app.get("/patients", (req,res)=>{
    res.render("patients.ejs");
});

app.post('/patients',(req,res)=>{
    let {p_id, p_fname, p_lname, p_age, p_gender, p_address,  p_number} = req.body;
    let p_name = `${p_fname} ${p_lname}`;
    let q = `insert into Patient values ("${p_id}","${p_name}", "${p_age}", "${p_gender}", "${p_address}", "${p_number}")`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect(`/search?p_id=${encodeURIComponent(p_id)}`);
        })
    } catch (err) {
        console.log(err);
    }
});

//search medicine
app.get("/search", (req, res) => {
    const {p_id} = req.query;
    const error = req.query.error;
    res.render("search.ejs", {error, result: [], p_id});
});

app.post('/search/:p_id',(req,res)=>{
    let {drugs} = req.body;
    let {p_id} = req.params;
    let q = `SELECT * FROM Stock S
    JOIN Medicine M ON S.Medicine_ID = M.Medicine_ID
    WHERE S.Medicine_Name = "${drugs}"`;
try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.render("search.ejs", {result: result, p_id, error:true});
        })
    } catch (err) {
        console.log(err);
    }
});

//add med
app.get("/add/:p_id/:Medicine_Name", (req,res)=>{
    let {p_id,Medicine_Name} = req.params;
    let {qty} = req.query;
    // console.log(qty);
    const q1 = `select Name from Patient where Patient_ID=${p_id}`;
    connection.query(q1, (err1, result1) => {
        if (err1) {
            console.error(err1);
            return;
        }
        console.log(result1);
        const q2 = `insert into Bill_Generator values
        (${p_id}, "${result1[0].Name}", "${Medicine_Name}", ${qty}, CURDATE())`;
        connection.query(q2, (err2, result2) => {
            if (err2) {
                console.error(err2);
                return;
            }
            console.log("Selected:", result2);
            const q3= `select Quantity from Stock where Medicine_Name="${Medicine_Name}"`;
            connection.query(q3, (err3, result3) => {
                if (err3) {
                    console.error(err3);
                    return;
                }
                if(result3[0].Quantity-qty >= 0){
            const q4 = `update Stock set Quantity=${result3[0].Quantity-qty}`;
            connection.query(q4, (err4, result4) => {
                if (err4) {
                    console.error(err4);
                    return;
                }
                console.log(result4);
            res.redirect(`/search?p_id=${encodeURIComponent(p_id)}`);
            });
                }
        });
        });
    });
    })

// generate bill
app.post('/generate/:p_id', (req,res)=>{
    let {p_id} = req.params;
    const q = `SELECT * FROM Medicine M , Stock S, Bill_Generator B, Patient P where B.Patient_ID=${p_id} and S.Medicine_ID=M.Medicine_ID and P.Patient_ID=${p_id} and B.Medicine_Name=S.Medicine_Name`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let p_name = result[0].Patient_Name;
            let address = result[0].Address;
            let phone_number = result[0].Phone_Number;
            console.log(p_name);
            const q1 = `select * from Pharmacy`;
            connection.query(q1, (err1, result1) => {
            if (err1) throw err1;
            console.log(result);
            res.render("generate.ejs", {result: result, p_name, address, phone_number, result1: result1});
            });
        })
    } catch (err) {
        console.log(err);
    }
});

app.listen(port, () => {
    console.log(`listening to port: ${port}`);
})

