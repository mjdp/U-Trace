const express = require("express")
const hbs = require('express-handlebars')
const session = require("express-session")
const app = express()

const port = process.env.PORT || 5000

//firebase.initializeApp(firebaseConfig);
//console.log(firebase);



app.use(express.json());
app.use(express.urlencoded({ extended: false }))

// Static Files
app.use(express.static(__dirname))

// Templating Engine
app.set('view engine', 'hbs')
app.engine('hbs', hbs({
    extname: '.hbs',
    defaultLayout:"",
    layoutsDir: "",
    
    helpers: {
        foo: function () { return 'FOO!'; },
        bar: function () { return 'BAR!'; },
        equal: function(a, b, opts) {
            if (a == b) {
                return opts.fn(this)
            } else {
                return opts.inverse(this)
            }
        }
    }
}));

// Session
app.use(session({
    secret:"very secret",
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 1000*60*60,
        httpOnly: true
    }
}))

app.use(require("./controllers"))

// app.listen(port, () => console.log(`Listening on port ${port}`))
app.listen(process.env.PORT || port)