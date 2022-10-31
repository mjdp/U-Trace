const express = require('express')
let router = express()

const firebase = require('firebase/app');
const firebaseConfig = require('./config.js');

const admin = require('firebase-admin')
const FBAPP = require ('../firebase')
var db = FBAPP.firestore()

const firebaseAuth = require ('firebase/auth');
const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = require('firebase/auth');
firebase.initializeApp(firebaseConfig);
console.log(firebase);

const auth = firebaseAuth.getAuth();

router.use(express.json());
router.use(express.urlencoded({ extended: true }))

// VARIABLES

var userName = ""
var userRole = ""
var userLocation = {region: "",
                    region_code: "",
                    province: "",
                    province_code: "",
                    city: "",
                    city_code: "",
                    barangay: ""}
var adminFound
var currAdminDetails = []
var reauthenticateResult
var updatePassResult

// ROUTERS

router.get("/user-login", (req, res) => {
    res.render('login.hbs')
})

router.get("/admin-profile", (req, res) => {
    if (req.session.user) {
        adminFound = false
        currAdminDetails = []
        findAdminAccount(req.session.user).then(()=>{
            if (!adminFound) {
                console.log("Admin not found.")
                res.redirect('/')
            } else {
                if(req.session.role == "Health Authority (Provincial-Level)" || req.session.role == "Health Authority (City-Level)" || req.session.role =="Health Authority (Region-Level)"){
                    res.render('adminProfile.hbs', {currAdminDetails: currAdminDetails, healthAuthority: true, LGU: false, systemAdmin: false})    
                }else if(req.session.role == "LGU (City-Level)" || req.session.role == "LGU (Provincial-Level)"){
                    res.render('adminProfile.hbs', {currAdminDetails: currAdminDetails,healthAuthority: false, LGU: true, systemAdmin: false})
                }else if(req.session.role == "System Admin"){
                    res.render('adminProfile.hbs', {currAdminDetails: currAdminDetails,healthAuthority: false, LGU: false, systemAdmin: true})
                }  
            }
        })
    } else {
        res.redirect('/')
    }
})

router.get("/update-password", (req, res) => {

    var currPw = req.query.currPw
    var newPw = req.query.newPw
    var confirmNewPw = req.query.confirmNewPw

    // if the new passwords do not match, send update failed result
    if (newPw != confirmNewPw) {
        res.send({result: "PW_DISCREPANCY"})
    } 
    // if the passwords are less than 6 characters in length
    else if (newPw.length < 6 || confirmNewPw.length < 6) {
        res.send({result: "PW_<6"})
    }
    // else, attempt to reauthenticate the user with the inputted current password
    else {

        reauthenticateResult = false
        reauthenticate(currPw).then(()=>{

            // if the current password is wrong, send update failed result
            if (reauthenticateResult == false) {
                res.send({result: "INCORRECT_PW"})
            } 
            // else, update the password
            else {

                updatePassResult = false
                updateAdminPassword(newPw).then(()=>{

                    // if something gone wrong with the update, send update failed result
                    if (updatePassResult == false) {
                        res.send({result: "UNKNOWN_ERROR"})
                    }
                    // else, send update success result
                    else {
                        res.send({result: "SUCCESS"})
                    }
                })
            }
        }) 
    }
})

router.get("/checkPasswordFromSettings", (req, res) => {
    
    var systemAdminPass = req.query.password

    reauthenticateResult = false
    reauthenticate(systemAdminPass).then(()=>{

        if (reauthenticateResult == false) {
            res.send({result: "INCORRECT_PW"})
        }
        else {
            console.log("HELLO! THE PASSWORD WAS CORRECT AND ITS NOW TIME FOR DELETION OF ADMIN ACC")
            res.send({result: "CORRECT_PW"})
        }

    })
    
})

router.post("/login", (req,res) =>{

    var email = req.body.email;
    var pw = req.body.password;

    firebaseAuth.signInWithEmailAndPassword(auth, email, pw).then((userCredential)=> {
        var user = userCredential.user
       
        getUserDetails(user.uid).then(()=>{
            if(userRole == "Health Authority (City-Level)" || userRole == "Health Authority (Provincial-Level)"
            || userRole == "Health Authority (Region-Level)" || userRole == "System Admin" || userRole == "LGU (Provincial-Level)"
            || userRole == "LGU (City-Level)"){
                req.session.role = userRole
                req.session.address = userLocation
                req.session.user = user.email
                req.session.name = userName
                console.log("Logged In:");
                console.log(req.body.email)
                res.redirect('/');
            }else{
                res.render('login.hbs', { error: "Incorrect email  or password."})
            }
        })
        
    })
    .catch((error)=>{
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
        res.render('login.hbs', { error: "Incorrect email  or password."})
    });

})

router.get("/signout", function(req, res){
    req.session.destroy()
    res.redirect("/")
})

// FUNCTIONS

const getUserDetails = async function(userId){
    const userInfo = await db.collection("admins").doc(userId).get()
    if(!userInfo.empty){
        var role = userInfo.data().type
        await getUserRegion(userInfo.data().region)
        await getUserProvince(userInfo.data().province)
        // await getUserCity(userInfo.data().city)
        userLocation.region = userInfo.data().region
        userLocation.province = userInfo.data().province
        userLocation.city = userInfo.data().city
        userLocation.barangay = userInfo.data().barangay
        var name = userInfo.data().name
        console.log("getUserRole")
        console.log(role)
        userRole = role
        userName = name
    }else{
        console.log("Admin does not exist")
    }
}
const getUserRegion = async function(region){
    const snapshot = await db.collection("regions").where('name', '==', region).get()
    if(!snapshot.empty){
        snapshot.forEach((doc)=>{
            userLocation.region_code = doc.data().id
        })
    }
}
const getUserProvince = async function(province){
    const snapshot = await db.collection("provinces").where('name', '==', province).get()
    if(!snapshot.empty){
        snapshot.forEach((doc)=>{
            userLocation.province_code = doc.data().id
        })
    }
}

const getUserCity = async function(city){
    const snapshot = await db.collection("cities").where('name', '==', city).get()
    if(!snapshot.empty){
        snapshot.forEach((doc)=>{
            userLocation.city_code = doc.data().id
        })
    }
}

const findAdminAccount = async function(email){ // find document of admin based on their email
    
    const snapshot = await db.collection('admins').get()
    
    if(!snapshot.empty){
        snapshot.forEach((doc)=>{

            if (doc.data().email == email) {
                console.log("Admin found!")
                currAdminDetails = {
                    name: doc.data().name,
                    email: doc.data().email,
                    type: doc.data().type,
                    region: doc.data().region,
                    province: doc.data().province,
                    city: doc.data().city,
                    barangay: doc.data().barangay
                }
                adminFound = true
            }
        })
    } else {
        console.log("No documents found!")
    }
}

const reauthenticate = async function(password){ // attempt to reauthenticate the user given the inputted current password

    const currUser = auth.currentUser
    const credential = EmailAuthProvider.credential(currUser.email, password)

    const reauth = await reauthenticateWithCredential(currUser, credential).then(() => {
        console.log("User successfully reauntheticated.")
        reauthenticateResult = true
    }).catch((error) => {
        console.log("User reauthentication failed.")
        console.log("ERROR:")
        console.log(error)
        reauthenticateResult = false
    })
}

const updateAdminPassword = async function(newPassword){ // attempt to update the user's password given the inputted new password

    const currUser = auth.currentUser

    const update = await updatePassword(currUser, newPassword).then(() => {
        console.log("Successfully changed password.")
        updatePassResult = true
    }).catch((error) => {
        console.log("User reauthentication failed.")
        console.log("ERROR:")
        console.log(error)
        updatePassResult = false
    })
}


module.exports = router