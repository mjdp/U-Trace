const express = require('express')
let router = express()

// algolia
const algoliasearch = require('algoliasearch')
const client = algoliasearch('GFZDJL0IJF', 'c8532e668143c42900618f77f8435406')
const index = client.initIndex('users')

// firebase
const FBAPP = require ('../firebase')
const admin = require('firebase-admin')
const e = require('express')
const fieldValue = admin.firestore.FieldValue
var db = FBAPP.firestore()

router.use(express.json());
router.use(express.urlencoded({ extended: true }))

// ROUTERS
router.get("/updateUserVaxInfo", (req, res) => {
    
    // check for valid user
    if(req.session.user){
        if(req.session.role == "Health Authority (City-Level)" || req.session.role == "Health Authority (Provincial-Level)"|| req.session.role =="Health Authority (Region-Level)"){
            // get users thru algolia
            users = []
            vaccineArray = []
            categoryArray = []
            
            index.search().then(({ hits }) => {

                if (req.session.role == "Health Authority (Region-Level)") {
                    for (var a = 0; a < hits.length; a++) {
                        if (hits[a].document_status != "published") {
                            console.log("[ X ] " + hits[a].firstname + " " + hits[a].lastname + "'s document status is: " + hits[a].published + ". Will not include in results.")
                        } else if (req.session.address.region != hits[a].region) {
                            console.log("[ X ] " + hits[a].firstname + " " + hits[a].lastname + "'s region does not match health authority (Region-Level)'s region.")
                            console.log("       User Region: " + hits[a].region)
                            console.log("       Health Authority (Region-Level): " + req.session.address.region)
                        } else {
                            console.log("[ O ] " + hits[a].firstname + " " + hits[a].lastname + " is a match. Data will be included.")
                            users.push(hits[a])
                        }
                    }
                }

                else if (req.session.role == "Health Authority (Provincial-Level)") {
                    for (var a = 0; a < hits.length; a++) {
                        if (hits[a].document_status != "published") {
                            console.log("[ X ] " + hits[a].firstname + " " + hits[a].lastname + "'s document status is: " + hits[a].published + ". Will not include in results.")
                        } else if (req.session.address.province != hits[a].province) {
                            console.log("[ X ] " + hits[a].firstname + " " + hits[a].lastname + "'s province does not match health authority (Provincial-Level)'s province.")
                            console.log("       User Province: " + hits[a].province)
                            console.log("       Health Authority (Provincial-Level): " + req.session.address.province)
                        } else {
                            console.log("[ O ] " + hits[a].firstname + " " + hits[a].lastname + " is a match. Data will be included.")
                            users.push(hits[a])
                        }
                    }
                }

                else if (req.session.role == "Health Authority (City-Level)") {
                    for (var a = 0; a < hits.length; a++) {
                        if (hits[a].document_status != "published") {
                            console.log("[ X ] " + hits[a].firstname + " " + hits[a].lastname + "'s document status is: " + hits[a].published + ". Will not include in results.")
                        } else if (req.session.address.city != hits[a].city) {
                            console.log("[ X ] " + hits[a].firstname + " " + hits[a].lastname + "'s city does not match health authority (City-Level)'s city.")
                            console.log("       User City: " + hits[a].city)
                            console.log("       Health Authority (City-Level): " + req.session.address.city)
                        } else {
                            console.log("[ O ] " + hits[a].firstname + " " + hits[a].lastname + " is a match. Data will be included.")
                            users.push(hits[a])
                        }
                    }
                }

                else { console.log("[ERROR]: Unable to identify level of health authority.") }

                console.log("[END RESULT]: ")
                console.log(users) 
                getVacManufacturers().then(()=>{
                    getCategories().then(()=>{
                        res.render('userVaxInfo.hbs', {users: users, vaccines: vaccineArray, categories: categoryArray, healthAuthority: true, LGU: false, systemAdmin: false})    
                    })
                })
            
            })
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    }
})

router.get("/getVaxInfo", (req, res) => {

    if(req.session.user){
        if(req.session.role == "Health Authority (City-Level)" || req.session.role == "Health Authority (Provincial-Level)"|| req.session.role =="Health Authority (Region-Level)"){
            console.log("/getVaxInfo")
            console.log(req.query.userid)
        
            getUserInfo(req.query.userid).then(()=>{
                console.log("vax boosters: " + vax_booster)
                res.json({
                    vax_ID: vax_ID,
                    vax_manufacturer: vax_manufacturer,
                    vax_1stdose: vax_1stdose,
                    vax_2nddose: vax_2nddose,
                    vax_booster: vax_booster,
                    vaccineArray: vaccineArray,
                    userFullName: personName,
                    userFullAddress: personAddress,

                    categoryArray: categoryArray,
                    // vax_lotno: vax_lotno,
                    // vax_batchno: vax_batchno,
                    // vax_vaccinator: vax_vaccinator,
                    vax_facility: vax_facility,
                    vax_category: vax_category
                    
                })
            })
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    
    }
   
})

router.post("/confirmVaxUpdate", (req,res) => {

    if(req.session.user){
        if(req.session.role == "Health Authority (City-Level)" || req.session.role == "Health Authority (Provincial-Level)"|| req.session.role =="Health Authority (Region-Level)"){
        
    console.log("went to confirmVaxUpdate")
    console.log(req.body)

    var firstDose

    if (req.body.vax1stDose == undefined) {
        firstDose = ""
    } else {
        firstDose = req.body.vax1stDose
    }

    updateVaxToFirebase(
        req.body.userlist,
        req.body.vaxID,
        req.body.vaxBrand,
        firstDose, // none if jnj
        req.body.vax2ndDose,
        req.body.vaccinator1stDose,
        req.body.batchno1stDose,
        req.body.lotno1stDose,
        req.body.vaccinator2ndDose,
        req.body.batchno2ndDose,
        req.body.lotno2ndDose,
        req.body.vaxCategory,
        req.body.vaxFacility
    ).then(() => {

        var newBoosterArray = []

        for (var i = 0; i < parseInt((req.body.boosterCtr)); i++) {
            if (eval("req.body.vaxBoosterDate_" + i) != "" || eval("req.body.vaxBoosterBrand_" + i) != undefined) {
                const booster = {
                    date: eval("req.body.vaxBoosterDate_" + i),
                    vax_manufacturer: eval("req.body.vaxBoosterBrand_" + i),
                    batch_no: eval("req.body.vaxBoosterBlockNo_" + i),
                    lot_no: eval("req.body.vaxBoosterLotNo_" + i),
                    vaccinator: eval("req.body.vaxBoosterVaccinator_" + i),
                    // vax_category: eval("req.body.vaxBoosterCategory_" + i),
                    facility: eval("req.body.vaxBoosterFacility_" + i)
                }

                newBoosterArray.push(booster)
                
            } else {
                console.log("one of the booster inputs has no data or undefined")
            }  
        }

        updateBoostersToFirebase(req.body.userlist, newBoosterArray)

        if(parseInt((req.body.boosterCtr)) > initbooostercount){
            sendBoosterNotification()
        } else {
            sendVaxNotification()
        }
        res.render('userVaxInfo.hbs', {users: users, vaccines: vaccineArray, categories: categoryArray, healthAuthority: true, LGU: false, systemAdmin: false, success: true})
    })
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    }
    
})

// holders
var vaccineArray = []
var categoryArray = []
var users = []
var vax_ID
var vax_manufacturer
var vax_1stdose 
var vax_2nddose 
var vax_booster = []
var fcmtoken
var initbooostercount

var vax_facility
// var vax_vaccinator
// var vax_lotno
// var vax_batchno
var vax_category

// // temp
// var vax_1stdose_month, vax_1stdose_day, vax_1stdose_year
// var vax_2nddose_month, vax_2nddose_day, vax_2nddose_year

const getVacManufacturers = async function (){

    const snapshot = await db.collection('vaccine_manufacturers').get()
    if(!snapshot.empty){
        console.log("getVacManufacturers: Snapshot exists");
        snapshot.forEach((doc)=>{
            const vaccine = { vaccineid: doc.id , vaccinename: doc.data().name};
            vaccineArray.push(vaccine);
        })

    }else{
        console.log("getVacManufacturers: Snapshot does not exist");
    }
}

const getCategories = async function (){

    const snapshot = await db.collection('vaccine_categories').get()
    if(!snapshot.empty){
        console.log("getCategories: Snapshot exists");
        snapshot.forEach((doc)=>{
            const category = { categoryid: doc.id , categoryname: doc.data().name};
            categoryArray.push(category);
        })

    }else{
        console.log("getCategories: Snapshot does not exist");
    }
}

const getUserInfo = async function(uid){
    
    const snapshot = await db.collection('users').doc(uid).get()
    vax_booster =[]
    if(!snapshot.empty){
        console.log("User document found!")

        vax_ID = snapshot.data().vax_ID
        personFN = snapshot.data().firstname
        personLN = snapshot.data().lastname
        personStreet = snapshot.data().street
        personBarangay = snapshot.data().barangay
        personCity = snapshot.data().city
        personProvince = snapshot.data().province
        personRegion = snapshot.data().region

        personName = personFN.concat(" ", personLN)
        personName = personName.toUpperCase()
        personAddress = personStreet.concat(", ", personBarangay, ", ", personCity, ", ", personProvince, ", ", personRegion)
        personAddress = personAddress.toUpperCase()

        vax_1stdose = snapshot.data().vax_1stdose
        vax_2nddose = snapshot.data().vax_2nddose
        vax_booster = snapshot.data().vax_booster
        initbooostercount = vax_booster.length
        fcmtoken = snapshot.data().fcm_token
        // console.log(vax_booster[0].date)

        console.log(vax_booster.length)

        if (snapshot.data().vax_manufacturer) {
            console.log("vax brand set")
            vax_manufacturer = snapshot.data().vax_manufacturer
        } else {
            console.log("no vax brand")
            vax_manufacturer = "0"
        }

        vax_facility = snapshot.data().vax_facility
        // vax_vaccinator = snapshot.data().vax_vaccinator
        // vax_lotno = snapshot.data().vax_lotno
        // vax_batchno = snapshot.data().vax_batchno
        
        if (snapshot.data().vax_category) {
            console.log("vax category set")
            vax_category = snapshot.data().vax_category
        } else {
            console.log("no category")
            vax_category = "0"
        }

        // console.log(snapshot.data().vax_booster)

        // if (snapshot.data().vax_1stdose != ""){
        //     const dose1array = snapshot.data().vax_1stdose.split("/")
        //     vax_1stdose_month = formatCheck("month", dose1array[0])
        //     vax_1stdose_day = formatCheck("day", dose1array[1])
        //     vax_1stdose_year = formatCheck("year", dose1array[2])

        //     vax_1stdose = vax_1stdose_year + "-" + vax_1stdose_month + "-" + vax_1stdose_day
        // } else {
        //     vax_1stdose = ""
        // }

        // if (snapshot.data().vax_2nddose != ""){
        //     const dose2array = snapshot.data().vax_2nddose.split("/")
        //     vax_2nddose_month = formatCheck("month", dose2array[0])
        //     vax_2nddose_day = formatCheck("day", dose2array[1])
        //     vax_2nddose_year = formatCheck("year", dose2array[2])

        //     vax_2nddose = vax_2nddose_year + "-" + vax_2nddose_month + "-" + vax_2nddose_day
        // } else {
        //     vax_2nddose = ""
        // }

    }else{
        console.log("User document does not exist");
    }
}

const updateVaxToFirebase = async function (id, vaxID, vaxBrand, vax1stDose,vax2ndDose,  vaccinator1stDose,  batchno1stDose, lotno1stDose,  vaccinator2ndDose,  batchno2ndDose, lotno2ndDose, vaxCategory, facility) {

    const snapshot = db.collection('users').doc(id)

    const vax1stDoseMap = new Map();
    const vax2ndDoseMap = new Map();

    console.log("Vax 1st dose:" +vax1stDose)
    
    if(vax1stDose != null || vax1stDose != "")
    {
    vax1stDoseMap.set('date', vax1stDose);
    vax1stDoseMap.set('batch_no', batchno1stDose);
    vax1stDoseMap.set('lot_no', lotno1stDose);
    vax1stDoseMap.set('vaccinator', vaccinator1stDose);
    }
    
    vax2ndDoseMap.set('date', vax2ndDose);
    vax2ndDoseMap.set('batch_no', batchno2ndDose);
    vax2ndDoseMap.set('lot_no', lotno2ndDose);
    vax2ndDoseMap.set('vaccinator', vaccinator2ndDose);


    const Vax1stDoseJSOBJ = Object.fromEntries(vax1stDoseMap);
    const Vax2ndDoseJSOBJ = Object.fromEntries(vax2ndDoseMap);

  

    if(vax1stDose == null || vax1stDose == "")
    {
        const updateVax = await snapshot.update({
            vax_ID: vaxID,
            vax_manufacturer: vaxBrand,
            vax_2nddose: Vax2ndDoseJSOBJ,
            vax_category: vaxCategory,
            vax_facility: facility
        }).catch((error)=>{
            var errorCode = error.code
            var errorMessage = error.message
            console.log(errorCode)
            console.log(errorMessage)
        })
    }

    else {
    const updateVax = await snapshot.update({
        vax_ID: vaxID,
        vax_manufacturer: vaxBrand,
        vax_1stdose: Vax1stDoseJSOBJ,
        vax_2nddose: Vax2ndDoseJSOBJ,
        vax_category: vaxCategory,
        vax_facility: facility
    }).catch((error)=>{
        var errorCode = error.code
        var errorMessage = error.message
        console.log(errorCode)
        console.log(errorMessage)
    })
    }
}



const sendVaxNotification = async function (){
    console.log("Updating vax status for user token: " + fcmtoken)
        
        const message = {
            data: {
                title: "Your vaccination status has been updated.", 
                body: "Please check the app for more details.", 
                notif_flag: "2"},
            token: fcmtoken
        }
        
        FBAPP.messaging().send(message).then((response)=>{
            console.log("Successfully sent message: " + response)

        }).catch((error)=>{
            console.log("Error sending message! " + error)
        })
}

const sendBoosterNotification = async function (){
    console.log("Updating booster status for user token: " + fcmtoken)
        
        const message = {
            data: {
                title: "Your vaccine booster record has been added.", 
                body: "Please check the app for more details.", 
                notif_flag: "3"},
            token: fcmtoken
        }
        
        FBAPP.messaging().send(message).then((response)=>{
            console.log("Successfully sent message: " + response)

        }).catch((error)=>{
            console.log("Error sending message! " + error)
        })
}

const updateBoostersToFirebase = async function (id, booster) {

    const snapshot = db.collection('users').doc(id)


    // remove all maps
    const removeBoosters = await snapshot.update({
        vax_booster: booster
    }).catch((error)=>{
        var errorCode = error.code
        var errorMessage = error.message
        console.log(errorCode)
        console.log(errorMessage)
    })
//     .then(()=>{

//         // put all boosters into now empty boostershots array
//         const updateBoosters = snapshot.update({
//             vax_booster: fieldValue.arrayUnion(booster)
//         }).catch((error)=>{
//             var errorCode = error.code
//             var errorMessage = error.message
//             console.log(errorCode)
//             console.log(errorMessage)
//         })
//  })


    
}

function formatCheck(format, given) {

    console.log("=== FUNCTION START ===")
    console.log(format)
    console.log(given)
    const len = given.length
    console.log("Length of given " + format + ": " + len)
    console.log("======================")

    if (format == "day" || format == "month") {
        
        if (parseInt(len) == 1) {
            console.log("given " + format + " (" + given + ") is in incorrect format. Adding 0 beside it.")
            given = "0" + given
            console.log("given " + format + " is now: " + given)
        } else {
            console.log("given " + format + " (" + given + ") is in correct format.")
        }
    } else if (format == "year") {

        if (parseInt(len) == 2) {
            console.log("given year (" + given + ") is in incorrect format. Adding 20 beside it." )
            given = "20" + given
            console.log("given year is now: " + given)             
        } else {
            console.log("given year (" + given + ") is in correct format." )           
        }
    } else
        console.log("may masamang nangyari")

    return given
}

module.exports = router;