const express = require('express')
let router = express()
const firebase = require('firebase/app');
const firebaseConfig = require('./config.js');
const admin = require('firebase-admin');
var serviceAccount = require('./serviceAccount.json');

const FBAPP = require ('../firebase')
var db = FBAPP.firestore()

// algolia
const algoliasearch = require('algoliasearch');
const e = require('express');
const client = algoliasearch('GFZDJL0IJF', 'c8532e668143c42900618f77f8435406')
const index = client.initIndex('users')

router.use(express.json());
router.use(express.urlencoded({ extended: true }))

// VAR
var usersArray
var currPage = 1
var totalPages = 0
var totalPagesValues // for pagination UI; use totalPages for reference
var usersPerPage = 12 // manually set for now
var usersPages // array of arrays: each array is *usersPerPage* users

var userData

// ROUTERS
router.get("/users-info_panel", (req, res) => {

    initValues()

    if(req.session.user){

        getListofUsers(req.session.role, req.session.address).then(()=>{

            initPagination()

            if(req.session.role == "Health Authority (Provincial-Level)" || req.session.role == "Health Authority (City-Level)" || req.session.role =="Health Authority (Region-Level)"){
                res.render('usersInfo.hbs', {allUsers: usersArray, users: usersPages[0], pageCount: totalPagesValues, healthAuthority: true, LGU: false, systemAdmin: false})    
            }else if(req.session.role == "LGU (City-Level)" || req.session.role == "LGU (Provincial-Level)"){
                res.render('usersInfo.hbs', {allUsers: usersArray, users: usersPages[0], pageCount: totalPagesValues, healthAuthority: false, LGU: true, systemAdmin: false})
            }else if(req.session.role == "System Admin"){
                res.render('usersInfo.hbs', {allUsers: usersArray, users: usersPages[0], pageCount: totalPagesValues, healthAuthority: false, LGU: false, systemAdmin: true})
            }
        })
       }else{
           res.redirect('/')
       }
})

router.get("/notifyUser", (req, res) => {

    notify(req.query.id).then(() => {
        res.send("success")
    })
})

router.get("/pullUserData", (req, res) => {

    if(req.session.user){

        getUserData(req.query.mPhoneNo).then(() => {
            res.json({
                userData: userData
            })            
        })
         
    }else{
        res.redirect("/")
    }
})

router.get("/jumpToPage", (req, res) => {

    if(req.session.user){

        // update current page
        currPage = req.query.pageNum
        console.log("ROUTER :: Current Page: ")
        console.log(req.query.pageNum)
     
        // send chosen page, minus 1 (because user pages are in array)
        res.json({
            users: usersPages[req.query.pageNum-1],
            currPage: currPage
        })
 
        
    }else{
        res.redirect("/")
    }
})

router.get("/searchUserInPages", (req, res) => {

    if(req.session.user){

        // search
        var i = 0
        var j = 0
        var found = false

        // while there are still users in pages left to check or user hasn't been found
        while (found == false) {

            // if user is found in this page
            if (usersPages[i][j].id == req.query.uid) {

                console.log("found!")
                found = true

            } else {

                // if traversed through all users in this page, go to the next
                if (usersPages[i][j+1] == undefined) {
                    i++
                    j = 0
                } 
                // else, next user in the page
                else {
                    j++
                }
            }
        }

        if (found) {



            // update current page (i ctr is with respect to arrays and not the page number itself, so + 1)
            currPage = i+1

            console.log("Found User Details:")
            console.log(usersPages[i][j].phone)

            res.json({
                users: usersPages[i],
                currPage: currPage,
                mPhoneNo: usersPages[i][j].phone
            })
        }  
        
    }else{
        res.redirect("/")
    }
})



router.get("/sendTotalPages", (req, res) => {
    
    if(req.session.user){

        // send number of pages in total
        res.json({
            totalPages: totalPages
        })
        
    }else{
        res.redirect("/")
    }
})


// FUNCTIONS
const getListofUsers = async function(userRole, userAddress) {

    usersArray = []

    const search = await index.search().then(({ hits }) => {
        
        // [1] Filter search results
        var included
        var availableName
        var counter = 0 // UNIMPORTANT!
        for (var i = 0; i < hits.length; i++) {
            
            included = true

            // Filter users based on location and role (Note: no location/role filtering for System Admins)
            if(userRole == "Health Authority (Region-Level)") {
                if(userAddress.region != hits[i].region){
                    included = false
                 }
            }else if(userRole == "LGU (Provincial-Level)" || userRole == "Health Authority (Provincial-Level)"){
                if(userAddress.province != hits[i].province) {
                    included = false
                }
            }else if(userRole == "LGU (City-Level)" || userRole == "Health Authority (City-Level)"){
                if(userAddress.city != hits[i].city) {
                    included = false
                }
            }

            // Filter users depending on document status
            if (hits[i].document_status != "published") {
                included = false
                counter++ // UNIMPORTANT!
            }

            // verification testing
            var vResult
            if (hits[i].verification  != undefined) {
                if (hits[i].verification == true) {
                    vResult = "Yes"
                } else {
                    vResult = "No"
                }
            } else {
                vResult="N/A"
            }           

            // name cleaning
            if (hits[i].firstname != undefined && hits[i].lastname != undefined) {
                availableName = hits[i].firstname + " " + hits[i].lastname
            } else if (hits[i].firstname == undefined && hits[i].lastname != undefined) {
                availableName = hits[i].lastname
            } else if (hits[i].firstname != undefined && hits[i].lastname == undefined) {
                availableName = hits[i].firstname
            } else {
                included = false
            }
            
            // Include if user passed filtering
            if (included) {
                usersArray.push({
                    id: hits[i].objectID,
                    name: availableName,
                    phone: hits[i].phone,
                    city: hits[i].city,
                    v_status: vResult
                })
            }
        }

        // /////////////////////////////////////////////////////// //
        console.log("ALGOLIA RESULTS:")
        console.log("USER COUNT: " + usersArray.length + "| DISCOUNTED: " + counter) // UNIMPORTANT!
    })


}

const getUserData = async function(mPhoneNo) {
    
    const snapshot = await db.collection('users').where('phone', '==', mPhoneNo).get()

    if(!snapshot.empty){

        snapshot.forEach((doc) =>{

            // [1] cleaning data
            var availableName
            var vResult // verification status
            var tResult // last test result
            var cResult // covid

            var vaxID
            var vaxFacility
            var vaxCategory
            var vaxManufacturer

            var dose1date
            var dose1batchNo
            var dose1lotNo
            var dose1vaccinator

            var dose2date
            var dose2batchNo
            var dose2lotNo
            var dose2vaccinator

            var boosters
            var tests

            // name cleaning
            if (doc.data().firstname != undefined && doc.data().lastname != undefined) {
                availableName = doc.data().firstname + " " +  doc.data().lastname
            } else if (doc.data().firstname == undefined &&  doc.data().lastname != undefined) {
                availableName =  doc.data().lastname
            } else if (doc.data().firstname != undefined &&  doc.data().lastname == undefined) {
                availableName = doc.data().firstname
            }

            // verification checking
            if (doc.data().verification != undefined) {
                if (doc.data().verification == true) {
                    vResult = "Yes"
                } else {
                    vResult = "No"
                }
            } else {
                vResult="N/A"
            }

            // last test result checking
            if (doc.data().last_testdate != "") {
                tResult = doc.data().last_testdate
            } else {
                tResult = "N/A"
            }

            // positive/negative data checking
            if (doc.data().covid_positive != undefined) {
                if (doc.data().covid_positive == true)
                    cResult = "Positive"
                else if (doc.data().covid_positive == false)
                    cResult = "Negative"
                else 
                    cResult = "Untested"
            }
            else {
                cResult="N/A"
            }

            // vax id availability checking
            if (doc.data().vax_ID == undefined || doc.data().vax_ID == "") {
                vaxID = "N/A"
            } else {
                vaxID = doc.data().vax_ID
            }

            // vax facility availability checking
            if (doc.data().vax_facility == undefined || doc.data().vax_facility == "") {
                vaxFacility = "N/A"
            } else {
                vaxFacility = doc.data().vax_facility
            }

            // vax category availability checking
            if (doc.data().vax_category == undefined || doc.data().vax_category == "") {
                vaxCategory = "N/A"
            } else {
                vaxCategory = doc.data().vax_category
            }
            
            // vax brand availability checking
            if (doc.data().vax_manufacturer == undefined || doc.data().vax_manufacturer == "") {
                vaxManufacturer = "N/A"
            } else {
                vaxManufacturer = doc.data().vax_manufacturer
            }

            // vax first dose availability checking
            if (doc.data().vax_1stdose.date == undefined || doc.data().vax_1stdose.date == "") {
                dose1date = "N/A"
            } else {
                dose1date = doc.data().vax_1stdose.date
            }
            if (doc.data().vax_1stdose.batch_no == undefined || doc.data().vax_1stdose.batch_no == "") {
                dose1batchNo = "N/A"
            } else {
                dose1batchNo = doc.data().vax_1stdose.batch_no
            }
            if (doc.data().vax_1stdose.lot_no == undefined || doc.data().vax_1stdose.lot_no == "") {
                dose1lotNo = "N/A"
            } else {
                dose1lotNo = doc.data().vax_1stdose.lot_no
            }
            if (doc.data().vax_1stdose.vaccinator == undefined || doc.data().vax_1stdose.vaccinator == "") {
                dose1vaccinator = "N/A"
            } else {
                dose1vaccinator = doc.data().vax_1stdose.vaccinator
            }

            // vax second dose availability checking
            if (doc.data().vax_2nddose.date == undefined || doc.data().vax_2nddose.date == "") {
                dose2date = "N/A"
            } else {
                dose2date = doc.data().vax_2nddose.date
            }
            if (doc.data().vax_2nddose.batch_no == undefined || doc.data().vax_2nddose.batch_no == "") {
                dose2batchNo = "N/A"
            } else {
                dose2batchNo = doc.data().vax_2nddose.batch_no
            }
            if (doc.data().vax_2nddose.lot_no == undefined || doc.data().vax_2nddose.lot_no == "") {
                dose2lotNo = "N/A"
            } else {
                dose2lotNo = doc.data().vax_2nddose.lot_no
            }
            if (doc.data().vax_2nddose.vaccinator == undefined || doc.data().vax_2nddose.vaccinator == "") {
                dose2vaccinator = "N/A"
            } else {
                dose2vaccinator = doc.data().vax_2nddose.vaccinator
            }

            // boosters availability checking
            if (doc.data().vax_booster != undefined && doc.data().vax_booster.length > 0) {
                boosters = doc.data().vax_booster
            } else {
                boosters = "N/A"
            }

            // covid19 test results availability checking
            if (doc.data().covid_tests != undefined && doc.data().covid_tests.length > 0) {
                tests = doc.data().covid_tests
            } else {
                tests = "N/A"
            }

            // [2] wrap data then send
            let result = {

                uid: doc.id,
                name: availableName,
                verified: vResult,
                last_testdate: tResult,
                status: cResult,

                region: doc.data().region,
                province: doc.data().province,
                city: doc.data().city,
                barangay: doc.data().barangay,
                street: doc.data().street,

                vaxID: vaxID,
                vaxFacility: vaxFacility,
                vaxCategory: vaxCategory,
                vaxManufacturer: vaxManufacturer,

                dose1date: dose1date,
                dose1batchNo: dose1batchNo,
                dose1lotNo: dose1lotNo,
                dose1vaccinator: dose1vaccinator,

                dose2date: dose2date,
                dose2batchNo: dose2batchNo,
                dose2lotNo: dose2lotNo,
                dose2vaccinator: dose2vaccinator,

                boosters: boosters,
                tests: tests
            }
            userData = result
            
        })
    } else {
        console.log("USERSINFO.JS | getUserData() | No user found with phone #: " + mPhoneNo)
    }
}

const notify = async function(id) {

    console.log("Entered Notify Function")
    console.log(id)

    const user = await db.collection('users').doc(id).get()

    if(user.exists){
        var fcmtoken = user.data().fcm_token
        console.log("User token: " + fcmtoken)

        const message = {
            data: {
                title: "Your account hasn't been verified yet.", 
                body: "Please verify your account via the profile page as soon as possible.",
                notif_flag: "5"},
            token: fcmtoken
        }
        FBAPP.messaging().send(message).then((response)=>{
            console.log("Successfully sent message: " + response)

        }).catch((error)=>{
            console.log("Error sending message! " + error)
        })
    } else {
        console.log("User does not exist.")
    }
}

const initValues = function() {
    currPage = 1
    totalPages = 0
    totalPagesValues = []
    usersPages = []
    usersArray = []
}

const initPagination = async function() {

    // Sort array (based on name)
    usersArray.sort(nameComparison)

    // Determine pagination variables
    totalPages = Math.ceil((usersArray.length/usersPerPage))

    // allot users in each page in usersPages (max # of users per page: usersPerPage)
    usersPages = []
    var userCount = 0
    for (var i = 0; i < totalPages; i++) {
        var usersForThisPage = []
        for (var j = 0; j < usersPerPage && usersArray[userCount] != undefined; j++, userCount++) {
            usersForThisPage.push(usersArray[userCount])
        }
        usersPages.push(usersForThisPage)
    }

    // set page values for pagination UI (ignore first page count)
    totalPagesValues = []
    for (var i = 2; i <= totalPages; i++) {
        totalPagesValues.push(i)
    }

    // /////////////////////////////////////////////////////// //
    console.log("PAGES: " + totalPages)
    console.log("USERS PER PAGE: ")
    console.log(usersPages)
}

const nameComparison = function(a, b) {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {  return -1 }
    if (a.name.toLowerCase() > b.name.toLowerCase()) {  return  1 }
    return 0
}

module.exports = router;