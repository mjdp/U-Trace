const express = require('express')
let router = express()

const firebase = require('firebase/app');
const firebaseConfig = require('./config.js');
const { initializeApp } = require('firebase-admin/app');
const admin = require('firebase-admin')
const FBAPP = require ('../firebase')
var db = FBAPP.firestore()

const firebaseAuth = require ('firebase/auth');
const { getAuth } = require('firebase/auth');
firebase.initializeApp(firebaseConfig);
console.log(firebase);

const auth = firebaseAuth.getAuth();

router.use(express.json());
router.use(express.urlencoded({ extended: true }))

// VARIABLES
let admins = []
let genCount

router.get("/admin-settings", (req, res) => {
    if(req.session.user){
        if(req.session.role == "System Admin"){
            admins = []
            getAdmins().then(()=>{
                getGenCount().then(()=>{
                    res.render('settings.hbs', {healthAuthority: false, LGU: false, systemAdmin: true, userlist: admins, genCount: genCount})
                })
            }) 
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    }
   
})

router.get("/save-changes", (req,res) =>{
    if(req.session.user){
        if(req.session.role == "System Admin"){
            saveGenCount(req.query.genCount).then(() => {
                res.send("yes")
            })
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    }
})

router.post("/deleteAdminAccount", (req,res)=>{
    
    var idToDelete = req.body.accToDelete
    console.log(idToDelete)

    // getAuth().deleteUser(idToDelete).then(()=>{
    //     console.log('Successfully deleted user')
        
    //     // RENDER THE PAGE AGAIN WHEN THE ACC IS SUCCESSFULLY DELETED
    //     res.render('settings.hbs', {healthAuthority: false, LGU: false, systemAdmin: true, userlist: admins, genCount: genCount, deletionSuccess: true})
    
    // }).catch((error)=>{
    //     console.log('Error deleting user: ', error)
    // })

    updateUserRole(idToDelete).then(()=>{
         // RENDER THE PAGE AGAIN WHEN THE ACC IS SUCCESSFULLY DELETED
         admins = []
         getAdmins().then(()=>{
             getGenCount().then(()=>{
                 res.render('settings.hbs', {healthAuthority: false, LGU: false, systemAdmin: true, userlist: admins, genCount: genCount, deletionSuccess: true})
             })
         }) 
 
    })
})

// FUNCTIONS
const getAdmins = async function(){ // get all admin users with varying roles
    
    const snapshot = await db.collection('admins').get()

    var allowDelete
    
    if(!snapshot.empty){
        snapshot.forEach((doc)=>{

            allowDelete = true
            if (doc.data().type == "System Admin") {
                console.log("User is a SYSTEM ADMIN")
                allowDelete = false
            }
            
            
                let admin = {
                    id: doc.id,
                    email: doc.data().email,
                    name: doc.data().name,
                    role: doc.data().type,
                    region: doc.data().region,
                    province: doc.data().province,
                    city: doc.data().city,
                    barangay: doc.data().barangay,
                    allowDelete: allowDelete
                }
                if(admin.role != "Deleted"){
                    admins.push(admin)
                }
        })
    } else {
        console.log("No documents found!")
    }
}

const getGenCount = async function(){ // get generation count

    const snapshot = await db.collection('admin_configurations').doc('settings').get()
    if(snapshot.exists)
        genCount = snapshot.data().generation_count
    else 
        genCountControl = "N/A"
}

const saveGenCount = async function(newCount){ // save generation count set

    const snapshot = await db.collection('admin_configurations').doc('settings')
    const save = await snapshot.set({
        generation_count: newCount
    }).catch((error)=>{
        var errorCode = error.code
        var errorMessage = error.message
        console.log(errorCode)
        console.log(errorMessage)
    })      
}

const updateUserRole = async function(uid){
    const snapshot = await db.collection('admins').doc(uid).update({type: "Deleted"})
    
}
module.exports = router