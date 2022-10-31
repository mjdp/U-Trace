const express = require('express')
let router = express()
const firebase = require('firebase/app')
const firebaseConfig = require('./config.js')
firebase.initializeApp(firebaseConfig)

const firebaseAuth = require('firebase/auth')
const auth = firebaseAuth.getAuth()

const admin = require('firebase-admin')
const FBAPP = require ('../firebase')
var db = FBAPP.firestore()

var serviceAccount = require('./serviceAccount.json')
const e = require('express')

router.use("/user", require("./user"))
router.use("/contactTracing", require("./contactTracing"))
router.use("/usersInfo", require("./usersInfo"))
router.use("/addUser", require("./addUser"))
router.use("/userVaxInfo", require("./userVaxInfo"))
router.use("/userTestInfo", require("./userTestInfo"))
router.use("/settings", require("./settings"))
router.use("/faq", require("./faq"))

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

router.get('/', (req, res) => {

    areaArray = []
    area = ""
    registeredUsersPerArea = []
    positiveUsersPerArea = []
    firstDoseUsersPerArea = []
    secondDoseUsersPerArea = []
    boosteredUsersPerArea = []
    
    
    if(req.session.user){
        getDashboardData(req.session.address, req.session.role).then(()=>{

        formatRegisteredUsers()
        formatPositiveUsers()
        formatFirstDoseUsers()
        formatSecondDoseUsers()
        formatBoosteredUsers()
       
        console.log("RESULT: ")
        console.log("Unvaccinated Positives: " + unvaccinatedPositives)
        console.log("First Dose Positives: " + firstDosePositives)
        console.log("Fully Vaxxed Positives: " + secondDosePositives)
        console.log("Boostered Positives: " + boosteredPositives)

        console.log("--------------------------------------------------------------------------------------------")
        console.log("AREA RESULT:")
        console.log(areaArray);

        if( req.session.role =="Health Authority (Region-Level)"){
            res.render('index.hbs', {healthAuthority: true, LGU: false, systemAdmin: false, regions: regionsArray})
        }else if(req.session.role == "Health Authority (Provincial-Level)"){
            res.render('index.hbs', {healthAuthority: true, LGU: false, systemAdmin: false, regions: regionsArray})
        }else if(req.session.role == "Health Authority (City-Level)"){
            res.render('index.hbs', {healthAuthority: true, LGU: false, systemAdmin: false, regions: regionsArray})
        }else if(req.session.role == "LGU (Provincial-Level)"){
            res.render('index.hbs', {healthAuthority: false, LGU: true, systemAdmin: false, regions: regionsArray})
        }else if(req.session.role == "LGU (City-Level)"){
            res.render('index.hbs', {healthAuthority: false, LGU: true, systemAdmin: false, regions: regionsArray})
        }else if(req.session.role == "System Admin"){
            res.render('index.hbs', {healthAuthority: false, LGU: false, systemAdmin: true, regions: regionsArray})
        }
    })
    
    }else{
        console.log("No user detected, please login")
        res.redirect('/user/user-login')
    }
})

router.get("/retrieveChartValues", (req, res) => {

    console.log("got here from ajax!")
    
    if(req.session.user){

        if (req.session.role =="Health Authority (Region-Level)"){
            res.json({
                registeredUserLabel: "IN " +  req.session.address.region, firstDoseCount: firstDoseCount,
                secondDoseCount: secondDoseCount, boosterCount: boosterCount, unvaccinated: unvaccinated,
                registeredUsers: registeredUserCount, positiveUsers: positiveCount, negativeUsers: negativeCount,
                firstDosePositives: firstDosePositives, firstDoseNegatives: firstDoseNegatives,
                secondDosePositives: secondDosePositives, secondDoseNegatives: secondDoseNegatives,
                boosteredPositives: boosteredPositives, boosteredNegatives: boosteredNegatives,
                unvaccinatedPositives: unvaccinatedPositives, unvaccinatedNegatives: unvaccinatedNegatives,
                area: area, registeredUsersPerArea: registeredUsersPerArea, positiveUsersPerArea: positiveUsersPerArea,
                firstDoseUsersPerArea: firstDoseUsersPerArea, secondDoseUsersPerArea: secondDoseUsersPerArea, boosteredUsersPerArea: boosteredUsersPerArea
            })
        }
        else if (req.session.role == "Health Authority (Provincial-Level)"){
            res.json({
                registeredUserLabel: "IN " +  req.session.address.province, firstDoseCount: firstDoseCount,
                secondDoseCount: secondDoseCount, boosterCount: boosterCount, unvaccinated: unvaccinated,
                registeredUsers: registeredUserCount, positiveUsers: positiveCount, negativeUsers: negativeCount,
                firstDosePositives: firstDosePositives, firstDoseNegatives: firstDoseNegatives,
                secondDosePositives: secondDosePositives, secondDoseNegatives: secondDoseNegatives,
                boosteredPositives: boosteredPositives, boosteredNegatives: boosteredNegatives,
                unvaccinatedPositives: unvaccinatedPositives, unvaccinatedNegatives: unvaccinatedNegatives,
                area: area, registeredUsersPerArea: registeredUsersPerArea, positiveUsersPerArea: positiveUsersPerArea,
                firstDoseUsersPerArea: firstDoseUsersPerArea, secondDoseUsersPerArea: secondDoseUsersPerArea, boosteredUsersPerArea: boosteredUsersPerArea
            })
        }
        else if (req.session.role == "Health Authority (City-Level)"){
            res.json({
                registeredUserLabel: "IN " +  req.session.address.city, firstDoseCount: firstDoseCount,
                secondDoseCount: secondDoseCount, boosterCount: boosterCount, unvaccinated: unvaccinated,
                registeredUsers: registeredUserCount, positiveUsers: positiveCount, negativeUsers: negativeCount,
                firstDosePositives: firstDosePositives, firstDoseNegatives: firstDoseNegatives,
                secondDosePositives: secondDosePositives, secondDoseNegatives: secondDoseNegatives,
                boosteredPositives: boosteredPositives, boosteredNegatives: boosteredNegatives,
                unvaccinatedPositives: unvaccinatedPositives, unvaccinatedNegatives: unvaccinatedNegatives,
                area: area, registeredUsersPerArea: registeredUsersPerArea, positiveUsersPerArea: positiveUsersPerArea,
                firstDoseUsersPerArea: firstDoseUsersPerArea, secondDoseUsersPerArea: secondDoseUsersPerArea, boosteredUsersPerArea: boosteredUsersPerArea
            })
        }
        else if(req.session.role == "LGU (Provincial-Level)"){
            res.json({
                registeredUserLabel: "IN " +  req.session.address.province, firstDoseCount: firstDoseCount,
                secondDoseCount: secondDoseCount, boosterCount: boosterCount, unvaccinated: unvaccinated,
                registeredUsers: registeredUserCount, positiveUsers: positiveCount, negativeUsers: negativeCount,
                firstDosePositives: firstDosePositives, firstDoseNegatives: firstDoseNegatives,
                secondDosePositives: secondDosePositives, secondDoseNegatives: secondDoseNegatives,
                boosteredPositives: boosteredPositives, boosteredNegatives: boosteredNegatives,
                unvaccinatedPositives: unvaccinatedPositives, unvaccinatedNegatives: unvaccinatedNegatives,
                area: area, registeredUsersPerArea: registeredUsersPerArea, positiveUsersPerArea: positiveUsersPerArea,
                firstDoseUsersPerArea: firstDoseUsersPerArea, secondDoseUsersPerArea: secondDoseUsersPerArea, boosteredUsersPerArea: boosteredUsersPerArea
            })
        }
        else if(req.session.role == "LGU (City-Level)"){
            res.json({
                registeredUserLabel: "IN " +  req.session.address.city, firstDoseCount: firstDoseCount,
                secondDoseCount: secondDoseCount, boosterCount: boosterCount, unvaccinated: unvaccinated,
                registeredUsers: registeredUserCount, positiveUsers: positiveCount, negativeUsers: negativeCount,
                firstDosePositives: firstDosePositives, firstDoseNegatives: firstDoseNegatives,
                secondDosePositives: secondDosePositives, secondDoseNegatives: secondDoseNegatives,
                boosteredPositives: boosteredPositives, boosteredNegatives: boosteredNegatives,
                unvaccinatedPositives: unvaccinatedPositives, unvaccinatedNegatives: unvaccinatedNegatives,
                area: area, registeredUsersPerArea: registeredUsersPerArea, positiveUsersPerArea: positiveUsersPerArea,
                firstDoseUsersPerArea: firstDoseUsersPerArea, secondDoseUsersPerArea: secondDoseUsersPerArea, boosteredUsersPerArea: boosteredUsersPerArea
            })
        }
        else if(req.session.role == "System Admin"){
            res.json({
                registeredUserLabel: "", firstDoseCount: firstDoseCount,
                secondDoseCount: secondDoseCount, boosterCount: boosterCount, unvaccinated: unvaccinated,
                registeredUsers: registeredUserCount, positiveUsers: positiveCount, negativeUsers: negativeCount,
                firstDosePositives: firstDosePositives, firstDoseNegatives: firstDoseNegatives,
                secondDosePositives: secondDosePositives, secondDoseNegatives: secondDoseNegatives,
                boosteredPositives: boosteredPositives, boosteredNegatives: boosteredNegatives,
                unvaccinatedPositives: unvaccinatedPositives, unvaccinatedNegatives: unvaccinatedNegatives,
                area: area, registeredUsersPerArea: registeredUsersPerArea, positiveUsersPerArea: positiveUsersPerArea,
                firstDoseUsersPerArea: firstDoseUsersPerArea, secondDoseUsersPerArea: secondDoseUsersPerArea, boosteredUsersPerArea: boosteredUsersPerArea
            })
        }
        else {
            res.redirect("/")
        }
        
    }else{
        res.redirect("/")
    }
})

// Variables for counting
var unvaccinated = 0;
var firstDoseCount = 0;
var secondDoseCount = 0;
var boosterCount = 0;

var unvaccinatedPositives = 0;
var firstDosePositives = 0;
var secondDosePositives = 0;
var boosteredPositives = 0;

var unvaccinatedNegatives = 0;
var firstDoseNegatives = 0;
var secondDoseNegatives = 0;
var boosteredNegatives = 0;

var areaArray = [];
var regionsArray = [];
var provincesArray = [];
var citiesArray = []
var regionsRetrieved = false;

var provincesRetrieved = false;
var citiesRetrieved = false;
var vaxCountRetrieved = false;
var positiveCountRetrieved = false;
var negativeCountRetrieved = false;
var registerCountRetrieved = false;

var date_today;
var year_today;
var month_today;
var day_today;

var area
var registeredUsersPerArea
var positiveUsersPerArea
var firstDoseUsersPerArea
var secondDoseUsersPerArea
var boosteredUsersPerArea


// Retrieve all stats to display on dashboard
const getDashboardData = async function(address, role){
    console.log(address)
   

    areaArray = [];

    console.log("Date :" + year_today + "-" + month_today + "-" + day_today)
    if(role=="Health Authority (Region-Level)"){
        if(address.region_code != 13){
            await getProvinces(address.region_code).then(()=>{
                provincesRetrieved = true;
            })
            await getRegisteredUsers(address, role).then(()=>{
                registerCountRetrieved = true;
            })
        }else{
            await getNCRCities(address.region_code).then(()=>{
                citiesRetrieved = true;
            })
            await getRegisteredUsers(address, role).then(()=>{
                registerCountRetrieved = true;
            })
        }
    }else if(role== "Health Authority (Provincial-Level)" ||role == "LGU (Provincial-Level)" ){
        await getCities(address.province_code).then(()=>{
            citiesRetrieved = true;
        })    
        await getRegisteredUsers(address, role).then(()=>{
            registerCountRetrieved = true;
        })
    }else if ( role== "Health Authority (City-Level)"|| role == "LGU (City-Level)"){
        await getRegisteredUserBarangay(address, role)
    }else if(role=="System Admin"){
        await getRegions(()=>{
            regionsRetrieved = true;
        })
        await getRegisteredUsers(address, role).then(()=>{
            registerCountRetrieved = true;
        })
    }
 
    await getPositiveUsers(address, role).then(()=>{
        getPositiveDifference();
        positiveCountRetrieved = true;
    })
    await getNegativeUsers(address, role).then(()=>{
        negativeCountRetrieved = true;
    })
    await getUntestedUsers(address, role).then(()=>{
    
    })
    await getVaccinatedUsers(address, role).then(()=>{
        vaxCountRetrieved = true;
    })
    
    
}

// Get Regions for System Admin
const getRegions = async function(){
    const snapshot = await db.collection('regions').get();
    if(!snapshot.empty){
        console.log("getRegions(): Region Snapshot exists");
        snapshot.forEach((doc) => {
            areaArray.push({areaName: doc.data().name,
                areaCode: doc.data().id,
                registeredCount: 0,
                positivePastWeek: 0,
                positiveWeekBefore: 0,
                positiveDifference: 0,
                negativeCount: 0,
                untestedCount: 0,
                firstDoseCount: 0,
                secondDoseCount: 0,
                boosterCount: 0,
                unvaccinatedCount: 0
            });
            
        })
    }else{
        console.log("getRegions(): Region Snapshot does not exist");
    }
}
// Get Provinces for Health Authority
const getProvinces = async function(userRegion){
    const snapshot = await db.collection('provinces').where('region_code', '==', userRegion).get();

    if (!snapshot.empty){
        console.log("Provinces Snapshot Exists")
        snapshot.forEach((doc)=>{ 
            areaArray.push({areaName: doc.data().name,
                areaCode: doc.data().id,
                registeredCount: 0,
                positivePastWeek: 0,
                positiveWeekBefore: 0,
                positiveDifference: 0,
                negativeCount: 0,
                untestedCount: 0,
                firstDoseCount: 0,
                secondDoseCount: 0,
                boosterCount: 0,
                unvaccinatedCount: 0
            });

        })

        console.log(provincesArray);
    }
}

// Get Cities for Provincial and City Level Authorities
const getCities = async function(userProvince){
    const snapshot = await db.collection('cities').where('province_code', '==', userProvince).get();

    if (!snapshot.empty){
        console.log("Provinces Snapshot Exists")
        snapshot.forEach((doc)=>{ 
            areaArray.push({areaName: doc.data().name,
                areaCode: doc.data().id,
                registeredCount: 0,
                positivePastWeek: 0,
                positiveWeekBefore: 0,
                positiveDifference: 0,
                negativeCount: 0,
                untestedCount: 0,
                firstDoseCount: 0,
                secondDoseCount: 0,
                boosterCount: 0,
                unvaccinatedCount: 0
            });

        })

    }
}
// Get Cities for Provincial Level Authorities
const getNCRCities = async function(userProvince){
    const snapshot = await db.collection('cities').where('region_code', '==', userProvince).get();

    if (!snapshot.empty){
        console.log("Cities Snapshot Exists")
        areaArray.push({areaName: 'CITY OF MANILA',
                        areaCode: "1339",
                        registeredCount: 0,
                        positivePastWeek: 0,
                        positiveWeekBefore: 0,
                        positiveDifference: 0,
                        negativeCount: 0,
                        untestedCount: 0,
                        firstDoseCount: 0,
                        secondDoseCount: 0,
                        boosterCount: 0,
                        unvaccinatedCount: 0
         }) 
        snapshot.forEach((doc)=>{
            if(doc.data().province_code != '1339'){
                areaArray.push({areaName: doc.data().name,
                                areaCode: doc.data().id,
                                registeredCount: 0,
                                positivePastWeek: 0,
                                positiveWeekBefore: 0,
                                positiveDifference: 0,
                                negativeCount: 0,
                                untestedCount: 0,
                                firstDoseCount: 0,
                                secondDoseCount: 0,
                                boosterCount: 0,
                                unvaccinatedCount: 0
                });
            }
        })

    }
}

//Get Barangays for City Level Authorities
const getRegisteredUserBarangay = async function (userLocation, userRole){
    const snapshot = await db.collection("users").where("document_status", '==', 'published').get();

    registeredUserCount = 0;

    if(!snapshot.empty){
        snapshot.forEach((doc)=>{
           if (doc.data().document_status == "published") {
                if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                    if(doc.data().province == userLocation.province){
                        if(doc.data().city == userLocation.city){
                            registeredUserCount++;
                            if(areaArray.length <= 0){
                                areaArray.push({areaName: doc.data().barangay,
                                                registeredCount: 1,
                                                positivePastWeek: 0,
                                                positiveWeekBefore: 0,
                                                positiveDifference: 0,
                                                negativeCount: 0,
                                                untestedCount: 0,
                                                firstDoseCount: 0,
                                                secondDoseCount: 0,
                                                boosterCount: 0,
                                                unvaccinatedCount: 0
                                                })
                            }else{
                                var found = false;
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().barangay){
                                        found = true;
                                        area = "EACH BARANGAY IN " + userLocation.city
                                        areaArray[i].registeredCount++;
                                    }     
                                }
                                if(!found){
                                    areaArray.push({
                                                areaName: doc.data().barangay,
                                                registeredCount: 1,
                                                positivePastWeek: 0,
                                                positiveWeekBefore: 0,
                                                positiveDifference: 0,
                                                negativeCount: 0,
                                                untestedCount: 0,
                                                firstDoseCount: 0,
                                                secondDoseCount: 0,
                                                boosterCount: 0,
                                                unvaccinatedCount: 0
                                    })
                                }
                            }
                        }
                    }
                }
            }
        })
    }
    
}

//Retrieve number of registered users
var registeredUserCount = 0;
const getRegisteredUsers = async function(userLocation, userRole){
    const snapshot = await db.collection("users").where("document_status", "==", "published").get();
    
    registeredUserCount = 0;
    if(!snapshot.empty){
        snapshot.forEach((doc)=>{
           if (doc.data().document_status == "published") {
            if(userRole == "Health Authority (Region-Level)"){
                if(userLocation.region_code == '13'){
                     area = "EACH CITY IN NCR"
                     if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                        areaArray[0].registeredCount++;
                    }else{
                        for(var i=0; i< areaArray.length; i++){
                            if(areaArray[i].areaName == doc.data().city){
                                 areaArray[i].registeredCount++;
                            } 
                        }   
                    }    
                } else{
                    area = "EACH PROVINCE IN " + userLocation.region
                    for(var i=0; i< areaArray.length; i++){
                        if(areaArray[i].areaName == doc.data().province){
                             areaArray[i].registeredCount++;
                        } 
                    }    
                }
                if(doc.data().region == userLocation.region){
                    registeredUserCount++;
                }                
            }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                if(doc.data().province == userLocation.province){
                    area = "EACH CITY IN " + userLocation.province
                    for(var i=0; i< areaArray.length; i++){
                        if(areaArray[i].areaName == doc.data().city){
                             areaArray[i].registeredCount++;
                        }     
                     }
                    registeredUserCount++;
                }
            }else if(userRole == "System Admin"){
                area = "EACH REGION"
                for(var i=0; i< areaArray.length; i++){
                    if(areaArray[i].areaName == doc.data().region){
                         areaArray[i].registeredCount++;
                    }     
                 }
                registeredUserCount++;
            }
           }
        })
    }
    
}

var getPositiveDifference = function(){
    for(var i = 0; i < areaArray.length; i++){
       if(areaArray[i].positiveWeekBefore > 0){
            areaArray[i].positiveDifference = ((areaArray[i].positivePastWeek - areaArray[i].positiveWeekBefore)/areaArray[i].positiveWeekBefore) * 100;
        }else{
            areaArray[i].positiveDifference = (areaArray[i].positivePastWeek - areaArray[i].positiveWeekBefore) * 100
        }
    }
}
//Retrieve number of positive users
var positiveCount = 0;
const getPositiveUsers = async function(userLocation, userRole){
    const snapshot = await db.collection('users').where("covid_positive", "==", true).get();

    
    var pastWeek = [...Array(7).keys()].map(index => {
        date_today = new Date(); 
        date_today.setDate(date_today.getDate() - (index));
      
        return date_today;
      });

      var weekBefore = [...Array(7).keys()].map(index => {
        date_today = new Date(); 
        date_today.setDate(date_today.getDate() - (index + 7));
      
        return date_today;
      });
     
      
      console.log("Last 7 days: "+ pastWeek);
   
      console.log("Week Before: " + weekBefore);

    positiveCount = 0;
    if(!snapshot.empty){
        snapshot.forEach((doc) =>{
            if(doc.data().document_status == 'published'){
                var last_testdate = doc.data().last_testdate
                var date_array = last_testdate.split("-")  
                var isOneWeekBefore = false;
                var isTwoWeeksBefore = false;
                for(var j = 0; j < pastWeek.length; j++){
                    
                console.log(date_array)
                    if(date_array[0] == pastWeek[j].getFullYear() && date_array[1] == pastWeek[j].getMonth() + 1 && date_array[2] == pastWeek[j].getDate()){
                        isOneWeekBefore = true
                    }
                }
                if(!isOneWeekBefore){
                    for(var j = 0; j < weekBefore.length; j++){
                        if(date_array[0] == weekBefore[j].getFullYear() && date_array[1] == weekBefore[j].getMonth() + 1 && date_array[2] == weekBefore[j].getDate()){
                            isTwoWeeksBefore = true
                        }
                    }
                }
                        if(userRole == "Health Authority (Region-Level)"){
                            
                            if(userLocation.region_code == '13'){
                                if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                    if(isOneWeekBefore){
                                        areaArray[0].positivePastWeek++;
                                  
                                    }else if(isTwoWeeksBefore){
                                        areaArray[0].positiveWeekBefore++;
                                    }
                                }else{
                                    for(var i=0; i< areaArray.length; i++){
                                        if(areaArray[i].areaName == doc.data().city){
                                            if(isOneWeekBefore){
                                                areaArray[i].positivePastWeek++;
                                          
                                            }else if(isTwoWeeksBefore){
                                                areaArray[i].positiveWeekBefore++;
                                            }
                                        } 
                                    }   
                                }    
                            }else{  
                                for(var i=0; i< areaArray.length; i++){
                                if(areaArray[i].areaName == doc.data().province){
                                        if(isOneWeekBefore)
                                            areaArray[i].positivePastWeek++;
                                        else if(isTwoWeeksBefore)
                                            areaArray[i].positiveWeekBefore++;
                                        } 
                                }
                            }
                            if(doc.data().region == userLocation.region){
                                positiveCount++;
                            }
                        }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                            if(doc.data().province == userLocation.province){
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().city){
                                        if(areaArray[i].areaName == doc.data().city){
                                            if(isOneWeekBefore)
                                                areaArray[i].positivePastWeek++;
                                            else if(isTwoWeeksBefore)
                                                areaArray[i].positiveWeekBefore++;
                                        } 
                                    }     
                                }
                                positiveCount++;
                            }
                        }else if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                            if(doc.data().province == userLocation.province){
                                if(doc.data().city == userLocation.city){
                                    positiveCount++;
                                    for(var i=0; i< areaArray.length; i++){
                                        if(areaArray[i].areaName == doc.data().barangay){
                                                if(isOneWeekBefore)
                                                    areaArray[i].positivePastWeek++;
                                                else if(isTwoWeeksBefore)
                                                    areaArray[i].positiveWeekBefore++;
                                        }     
                                    }  
                                } 
                            }
                        }else if(userRole == "System Admin"){
                            for(var i=0; i< areaArray.length; i++){
                                if(areaArray[i].areaName == doc.data().region){
                                        if(isOneWeekBefore)
                                            areaArray[i].positivePastWeek++;
                                        else if(isTwoWeeksBefore)
                                            areaArray[i].positiveWeekBefore++;
                                }     
                            }
                            positiveCount++;
                        }
                    }
        })
    }
    
}

//Retrieve number of negative users
var negativeCount = 0;
const getNegativeUsers = async function(userLocation, userRole){
    const snapshot = await db.collection('users').where("covid_positive", "==", false).get();

    negativeCount  = 0;
    if(!snapshot.empty){
        console.log("Positive users snapshot exists")
        snapshot.forEach((doc) =>{
            if(doc.data().document_status == 'published'){
                if(userRole == "Health Authority (Region-Level)"){
                    if(doc.data().region == userLocation.region){
                        if(userLocation.region_code == '13'){
                            if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                areaArray[0].negativeCount++;
                            }else{
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().city){
                                         areaArray[i].negativeCount++;
                                    } 
                                }   
                            }    
                        }else{
                            for(var i=0; i< areaArray.length; i++){
                                if(areaArray[i].areaName == doc.data().province){
                                    areaArray[i].negativeCount++;
                                }     
                            }
                        }
                        negativeCount++;
                    }
                }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                    if(doc.data().province == userLocation.province){
                        for(var i=0; i< areaArray.length; i++){
                            if(areaArray[i].areaName == doc.data().barangay){
                                areaArray[i].negativeCount++;
                            }     
                        }

                        negativeCount++;
                    }
                }else if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                    if(doc.data().province == userLocation.province){
                        if(doc.data().city == userLocation.city){
                            for(var i=0; i< areaArray.length; i++){
                                if(areaArray[i].areaName == doc.data().barangay){
                                    areaArray[i].negativeCount++;
                                }     
                            }
                            negativeCount++;
                        }
                    }
                }else if(userRole == "System Admin"){
                    for(var i=0; i< areaArray.length; i++){
                        if(areaArray[i].areaName == doc.data().region){
                            areaArray[i].negativeCount++;
                        }     
                    }
                    negativeCount++;
                }
            }
        })
    }
}


//Retrieve number of Untested users
var untestedCount = 0;
const getUntestedUsers = async function(userLocation, userRole){
    const snapshot = await db.collection('users').where("covid_positive", "==", 'Untested').get();

    untestedCount = 0;
    if(!snapshot.empty){
        console.log("Positive users snapshot exists")
        snapshot.forEach((doc) =>{
            if(doc.data().document_status == 'published'){
                if(userRole == "Health Authority (Region-Level)"){
                    if(doc.data().region == userLocation.region){
                        if(userLocation.region_code == '13'){
                            if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                areaArray[0].untestedCount++;
                            }else{
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().city){
                                         areaArray[i].untestedCount++;
                                    } 
                                }   
                            }    
                        }else{
                            for(var i=0; i< areaArray.length; i++){
                                if(areaArray[i].areaName == doc.data().province){
                                    areaArray[i].untestedCount++;
                                }     
                            }
                        }
                        untestedCount++;
                    }
                }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                    if(doc.data().province == userLocation.province){
                        for(var i=0; i< areaArray.length; i++){
                            if(areaArray[i].areaName == doc.data().city){
                                areaArray[i].untestedCount++;
                            }     
                        }
                        untestedCount++;
                    }
                }else if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                    if(doc.data().province == userLocation.province){
                        if(doc.data().city == userLocation.city){
                            for(var i=0; i< areaArray.length; i++){
                                if(areaArray[i].areaName == doc.data().barangay){
                                    areaArray[i].untestedCount++;
                                }     
                            }
                            untestedCount++;
                        }
                    }
                }else if(userRole == "System Admin"){
                    for(var i=0; i< areaArray.length; i++){
                        if(areaArray[i].areaName == doc.data().region){
                            areaArray[i].untestedCount++;
                        }     
                    }
                    untestedCount++;
                }
            }
        })
    }
    console.log("Untested Users:" + untestedCount)
}
    


// get Vaccinated users
const getVaccinatedUsers = async function(userLocation, userRole){
    const snapshot = await db.collection("users").where("document_status", "==", "published").get();
    secondDoseCount = 0;
    firstDoseCount = 0;
    boosterCount = 0;
    unvaccinated = 0;

    unvaccinatedPositives = 0;
    firstDosePositives = 0;
    secondDosePositives = 0;
    boosteredPositives = 0;

    unvaccinatedNegatives = 0;
    firstDoseNegatives = 0;
    secondDoseNegatives = 0;
    boosteredNegatives = 0;

        if(!snapshot.empty){
        console.log("Vaccinated users snapshot exists")
        snapshot.forEach((doc) =>{
            if(doc.data().document_status == "published"){
                if(doc.data().vax_manufacturer == "J&J"){
                     // check if 2nd dose is administered
                     if(doc.data().vax_2nddose.date != null && doc.data().vax_2nddose.date != ""){
                        // check if booster shot is administered
                        if(doc.data().vax_booster != null && doc.data().vax_booster != [] && doc.data().vax_booster.length > 0){
                            if(userRole == "Health Authority (Region-Level)"){
                                if(doc.data().region == userLocation.region){
                                    if(userLocation.region_code == '13'){
                                        if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                            areaArray[0].boosterCount++;
                                        }else{
                                            for(var i=0; i< areaArray.length; i++){
                                                if(areaArray[i].areaName == doc.data().city){
                                                     areaArray[i].boosterCount++;
                                                } 
                                            }   
                                        }    
                                    }else{
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().province){
                                                areaArray[i].boosterCount++;
                                            
                                                // if (doc.data().covid_positive == true){
                                                //     areaArray[i].boosterPositive++;
                                                // } else if(doc.data().covid_positive == false){
                                                //     areaArray[i].boosterNegative++;
                                                // }
                                            }     
                                        }
                                    }
                                        boosterCount++;
                                        if (doc.data().covid_positive == true){
                                            boosteredPositives++;
                                        } else if(doc.data().covid_positive == false){
                                            boosteredNegatives++;
                                        }
                                    
                                }
                            }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                                if(doc.data().province == userLocation.province){
                                    for(var i=0; i< areaArray.length; i++){
                                        if(areaArray[i].areaName == doc.data().city){
                                             areaArray[i].boosterCount++;
                                            
                                            // if (doc.data().covid_positive == true){
                                            //     areaArray[i].boosterPositive++;
                                            // } else if(doc.data().covid_positive == false){
                                            //     areaArray[i].boosterNegative++;
                                            // }
                                        }     
                                     }
                                    boosterCount++;
                                    if (doc.data().covid_positive == true){
                                        boosteredPositives++;
                                    } else if(doc.data().covid_positive == false){  
                                        boosteredNegatives++;
                                    }
                                }
                            }else if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                                if(doc.data().province == userLocation.province){
                                    if(doc.data().city == userLocation.city){
                                    
                                        boosterCount++;
                                        if (doc.data().covid_positive == true){
                                            boosteredPositives++;
                                        }else if (doc.data().covid_positive == false){  
                                            boosteredNegatives++;
                                        }
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().barangay){
                                                areaArray[i].boosterCount++;
                                            
                                    
                                            }     
                                        }
                                    }
                                }
                              
                            }else if(userRole == "System Admin"){
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().region){
                                        areaArray[i].boosterCount++;
    
                                        //  if (doc.data().covid_positive == true){
                                        //     areaArray[i].boosterPositive++;
                                        // } else if (doc.data().covid_positive == false){
                                        //     areaArray[i].boosterNegative++;
                                        // }
                                    }     
                                }
                                boosterCount++;
                                if (doc.data().covid_positive == true){
                                    boosteredPositives++;
                                } else if (doc.data().covid_positive == false){  
                                    boosteredNegatives++;
                                }
                            }
                        // fully vaccinated, no booster shot
                        }else{
                            if(userRole == "Health Authority (Region-Level)"){
                                if(doc.data().region == userLocation.region){
                                    if(userLocation.region_code == '13'){
                                        if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                            areaArray[0].secondDoseCount++;
                                        }else{
                                            for(var i=0; i< areaArray.length; i++){
                                                if(areaArray[i].areaName == doc.data().city){
                                                     areaArray[i].secondDoseCount++;
                                                } 
                                            }   
                                        }    
                                    }else{
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().province){
                                                areaArray[i].secondDoseCount++;
        
                                                // if (doc.data().covid_positive == true){
                                                //     areaArray[i].secondDosePositive++;
                                                // }else if (doc.data().covid_positive == false){
                                                //     areaArray[i].secondDoseNegative++;
                                                // }
                                            }     
                                        }
                                    }
                                    secondDoseCount++;
                                    if (doc.data().covid_positive == true){
                                        secondDosePositives++;
                                        } else if (doc.data().covid_positive == false){
                                        secondDoseNegatives++;
                                        }
                                    
                                }
                            }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                                if(doc.data().province == userLocation.province){
                                    for(var i=0; i< areaArray.length; i++){
                                        if(areaArray[i].areaName == doc.data().city){
                                            areaArray[i].secondDoseCount++;
        

                                        }     
                                    }
                                    secondDoseCount++;
                                    if (doc.data().covid_positive == true){
                                        secondDosePositives++;
                                        } else if (doc.data().covid_positive == false){
                                        secondDoseNegatives++;
                                        }
                                }
                            }else if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                                if(doc.data().province == userLocation.province){
                                    if(doc.data().city == userLocation.city){
                                    
                                        secondDoseCount++;
                                        if (doc.data().covid_positive == true){
                                            secondDosePositives++;
                                        }else if (doc.data().covid_positive == false){  
                                            secondDoseNegatives++;
                                        }
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().barangay){
                                                areaArray[i].secondDoseCount++;
                                            }     
                                        }
                                    }
                                }
                            }else if(userRole == "System Admin"){
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().region){
                                        areaArray[i].secondDoseCount++;

                                    }     
                                }
                                secondDoseCount++;
                                if (doc.data().covid_positive == true){
                                    secondDosePositives++;
                                    } else if (doc.data().covid_positive == false){
                                    secondDoseNegatives++;
                                }
                            }
                        }
                    }else{
                        if(userRole == "Health Authority (Region-Level)"){
                            if(doc.data().region == userLocation.region){
                                if(userLocation.region_code == '13'){
                                    if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                        areaArray[0].unvaccinatedCount++;
                                    }else{
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().city){
                                                 areaArray[i].unvaccinatedCount++;
                                            } 
                                        }   
                                    }    
                                }else{
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().province){
                                        areaArray[i].unvaccinatedCount++;
    
                                        //  if (doc.data().covid_positive == true){
                                        //     areaArray[i].unvaccinatedPositive++;
                                        // } else if (doc.data().covid_positive == false){
                                        //     areaArray[i].unvaccinatedNegative++;
                                        // }
                                     }     
                                    }
                                }
                                unvaccinated++;
                                if (doc.data().covid_positive == true)
                                unvaccinatedPositives++;
                                else if (doc.data().covid_positive == false)
                                unvaccinatedNegatives++;
                            }
                        }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                            if(doc.data().province == userLocation.province){
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().city){
                                        areaArray[i].unvaccinatedCount++;
    
                                        //  if (doc.data().covid_positive == true){
                                        //     areaArray[i].unvaccinatedPositive++;
                                        // } else if (doc.data().covid_positive == false){
                                        //     areaArray[i].unvaccinatedNegative++;
                                        // }
                                    }     
                                }
                                unvaccinated++;
                                if (doc.data().covid_positive == true)
                                unvaccinatedPositives++;
                                else if (doc.data().covid_positive == false)
                                unvaccinatedNegatives++;
                            }
                        }else if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                            if(doc.data().province == userLocation.province){
                                if(doc.data().city == userLocation.city){
                                
                                    unvaccinated++;
                                    if (doc.data().covid_positive == true){
                                        unvaccinatedPositives++;
                                    }else if (doc.data().covid_positive == false){  
                                        unvaccinatedNegatives++;
                                    }
                                    for(var i=0; i< areaArray.length; i++){
                                        if(areaArray[i].areaName == doc.data().barangay){
                                            areaArray[i].unvaccinatedCount++;
                                        }     
                                    }
                                }
                            }
                        }else if(userRole == "System Admin"){
                            for(var i=0; i< areaArray.length; i++){
                                if(areaArray[i].areaName == doc.data().region){
                                    areaArray[i].unvaccinatedCount++;

                                    //  if (doc.data().covid_positive == true){
                                    //         areaArray[i].unvaccinatedPositive++;
                                    // } else if (doc.data().covid_positive == false){
                                    //         areaArray[i].unvaccinatedNegative++;
                                    //     }
                                    }     
                                }
                            unvaccinated++;
                            if (doc.data().covid_positive == true)
                            unvaccinatedPositives++;
                            else if (doc.data().covid_positive == false)
                            unvaccinatedNegatives++;
                        }
                    }
                }else{
                    // check if 1st dose is administered
                    if(doc.data().vax_1stdose.date != null && doc.data().vax_1stdose.date != ""){
                        // check if 2nd dose is administered
                        if(doc.data().vax_2nddose.date != null && doc.data().vax_2nddose.date != ""){
                            // check if booster shot is administered
                            if(doc.data().vax_booster != null && doc.data().vax_booster != [] && doc.data().vax_booster.length > 0){
                                if(userRole == "Health Authority (Region-Level)"){
                                    //Separate Counting for provinces
                                
                                    if(doc.data().region == userLocation.region){
                                        if(userLocation.region_code == '13'){
                                            if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                                areaArray[0].boosterCount++;
                                            }else{
                                                for(var i=0; i< areaArray.length; i++){
                                                    if(areaArray[i].areaName == doc.data().city){
                                                         areaArray[i].boosterCount++;
                                                    } 
                                                }   
                                            }    
                                        }else{
                                            for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().province){
                                                 areaArray[i].boosterCount++;
                                                
                                                // if (doc.data().covid_positive == true){
                                                //     areaArray[i].boosterPositive++;
                                                // } else if (doc.data().covid_positive == false){
                                                //     areaArray[i].boosterNegative++;
                                                // }
                                            }     
                                         }
                                        }
                                        boosterCount++;
                                        if (doc.data().covid_positive == true){
                                            boosteredPositives++;
                                        } else if (doc.data().covid_positive == false){  
                                            boosteredNegatives++;
                                        }
                                    }
                                }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                                    if(doc.data().province == userLocation.province){
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().city){
                                                 areaArray[i].boosterCount++;
                                                
                                                // if (doc.data().covid_positive == true){
                                                //     areaArray[i].boosterPositive++;
                                                // } else{
                                                //     areaArray[i].boosterNegative++;
                                                // }
                                            }     
                                         }
                                        boosterCount++;
                                        if (doc.data().covid_positive == true){
                                            boosteredPositives++;
                                        } else if (doc.data().covid_positive == false){  
                                            boosteredNegatives++;
                                        }
                                    }
                                }else if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                                    if(doc.data().province == userLocation.province){
                                        if(doc.data().city == userLocation.city){
                                        
                                            boosterCount++;
                                            if (doc.data().covid_positive == true){
                                                boosteredPositives++;
                                            }else if (doc.data().covid_positive == false){  
                                                boosteredNegatives++;
                                            }
                                            for(var i=0; i< areaArray.length; i++){
                                                if(areaArray[i].areaName == doc.data().barangay){
                                                    areaArray[i].boosterCount++;
                                                }     
                                            }
                                        }
                                    }
                                }else if(userRole == "System Admin"){
                                    for(var i=0; i< areaArray.length; i++){
                                        if(areaArray[i].areaName == doc.data().region){
                                            areaArray[i].boosterCount++;
        
                                            //  if (doc.data().covid_positive == true){
                                            //     areaArray[i].boosterPositive++;
                                            // } else if (doc.data().covid_positive == false){
                                            //     areaArray[i].boosterNegative++;
                                            // }
                                        }     
                                    }
                                    boosterCount++;
                                    if (doc.data().covid_positive == true){
                                        boosteredPositives++;
                                    } else if (doc.data().covid_positive == false){  
                                        boosteredNegatives++;
                                    }
                                }
                            // fully vaccinated, no booster shot
                            }else{
                                if(userRole == "Health Authority (Region-Level)"){
                                    if(doc.data().region == userLocation.region){
                                        if(userLocation.region_code == '13'){
                                            if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                                areaArray[0].secondDoseCount++;
                                            }else{
                                                for(var i=0; i< areaArray.length; i++){
                                                    if(areaArray[i].areaName == doc.data().city){
                                                         areaArray[i].secondDoseCount++;
                                                    } 
                                                }   
                                            }    
                                        }else{
                                            for(var i=0; i< areaArray.length; i++){
                                                if(areaArray[i].areaName == doc.data().province){
                                                    areaArray[i].secondDoseCount++;
                                                }     
                                            }
                                        }
                                        secondDoseCount++;
                                        if (doc.data().covid_positive == true){
                                        secondDosePositives++;
                                        } else if (doc.data().covid_positive == false){
                                        secondDoseNegatives++;
                                        }
                                    }
                                }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                                    if(doc.data().province == userLocation.province){
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().city){
                                                areaArray[i].secondDoseCount++;
            
                                                //  if (doc.data().covid_positive == true){
                                                //     areaArray[i].secondDosePositive++;
                                                // } else if (doc.data().covid_positive == false){
                                                //     areaArray[i].secondDoseNegative++;
                                                // }
                                            }     
                                        }
                                        secondDoseCount++;
                                        if (doc.data().covid_positive == true){
                                            secondDosePositives++;
                                            } else if (doc.data().covid_positive == false){
                                            secondDoseNegatives++;
                                            }
                                    }
                                }else if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                                    if(doc.data().province == userLocation.province){
                                        if(doc.data().city == userLocation.city){
                                        
                                            secondDoseCount++;
                                            if (doc.data().covid_positive == true){
                                                secondDosePositives++;
                                            }else if (doc.data().covid_positive == false){  
                                                secondDoseNegatives++;
                                            }
                                            for(var i=0; i< areaArray.length; i++){
                                                if(areaArray[i].areaName == doc.data().barangay){
                                                    areaArray[i].secondDoseCount++;
                                                }     
                                            }
                                        }
                                    }
                                }else if(userRole == "System Admin"){
                                    for(var i=0; i< areaArray.length; i++){
                                        if(areaArray[i].areaName == doc.data().region){
                                            areaArray[i].secondDoseCount++;
    
                                            // if(doc.data().covid_positive == true){
                                            //     areaArray[i].secondDosePositive++;
                                            // }else if (doc.data().covid_positive == false){
                                            //     areaArray[i].secondDoseNegative++;
                                            // }
                                      }     
                                    }
                                    secondDoseCount++;
                                    if (doc.data().covid_positive == true){
                                        secondDosePositives++;
                                        } else if (doc.data().covid_positive == false){
                                        secondDoseNegatives++;
                                        }
                                }
                            }
                        // partially vaccinated, no second dose 
                        }else{
                            if(userRole == "Health Authority (Region-Level)"){
                                if(doc.data().region == userLocation.region){
                                    if(userLocation.region_code == '13'){
                                        if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                            areaArray[0].firstDoseCount++;
                                        }else{
                                            for(var i=0; i< areaArray.length; i++){
                                                if(areaArray[i].areaName == doc.data().city){
                                                     areaArray[i].firstDoseCount++;
                                                } 
                                            }   
                                        }    
                                    }else{
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().province){
                                                areaArray[i].firstDoseCount++;
    
                                                // if(doc.data().covid_positive == true){
                                                //     areaArray[i].firstDosePositive++;
                                                // }else if (doc.data().covid_positive == false){
                                                //     areaArray[i].firstDoseNegative++;
                                                // }
                                            }     
                                        }
                                    }
                                    firstDoseCount++;
                                    if (doc.data().covid_positive == true){
                                        firstDosePositives++;
                                    }else if (doc.data().covid_positive == false){
                                        firstDoseNegatives++;
                                    }
                                }
                            }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                                if(doc.data().province == userLocation.province){
                                    for(var i=0; i< areaArray.length; i++){
                                        if(areaArray[i].areaName == doc.data().city){
                                            areaArray[i].firstDoseCount++;
    
                                            // if(doc.data().covid_positive == true){
                                            //     areaArray[i].firstDosePositive++;
                                            // }else if (doc.data().covid_positive == false){
                                            //     areaArray[i].firstDoseNegative++;
                                            // }
                                      }     
                                    }
                                    firstDoseCount++;
                                    if (doc.data().covid_positive == true){
                                        firstDosePositives++;
                                    }else if (doc.data().covid_positive == false){
                                        firstDoseNegatives++;
                                    }
                                }
                            } if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                                if(doc.data().province == userLocation.province){
                                    if(doc.data().city == userLocation.city){
                                    
                                        firstDoseCount++;
                                        if (doc.data().covid_positive == true){
                                            firstDosePositives++;
                                        }else if (doc.data().covid_positive == false){  
                                            firstDoseNegatives++;
                                        }
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().barangay){
                                                areaArray[i].firstDoseCount++;
                                            }     
                                        }
                                    }
                                }
                            }else if(userRole == "System Admin"){ 
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().region){
                                        areaArray[i].firstDoseCount++;
                                    }         
                                }
                                firstDoseCount++;
                                if(doc.data().covid_positive == true){
                                    firstDosePositives++;
                                }else if (doc.data().covid_positive == false){
                                    firstDoseNegatives++;
                                }
                            }
                        }
                    } else{
                        if(userRole == "Health Authority (Region-Level)"){
                            if(doc.data().region == userLocation.region){
                                if(userLocation.region_code == '13'){
                                    if(doc.data().province == 'CITY OF MANILA' || doc.data().province == "NCR, CITY OF MANILA, FIRST DISTRICT"){
                                        areaArray[0].unvaccinatedCount++;
                                    }else{
                                        for(var i=0; i< areaArray.length; i++){
                                            if(areaArray[i].areaName == doc.data().city){
                                                areaArray[i].unvaccinatedCount++;
    
                                            }         
                                        }
                                    }
                                }
                                unvaccinated++;
                                if (doc.data().covid_positive == true){
                                    unvaccinatedPositives++;
                                }else if (doc.data().covid_positive == false) {                                
                                    unvaccinatedNegatives++;
                                }
                            }
                        }else if(userRole == "Health Authority (Provincial-Level)" || userRole == "LGU (Provincial-Level)"){
                            if(doc.data().province == userLocation.province){
                                for(var i=0; i< areaArray.length; i++){
                                    if(areaArray[i].areaName == doc.data().city){
                                        areaArray[i].unvaccinatedCount++;

                                        // if(doc.data().covid_positive == true){
                                        //     areaArray[i].unvaccinatedPositive++;
                                        // }else if (doc.data().covid_positive == false){
                                        //     areaArray[i].unvaccinatedNegative++;
                                        // }
                                    }         
                                }
                                unvaccinated++;
                                if (doc.data().covid_positive == true){
                                    unvaccinatedPositives++;
                                }else if (doc.data().covid_positive == false){                                
                                    unvaccinatedNegatives++;
                                }
                            }
                        }else if(userRole == "Health Authority (City-Level)" || userRole == "LGU (City-Level)"){
                            if(doc.data().province == userLocation.province){
                                if(doc.data().city == userLocation.city){
                                
                                    unvaccinated++;
                                    if (doc.data().covid_positive == true){
                                        unvaccinatedPositives++;
                                    }else if (doc.data().covid_positive == false){  
                                        unvaccinatedNegatives++;
                                    }
                                    for(var i=0; i< areaArray.length; i++){
                                        if(areaArray[i].areaName == doc.data().barangay){
                                            areaArray[i].unvaccinatedCount++;
                                        }     
                                    }
                                }
                            }
                        }else if(userRole == "System Admin"){  
                            for(var i=0; i< areaArray.length; i++){
                                if(areaArray[i].areaName == doc.data().region){
                                    areaArray[i].unvaccinatedCount++;

                                    // if(doc.data().covid_positive == true){
                                    //     areaArray[i].unvaccinatedPositive++;
                                    //  }else if (doc.data().covid_positive == false){
                                    //     areaArray[i].unvaccinatedNegative++;
                                    // }
                                }         
                            }
                            unvaccinated++;
                            if (doc.data().covid_positive == true){
                                unvaccinatedPositives++;
                            }else if (doc.data().covid_positive == false){                                
                                unvaccinatedNegatives++;
                            }
                        }
                    }
                }  
            }
        })
    }
}

const formatRegisteredUsers = function(){

    for (var i = 0; i < areaArray.length ; i++) {
        
        registeredUsersPerArea.push({
            areaName: areaArray[i].areaName,
            registeredCount: areaArray[i].registeredCount
        })
    }

    registeredUsersPerArea.sort((a, b) => {
        return b.registeredCount - a.registeredCount;
    })
}

const formatPositiveUsers = function(){

    for (var i = 0; i < areaArray.length ; i++) {
        
        positiveUsersPerArea.push({
            areaName: areaArray[i].areaName,
            positivePastWeek: areaArray[i].positivePastWeek,
            positiveDifference: areaArray[i].positiveDifference
        })
    }

    positiveUsersPerArea.sort((a, b) => {
        return b.positivePastWeek - a.positivePastWeek;
    })
}

const formatFirstDoseUsers = function(){

    for (var i = 0; i < areaArray.length ; i++) {
        
        firstDoseUsersPerArea.push({
            areaName: areaArray[i].areaName,
            firstDoseCount: areaArray[i].firstDoseCount
        })
    }

    firstDoseUsersPerArea.sort((a, b) => {
        return b.firstDoseCount - a.firstDoseCount;
    })
}

const formatSecondDoseUsers = function(){

    for (var i = 0; i < areaArray.length ; i++) {
        
        secondDoseUsersPerArea.push({
            areaName: areaArray[i].areaName,
            secondDoseCount: areaArray[i].secondDoseCount
        })
    }

    secondDoseUsersPerArea.sort((a, b) => {
        return b.secondDoseCount - a.secondDoseCount;
    })
}

const formatBoosteredUsers = function(){

    for (var i = 0; i < areaArray.length ; i++) {
        
        boosteredUsersPerArea.push({
            areaName: areaArray[i].areaName,
            boosterCount: areaArray[i].boosterCount
        })
    }

    boosteredUsersPerArea.sort((a, b) => {
        return b.boosterCount - a.boosterCount;
    })
}

module.exports = router;