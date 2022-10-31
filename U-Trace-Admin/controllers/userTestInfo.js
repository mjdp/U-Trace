const express = require('express')
let router = express()

// algolia
const algoliasearch = require('algoliasearch')
const client = algoliasearch('GFZDJL0IJF', 'c8532e668143c42900618f77f8435406')
const index = client.initIndex('users')

// firebase
const FBAPP = require ('../firebase')
const admin = require('firebase-admin')
const fieldValue = admin.firestore.FieldValue
var db = FBAPP.firestore()

router.use(express.json());
router.use(express.urlencoded({ extended: true }))

// ROUTERS
router.get("/newUserTestResult", (req, res) => {
    // check for valid user
    if(req.session.user){
        if(req.session.role == "Health Authority (City-Level)" || req.session.role == "Health Authority (Provincial-Level)"|| req.session.role =="Health Authority (Region-Level)"){
            // get users thru algolia
            users = []
            methods = []
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
                getMethods().then(()=>{
                    console.log(methods)
                    res.render('userTestInfo.hbs', {users: users, healthAuthority: true, LGU: false, systemAdmin: false, methods: methods})
                })

            })
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    }
})

router.get("/getUserTestHistory", (req, res) => {

    if(req.session.user){
        if(req.session.role == "Health Authority (City-Level)" || req.session.role == "Health Authority (Provincial-Level)"|| req.session.role =="Health Authority (Region-Level)"){

            console.log(req.query.userid)
        
            getTestHistory(req.query.userid).then(()=>{
                
                console.log("USER'S COVID TESTS:")
                console.log(personName)
                console.log(personAddress)
                console.log(userCovidTests)

                
                res.json({
                    userCovidTests: userCovidTests,
                    userFullName: personName,
                    userFullAddress: personAddress
                })
            })
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    }
})


router.post("/confirmTestResult", (req, res) => {
    if(req.session.user){
        if(req.session.role == "Health Authority (City-Level)" || req.session.role == "Health Authority (Provincial-Level)"|| req.session.role =="Health Authority (Region-Level)"){
            console.log(req.body)
            updateTestToFirebase(
                req.body.userlist,
                req.body.testDate,
                req.body.testID,
                req.body.testResult,
                req.body.facility,
                req.body.method
            ).then(() => {
                if (req.body.testResult == "true") {
                    res.render('userTestInfo.hbs', {users: users, healthAuthority: true, LGU: false, systemAdmin: false, methods: methods, success: true})
                } else if (req.body.testResult == "false") {
                    res.render('userTestInfo.hbs', {users: users, healthAuthority: true, LGU: false, systemAdmin: false, methods: methods, success_negative: true})
                }
            })
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    }
   
})

// HOLDERS
var covidTests = []
var methods = []
var personName
var personAddress

var personFN
var personLN
var personStreet
var personBarangay
var personCity
var personProvince
var personRegion

// FUNCTIONS

const getTestHistory = async function(uid) {

    personName = ""
    personAddress = ""
    personFN = ""
    personLN = ""
    personStreet = ""
    personBarangay = ""
    personCity = ""
    personProvince = ""
    personRegion = ""
    userCovidTests = []
    
    const snapshot = await db.collection('users').doc(uid).get()

    if (!snapshot.empty) {
        userCovidTests = snapshot.data().covid_tests
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
    } else {
        console.log("User document does not exist")
    }
}

const getMethods = async function (){

    const snapshot = await db.collection('test_methods').get()
    if(!snapshot.empty){
        console.log("test_methods: Snapshot exists");
        snapshot.forEach((doc)=>{
            const method = { methodID: doc.id , methodName: doc.data().name};
            methods.push(method)
        })

    }else{
        console.log("test_methods: Snapshot does not exist");
    }
}

const updateTestToFirebase = async function (id, date, testid, result, facility, method) {

    // get user's collection data
    const snapshot = db.collection('users').doc(id)
    const filteredRecords = db.collection('filtered_contact_records').doc(id)

    var resultTitle

    // labeling
    if (result == "true") {
        result = true
        resultTitle = "Positive"
    } else {
        result = false
        resultTitle = "Negative"
    }

    // new map to add to user's test results
    var newTestCase = {
        date: date,
        testID: testid,
        facility: facility,
        method: method,
        result: resultTitle
    }

    // update
    const update = await snapshot.update({
        covid_positive: result,
        last_testdate: date,
        covid_tests: fieldValue.arrayUnion(newTestCase)
    }).catch((error)=>{
        var errorCode = error.code
        var errorMessage = error.message
        console.log(errorCode)
        console.log(errorMessage)
    })
    
    // update
    //CURRENT BEHAVIOR: if result is negative, then delete records
    if(result){
        const updateFilteredRecord = await filteredRecords.update({
            covid_positive: result,
        }).catch((error)=>{
            var errorCode = error.code
            var errorMessage = error.message
            console.log(errorCode)
            console.log(errorMessage)
        })
    } else {
        removeContactRecords(id)
    }

    
    //send a notification to the user    
    const user = await snapshot.get()
    if(user.exists){
        var fcmtoken = user.data().fcm_token
        console.log("User token: " + fcmtoken)

        if(result){
            var msgTitle = user.data().firstname + ", you tested POSITIVE for COVID-19."
            var msgBody = "Please upload your contact records immediately." 
        } else {
            var msgTitle = user.data().firstname + ", you tested NEGATIVE for COVID-19."
            var msgBody = "Please continue to take all necessary precautions to stay safe against COVID-19."
        }

        const message = {
            data: {
                title: msgTitle, 
                body: msgBody,
                notif_flag: "1"},
            token: fcmtoken
        }

        FBAPP.messaging().send(message).then((response)=>{
            console.log("Successfully sent message: " + response)

        }).catch((error)=>{
            console.log("Error sending message! " + error)
        })
    }
    
}

const removeContactRecords = async function(id){
    //const deleteRef = await db.collection().
    const snapshot = await db.collection('filtered_contact_records').doc(id).get()

    if(snapshot.exists){
        const closeContactArray = snapshot.data().contact_records
        
        if(closeContactArray.length > 0){
            closeContactArray.forEach((closeContact)=>{
                //get close contact array of "closeContact"
                //ccFbFCRDoc - close contact Firebase Filtered Contact Records Doc
                var ccFbFCRDoc = db.collection('filtered_contact_records').doc(closeContact.contactId)
                ccFbFCRDoc.get().then((snapshot2)=>{
                    if(snapshot2.exists){
                        //get contact records of close contact
                        var closeContactFCRArr = snapshot2.data().contact_records
                        //find the user in close contact's records array
                        var userToBeRemoved = closeContactFCRArr.filter(obj => obj.contactId == id)[0]
                        //update and remove user from close contact's records array
                        ccFbFCRDoc.update({contact_records: admin.firestore.FieldValue.arrayRemove(userToBeRemoved)})
                    }
                })
            })
        }

        //delete snapshot reference
        snapshot.ref.delete()
    }
}

module.exports = router;