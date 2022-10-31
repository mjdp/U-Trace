const express = require('express')
const nodemailer = require('nodemailer')
let router = express()

router.use(express.json());
router.use(express.urlencoded({ extended: true }))

router.get("/faq-page", (req, res) => {
    if(req.session.user){
        if(req.session.role == "Health Authority (Provincial-Level)" || req.session.role == "Health Authority (City-Level)" || req.session.role =="Health Authority (Region-Level)"){
            res.render('faq.hbs', {healthAuthority: true, LGU: false, systemAdmin: false})    
        }else if(req.session.role == "LGU (City-Level)" || req.session.role == "LGU (Provincial-Level)"){
            res.render('faq.hbs', {healthAuthority: false, LGU: true, systemAdmin: false})
        }else if(req.session.role == "System Admin"){
            res.render('faq.hbs', {healthAuthority: false, LGU: false, systemAdmin: true})
        }
    }else{
        res.redirect('/')
    }
})

// VARIABLES
var email
var name
var body
var subject

// ROUTES

router.post("/emailAdmin", (req, res) => {
    if(req.session.user){

        console.log("ROUTER_POST: /emailAdmin (at faq.js)")

        // refresh fields
        email = ""
        name = ""

        // get user's email
        email = req.session.user.toString(); console.log("Email: " + email)

        // get user's name
        name = req.session.name.toString(); console.log("Name: " + name)

        // set subject
        subject = "U-Trace Admin | Help Request: " + req.body.subject

        // set body
        body = req.body.helpContent

        emailAdministrator().then(() => {
            if(req.session.role == "Health Authority (Provincial-Level)" || req.session.role == "Health Authority (City-Level)" || req.session.role =="Health Authority (Region-Level)"){
                res.render('faq.hbs', {healthAuthority: true, LGU: false, systemAdmin: false})    
            }else if(req.session.role == "LGU (City-Level)" || req.session.role == "LGU (Provincial-Level)"){
                res.render('faq.hbs', {healthAuthority: false, LGU: true, systemAdmin: false})
            }else if(req.session.role == "System Admin"){
                res.render('faq.hbs', {healthAuthority: false, LGU: false, systemAdmin: true})
            }
        })
        
    }else{
        res.redirect("/")
    }
   
})

// FUNCTIONS

const emailAdministrator = async function () {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'u.trace.mailer@gmail.com',
          pass: 'qgqteysbhwzteovo',
        },
    })

    let details = {
        from: 'U-Trace Mailer',
        to: "utracedlsu@gmail.com",
        subject: subject,
        cc: email,
        html:
        "<b>Name: " + name + "</b> <br> <b>Issue: </b> <br>" + body + ""
    }

    transporter.sendMail(details, (err) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log("Email has been sent.")
        }
    })

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}

module.exports = router;