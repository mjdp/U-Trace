const express = require('express')
let router = express()

const FBAPP = require ('../firebase');
var db = FBAPP.firestore();

router.use(express.json());
router.use(express.urlencoded({ extended: true }))

// algolia
const algoliasearch = require('algoliasearch')
const client = algoliasearch('GFZDJL0IJF', 'c8532e668143c42900618f77f8435406')
const index = client.initIndex('users')

router.get("/contact-tracing_panel", (req, res) => {
    if(req.session.user){
        if(req.session.role == "Health Authority (Provincial-Level)" || req.session.role == "Health Authority (City-Level)" || req.session.role =="Health Authority (Region-Level)" || req.session.role == "System Admin" || req.session.role == "LGU (Provincial-Level)" || req.session.role == "LGU (City-Level)"){
            index.search().then(({hits}) => {
                let users = []
                for (var i = 0; i < hits.length; i++) {
                    if (hits[i].document_status == "published")
                        users.push(hits[i])
                }
                getGenCountControl().then(() => {
                    if(req.session.role == "Health Authority (Provincial-Level)" || req.session.role == "Health Authority (City-Level)" || req.session.role =="Health Authority (Region-Level)"){
                        res.render('contactTracing.hbs', {users: users,healthAuthority: true, LGU: false, systemAdmin: false})    
                    }else if(req.session.role == "LGU (Provincial-Level)" || req.session.role == "LGU (City-Level)"){
                        res.render('contactTracing.hbs', {users: users,healthAuthority: false, LGU: true, systemAdmin: false})    
                    }else if(req.session.role == "System Admin"){
                         res.render('contactTracing.hbs', {users: users,healthAuthority: false, LGU: false, systemAdmin: true})
                    }
                })
            })      
        }else{
            res.redirect("/")
        }   
    }else{
        res.redirect("/")
    }
})

router.get("/recursion", (req, res) => {

    genArray = [] //2d array (1st bracket generation, 2nd bracket list of contacts)
    allContactsArray = [] //contains all contact records
    blacklistedNames = [] //remove a name from contact tracing
    fromToArray = []
   //RECURSIVE ATTEMPT
    genCount = -1 //stops the recursive function when at 3
   //REMINDER - save first contactname as root node

    initialCount = 0
    currentGenCount = 0
    NextGenCount = 0
    runningCount = -1
    currentCount = 1
    nextCount = 0
    
    // for getCloseContactsDetails()
    userFN = ""
    ccRecordsDetails = []
    usersPages = []
    center = req.query.useruid
    
    recursiveContactTrace(req.query.useruid, 0, req, res)
   
})

router.get("/notifyUsers", (req, res) => {
    var usersToBeNotified = req.query.usersToNotify
    console.log("Users to be notified: " + usersToBeNotified)
    notifyCloseContacts(usersToBeNotified).then(()=>{
        res.send("success")
    })
})

router.get("/jumpToPage", (req, res) => {

    if(req.session.user){

        // update current page
        currPage = req.query.pageNum
        console.log("ROUTER :: Current Page: ")
        console.log(req.query.pageNum)
     
        // send chosen page, minus 1 (because user pages are in array)
        res.json({
            ccRecordsDetails: usersPages[req.query.pageNum-1],
            currPage: currPage
        })
 
        
    }else{
        res.redirect("/")
    }
})


const notifyCloseContacts = async function(userArray){
    var fcmTokensArray = []

    for(i = 0; i < userArray.length; i++){
        let user = await db.collection('users').doc(userArray[i]).get()
        if(user.exists){
            console.log("User " + user.data().firstname + "'s token: " + user.data().fcm_token)
            fcmTokensArray.push(user.data().fcm_token)
        }
    }

    console.log("FCM Tokens: " + fcmTokensArray)

    const message = {
        data: {
            title: "You've come into close contact with a COVID-positive person.",
            body: "Please get yourself tested for COVID-19 as soon as possible.",
            notif_flag: "5"
        },
        tokens: fcmTokensArray 
    }

    FBAPP.messaging().sendMulticast(message).then((response)=>{
        console.log("Messages to be sent: " + userArray.length)
        console.log("Messages that were successfully sent: " + response.successCount)
    }).catch((error)=>{
        console.log("Error sending message! " + error)
    })
}

// Repush this
var genArray = [] //2d array (1st bracket generation, 2nd bracket list of contacts)
var allContactsArray = [] //contains all contact records
var blacklistedNames = [] //remove a name from contact tracing
var fromToArray = []
//RECURSIVE ATTEMPT
var genCount = -1 //stops the recursive function when at 3
//REMINDER - save first contactname as root node

var initialCount = 0
var currentGenCount = 0
var NextGenCount = 0

var currentCount = 1
var nextCount = 0

var runningCount = -1

var genCountControl

var userFN
var userAdd
var id

// PAGINATION
var ccRecordsDetails = []
var currPage = 1
var totalPages = 0
var totalPagesValues // for pagination UI; use totalPages for reference
var usersPerPage = 8 // manually set for now
var usersPages // array of arrays: each array is *usersPerPage* users

const recursiveContactTrace = async function(contactname, currentGenCount, req, res){
    const snapshot = await db.collection('filtered_contact_records').doc(contactname).get()
    console.log("Getting Close Contact of:  " +contactname)
    
    runningCount += 1
    console.log("Running Count: " + runningCount)
    console.log("Initial Count: " + initialCount)
    console.log("Generation Count: " + genCount)
    currentCount -=1

    if (snapshot.exists && snapshot.data().contact_records.length > 0 ) { // && ((runningCount >=0 && initialCount >=0) || (runningCount!=initialCount)))

        if(allContactsArray.length == 0){
            allContactsArray.push({id: contactname, fullname: snapshot.data().full_name, group: "Base"})
        }

        if(currentCount <= 0){
            currentCount = nextCount
            nextCount = 0
            genCount+=1
        }
        const closeConctactArray = snapshot.data().contact_records
        //loop?
        //expected output: genArray[0]['Adrian','Denver','Marco']
        genArray[genCount] = closeConctactArray
        currentGenCount = genArray[genCount].length
        //removal process - loop for now pero hanap ng better solution
        blacklistedNames.forEach((name)=>{
            if(genArray[genCount].map((e)=>{return e.contactId}).indexOf(name) > -1){
                genArray[genCount].splice(genArray[genCount].map((e)=>{return e.contactId}).indexOf(name), 1)
            }
        })
        
        genArray[genCount].forEach((contactNode)=>{
            console.log("Gen " + genCount + " record: " + contactNode.contactId)
            allContactsArray.push({id: contactNode.contactId, fullname: contactNode.full_name , group: "" + genCount})
            var filteredFromTo = fromToArray.filter((currElement)=>{
                return currElement.from === contactNode.contactId && currElement.to === contactname
            })

            var fromToObj = {
                from: contactname,
                to: contactNode.contactId,
                fromname: allContactsArray.find(x => x.id === contactname).fullname,
                toname: contactNode.full_name
            }
            fromToArray.push(fromToObj)
           
        })
        console.log(fromToArray)
        blacklistedNames.push(contactname)
        console.log("GenArray Size: " + genArray[genCount].length);
        
        if(genCount < genCountControl){ 
         currentGenCount = 0
            genArray[genCount].forEach((contactNode)=>{
                var nextName = contactNode.contactId
                console.log("Recursive Loop Next Name: " + nextName);
                initialCount +=1
                currentGenCount +=1

                nextCount = currentGenCount
         
                console.log("Current Gen Count: " + currentGenCount)
                console.log("Current Count: " + genCount)
                console.log("Next Count: " + nextCount)
                console.log("Gen Count Count: " + genCountControl)

                recursiveContactTrace(nextName,currentGenCount, req, res)
            })
          
         } 
    } 
    
    
    if (runningCount == initialCount && ((genCount <= genCountControl) || (genCount>genCountControl)|| genCount == -1 || genArray[genCount].length<=0)) { // (currentCount <= 0 || genCount >= 3)
        console.log("[!] Recursion complete, printing all contacts:")
        console.log("Initial Count: " + initialCount)
        console.log("Running Count: " + runningCount)
        
        for(j = 0; j < allContactsArray.length; j++) {

            let user = await db.collection('users').doc(allContactsArray[j].id).get()
            console.log("iteration #: " + j + " | Name: " + user.data().firstname + " " + user.data().lastname)
            console.log("Contact # " + j + ": " + allContactsArray[j].id)

            if (j == 0) { // only need the first person's name
                userFN = user.data().firstname + " " + user.data().lastname
                userAdd = user.data().street + " " + user.data().barangay + " " + user.data().city + " " + user.data().province + " " + user.data().region

            } else { // other people -- need data

                var lastTestDate
                // var vaxBrand
                // var firstdose
                // var seconddose

                if (user.data().last_testdate != "") lastTestDate = user.data().last_testdate
                else lastTestDate = "N/A"

                // if (user.data().vax_manufacturer != "") vaxBrand = user.data().vax_manufacturer
                // else vaxBrand = "N/A"

                // if (user.data().vax_1stdose != "") firstdose = user.data().vax_1stdose
                // else firstdose = "N/A"

                // if (user.data().vax_2nddose != "") seconddose = user.data().vax_2nddose
                // else seconddose = "N/A"

                const userDetails = {
                    ccID: allContactsArray[j].id,
                    ccName: user.data().firstname + " " + user.data().lastname,
                    ccPhone: user.data().phone,
                    ccCity: user.data().city,
                    ccStatus: user.data().covid_positive,
                    ccLastTestDate: lastTestDate,

                    ccBarangay: user.data().barangay,
                    ccProvince: user.data().province,
                    ccRegion: user.data().region
                    // ccVax: vaxBrand,  
                    // ccDose1: firstdose,  
                    // ccDose2: seconddose
                }
                ccRecordsDetails.push(userDetails)
            }
        }

        if (userFN == "") {
            let check = await db.collection('users').doc(center).get()
            userFN = check.data().firstname + " " + check.data().lastname
            userAdd = check.data().street + " " + check.data().city + " " + check.data().barangay + " " + check.data().city + " " + check.data().province + " " + check.data().region
        }
    
        if (ccRecordsDetails.length > 0) {
            console.log("Has close contacts.")

            initPagination()

            console.log("Res.json-ing...")

            res.json({
                nodes: allContactsArray,
                edges: fromToArray,
                userFN: userFN,
                userAdd: userAdd,
                
                allUsers: ccRecordsDetails,
                pageCount: totalPagesValues,
                totalPages: totalPages,
                currPage: currPage,
                ccRecordsDetails: usersPages[0]
            })      
        } else {
            console.log("No close contacts.")
            res.json({
                nodes: allContactsArray,
                edges: fromToArray,
                userFN: userFN
            })           
        }
    }
}

const getGenCountControl = async function(){

    const snapshot = await db.collection('admin_configurations').doc('settings').get()
    if(snapshot.exists){
        console.log("getGenCountControl: Snapshot exists")
        genCountControl = snapshot.data().generation_count;
        console.log(genCountControl)
        genCountControl -=1
        
    }
    else {
    console.log("getGenCountControl: Snapshot does not exist")
    genCountControl = 3;
    }
}

const initPagination = function() {

    // Determine pagination variables
    totalPages = Math.ceil((ccRecordsDetails.length/usersPerPage))

    // Reset current page
    currPage = 1

    // allot users in each page in usersPages (max # of users per page: usersPerPage)
    usersPages = []
    var userCount = 0
    for (var i = 0; i < totalPages; i++) {
        var usersForThisPage = []
        for (var j = 0; j < usersPerPage && ccRecordsDetails[userCount] != undefined; j++, userCount++) {
            usersForThisPage.push(ccRecordsDetails[userCount])
        }
        usersPages.push(usersForThisPage)
    }

    // set page values for pagination UI
    totalPagesValues = []
    for (var i = 1; i <= totalPages; i++) {
        totalPagesValues.push(i)
    }

    console.log("Pagination initialization complete!")

}

module.exports = router;