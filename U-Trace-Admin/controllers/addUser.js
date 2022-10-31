const express = require('express')
let router = express()

// firebase
const firebase = require('firebase/app')

const firebaseConfig = require('./config.js')

const app1 = firebase.initializeApp(firebaseConfig, "primary")
const app2 = firebase.initializeApp(firebaseConfig, "secondary")

const firebaseAuth = require('firebase/auth')

const auth = firebaseAuth.getAuth(app1)
const auth2 = firebaseAuth.getAuth(app2)


// const admin = require('firebase-admin')
const FBAPP = require ('../firebase')
var db = FBAPP.firestore()
var serviceAccount = require('./serviceAccount.json')

var emails 

// const bodyParser = require('body-parser')
// router.use(bodyParser.urlencoded({ extended: false}))
// router.use(bodyParser.json())

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

router.get("/add-userAdmin", (req, res) => {
    if(req.session.user){
        if(req.session.role == "System Admin"){
            var code = req.query;
        
            if(req.query.regionCode){
                console.log("if(req.query.regionCode): RegionCode is " + req.query.regionCode.code)
                provinceArray = []
                getProvinces(req.query.regionCode.code).then(()=>{
                    res.json({provinceArray})
                })
            }else if(req.query.provinceCode){
                console.log("else if(req.query.provinceCode): ProvinceCode is " + req.query.provinceCode.code)
                citiesArray = []
                getCities(req.query.provinceCode.code).then(()=>{
                    res.json({citiesArray})
                })
            }else if(req.query.cityCode){
                console.log("else if(req.query.cityCode): CityCode is " + req.query.cityCode.code)
                barangayArray = []
                getBarangays(req.query.cityCode.code).then(()=>{
                    res.json({barangayArray})
                })
            }else{
                console.log("(NEW START):")
                regionsArray = [] 
                adminTypesArray = []
                getRegions().then(() => {
                    console.log("(NEW START): regionsArray contents:")
                    console.log(regionsArray)
                    getAdminTypes().then(() => {
                        getEmails().then(() => {
                            if(req.session.role == "System Admin"){
                                res.render('addUser.hbs', {regions: regionsArray, adminTypes: adminTypesArray, healthAuthority: false, LGU: false, systemAdmin: true})
                            }
                        })
                    })
                })
            }
        }else{
            res.redirect('/')
        }
    }else{
        res.redirect('/')
    }   
})

router.get("/retrieveEmails", (req, res) => {

    if(req.session.user){

        // send emails
        res.json({
            emails: emails
        })
        
    }else{
        res.redirect("/")
    }
})

router.post("/addNewUser", (req,res) =>{

    if(req.session.user){
        if(req.session.role == "System Admin"){
            // get data
            var newEmail = req.body.newEmail
            var newPw = req.body.newPw

            var newName = req.body.newName
            var newType = req.body.newType
            var newRegion = req.body.newRegion
            var newProvince = req.body.newProvince
            var newCity = req.body.newCity
            var newBarangay = req.body.newBarangay

            // reformat location data
            var splitter = newRegion.split('"')
            newRegion = splitter[7].toString()
            splitter = newProvince.split('"')
            newProvince = splitter[7].toString()
            splitter = newCity.split('"')
            newCity = splitter[7].toString()
            splitter = newBarangay.split('"')
            newBarangay = splitter[7].toString()

            // create user
            firebaseAuth.createUserWithEmailAndPassword(auth2, newEmail, newPw).then((userCredential) => {
                var uid = userCredential.user.uid
                const data = {
                    name: newName,
                    email: newEmail,
                    type: newType,
                    region: newRegion,
                    province: newProvince,
                    city: newCity,
                    barangay: newBarangay
                }
                const snapshot = db.collection('admins').doc(uid).set(data)
                res.render('addUser.hbs', {regions: regionsArray, healthAuthority: false, LGU: false, systemAdmin: true, adminTypes: adminTypesArray, success: true})
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("/addNewUser [ERROR]: " + errorMessage)
            })
        }else{
            res.redirect('/')
        }
    }else{
        res.redirect('/')
    
    }   
})

var adminTypesArray = []
var regionsArray = []
var provinceArray = []
var citiesArray = []
var barangayArray = []

const getEmails = async function() {

    emails = []

    const snapshot = await db.collection('admins').get()
    if(!snapshot.empty){
        console.log("getAdminTypes(): admin types snapshot exists")
        snapshot.forEach((doc) => {
            emails.push(doc.data().email)
        })
    }else{
        console.log("getAdminTypes(): admin types snapshot does not exist.")
    }
}

const getAdminTypes = async function() {
    const snapshot = await db.collection('admin_types').get()
    if(!snapshot.empty){
        console.log("getAdminTypes(): admin types snapshot exists")
        snapshot.forEach((doc) => {
            adminTypesArray.push(doc.data().type)
        })
    }else{
        console.log("getAdminTypes(): admin types snapshot does not exist.")
    }
}

const getRegions = async function(){
    const snapshot = await db.collection('regions').get()
    if(!snapshot.empty){
        console.log("getRegions(): Region Snapshot exists")
        snapshot.forEach((doc) => {
            const region = {regname: doc.data().name, regid: doc.data().id}
            regionsArray.push(region)
        })
    }else{
        console.log("getRegions(): Region Snapshot does not exist")
    }
}

const getProvinces = async function(code){
    const snapshot = await db.collection('provinces').get()
    console.log("getProvinces(): Region code selected is " + code)

    if(!snapshot.empty){
        console.log("getProvinces(): Province Snapshot exists")
        snapshot.forEach((doc)=>{
            if(doc.data().region_code == code){
                const province = {provinceName: doc.data().name, provinceId: doc.data().id}
                provinceArray.push(province)
            }
       }) 
    }else{
        console.log("getProvinces(): Provinces snapshot does not exist")
    }
} 

const getCities = async function(code){
    const snapshot = await db.collection('cities').get()
    console.log("getCities(): Province code selected is " + code)

    if(!snapshot.empty){
        console.log("getCities(): Cities Snapshot exists")
        snapshot.forEach((doc)=>{
            if(doc.data().province_code == code){
                const city = {cityName: doc.data().name, cityId: doc.data().id}
                citiesArray.push(city)
            }
        })
    }else{
        console.log("getCities(): Cities snapshot does not exist")
    }
}

const getBarangays = async function(code){
    const snapshot = await db.collection("barangays").get()
    console.log("getBarangays(): City code selected is " + code)
    
    if(!snapshot.empty){
        console.log("getBarangays(): Barangays Snapshot exists")
        snapshot.forEach((doc)=>{
            if(doc.data().city_code == code){
                const barangay = {barangayName: doc.data().name, barangayId: doc.data().id}
                barangayArray.push(barangay)
            }
        })
    }else{
        console.log("Barangays snapshot does not exist");
    }
}

// admin.initializeApp(firebaseConfig);
/*
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://u-trace-332014-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
*/

module.exports = router;