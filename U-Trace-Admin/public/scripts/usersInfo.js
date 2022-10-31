// load navbar
document.addEventListener("DOMContentLoaded", function(event) {

    const showNavbar = (toggleId, navId, bodyId, headerId) =>{
        const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId),
        bodypd = document.getElementById(bodyId),
        headerpd = document.getElementById(headerId)
        
        // Validate that all variables exist
        if(toggle && nav && bodypd && headerpd){
            toggle.addEventListener('click', ()=>{
                // show navbar
                nav.classList.toggle('show')
                // change icon
                toggle.classList.toggle('bx-x')
                // add padding to body
                bodypd.classList.toggle('body-pd')
                // add padding to header
                headerpd.classList.toggle('body-pd')
            })
        }
    }
    showNavbar('header-toggle','nav-bar','body-pd','header')
    
    // link active
    const linkColor = document.querySelectorAll('.nav_link')
    function colorLink(){
        if(linkColor){
            linkColor.forEach(l=> l.classList.remove('active'))
            this.classList.add('active')
        }
    }
    linkColor.forEach(l=> l.addEventListener('click', colorLink))
    
    // DOM LOADED & READY //
    $(document).ready(function(){

        // load tom-select search
        userlist = $("#userlist")
        new TomSelect("#userlist",{
            create: false,
            sortField: {
                field: "text",
                direction: "asc"
            }
        })

        // connect: elements for interaction
        userDetailsDiv = $('#userDetailsDiv')
        verifybtn = $('.verify-btn')
        prevBtn = $('#prevBtn')
        nextBtn = $('#nextBtn')
        notifyDiv = $('#notifyDiv')
        notifyBtn = $('#notifyBtn')
        usersTable = $('#usersTable')
       
        // table bodies
        Vax = $('#Vax')
        noVax = $('#noVax')
        Booster = $('#Booster')
        noBooster = $('#noBooster')
        Test = $('#Test')
        noTest = $('#noTest')

        // connect: elements for display
        userUID = $('#userUID')
        userName = $('#userName')
        userVerifiedStatus = $('#userVerifiedStatus')
        userLastTestDate = $('#userLastTestDate')
        userStatus = $('#userStatus')

        userRegion = $('#userRegion')
        userProvince = $('#userProvince')
        userCity = $('#userCity')
        userBarangay = $('#userBarangay')
        userStreet = $('#userStreet')

        userVaxID = $('#userVaxID')
        userVaxFacility = $('#userVaxFacility')
        userVaxCategory = $('#userVaxCategory')
        userVaxBrand = $('#userVaxBrand')

        dose1date = $('#dose1date')
        dose1batchNo = $('#dose1batchNo')
        dose1lotNo = $('#dose1lotNo')
        dose1vaccinator = $('#dose1vaccinator')

        dose2date = $('#dose2date')
        dose2batchNo = $('#dose2batchNo')
        dose2lotNo = $('#dose2lotNo')
        dose2vaccinator = $('#dose2vaccinator')

        // var
        var previousObj = 1
        var currPage = 1
        var totalPages


        // initially hide right side of page
        notifyDiv.hide()
        userDetailsDiv.hide()

        // initialize pagination
        getTotalPages()

        // [ACTION] admin clicks a user
        $(".userinfo").click(function(){getProfileInfo($(this))}).css("cursor", "pointer")

        // User data pull logic
        function getProfileInfo(obj) {

            // adds green higlight to clicked user row
            setFocusCSS(obj)

            // get clicked user's phone #
            let mPhoneNo = obj.find('td.mPhoneNo').text()

            // pull data
            pullUserData(mPhoneNo)

        }

        function pullUserData(mPhoneNo) {

            $.ajax({
                type: 'GET',
                data: {mPhoneNo: mPhoneNo},
                url: '/usersInfo/pullUserData',
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success:
                function(received){

                    // display received data
                    userUID.html(received.userData.uid)
                    userName.html(received.userData.name)
                    userVerifiedStatus.html(received.userData.verified)
                    userLastTestDate.html(received.userData.last_testdate)
                    userStatus.html(received.userData.status)

                    userRegion.html(received.userData.region)
                    userProvince.html(received.userData.province)
                    userCity.html(received.userData.city)
                    userBarangay.html(received.userData.barangay)
                    userStreet.html(received.userData.street)

                    if (received.userData.vaxID != "N/A") {

                        userVaxID.html(received.userData.vaxID)
                        userVaxFacility.html(received.userData.vaxFacility)
                        userVaxCategory.html(received.userData.vaxCategory)
                        userVaxBrand.html(received.userData.vaxManufacturer)
    
                        dose1date.html(received.userData.dose1date)
                        dose1batchNo.html(received.userData.dose1batchNo)
                        dose1lotNo.html(received.userData.dose1lotNo)
                        dose1vaccinator.html(received.userData.dose1vaccinator)
    
                        dose2date.html(received.userData.dose2date)
                        dose2batchNo.html(received.userData.dose2batchNo)
                        dose2lotNo.html(received.userData.dose2lotNo)
                        dose2vaccinator.html(received.userData.dose2vaccinator)

                        Vax.show()
                        noVax.hide()
                        
                    } else {
                        Vax.hide()
                        noVax.show()
                    }

                    Booster.empty()
                    if (received.userData.boosters != "N/A") {

                        console.log("User has boosters!")

                        var trHeader = $("<tr>")
                        var dateHeader = $("<td>")
                        var vaccinatorHeader = $("<td>")
                        var facilityHeader = $("<td>")
                        var batchHeader = $("<td>")
                        var lotHeader = $("<td>")
                        var brandHeader = $("<td>")

                        dateHeader.addClass("b")
                        vaccinatorHeader.addClass("b")
                        facilityHeader.addClass("b")
                        batchHeader.addClass("b")
                        lotHeader.addClass("b")
                        brandHeader.addClass("b")

                        dateHeader.html("Date")
                        vaccinatorHeader.html("Vaccinator")
                        facilityHeader.html("Facility")
                        batchHeader.html("Batch #")
                        lotHeader.html("Lot #")
                        brandHeader.html("Manufacturer")

                        trHeader.append(dateHeader)
                        trHeader.append(vaccinatorHeader)
                        trHeader.append(facilityHeader)
                        trHeader.append(batchHeader)
                        trHeader.append(lotHeader)
                        trHeader.append(brandHeader)
                        Booster.append(trHeader)

                        for (var i = 0; i < received.userData.boosters.length; i++) {

                            var trBooster = $("<tr>")
                            var tdBoosterDate = $("<td>")
                            var tdBoosterVaccinator = $("<td>")
                            var tdBoosterFacility = $("<td>")
                            var tdBoosterBatch = $("<td>")
                            var tdBoosterLot = $("<td>")
                            var tdBoosterBrand = $("<td>")

                            if (received.userData.boosters[i].date != null || received.userData.boosters[i].date != "") {
                                tdBoosterDate.html(received.userData.boosters[i].date)
                            } else {
                                tdBoosterDate.html("N/A")
                            }
                            
                            if (received.userData.boosters[i].vaccinator != null || received.userData.boosters[i].vaccinator != "") {
                                tdBoosterVaccinator.html(received.userData.boosters[i].vaccinator)
                            } else {
                                tdBoosterVaccinator.html("N/A")
                            }

                            if (received.userData.boosters[i].facility != null || received.userData.boosters[i].facility != "") {
                                tdBoosterFacility.html(received.userData.boosters[i].facility)
                            } else {
                                tdBoosterFacility.html("N/A")
                            }

                            if (received.userData.boosters[i].batch_no != null || received.userData.boosters[i].batch_no != "") {
                                tdBoosterBatch.html(received.userData.boosters[i].batch_no)
                            } else {
                                tdBoosterBatch.html("N/A")
                            }

                            if (received.userData.boosters[i].lot_no != null || received.userData.boosters[i].lot_no != "") {
                                tdBoosterLot.html(received.userData.boosters[i].lot_no)
                            } else {
                                tdBoosterLot.html("N/A")
                            }

                            if (received.userData.boosters[i].vax_manufacturer != null || received.userData.boosters[i].vax_manufacturer != "") {
                                tdBoosterBrand.html(received.userData.boosters[i].vax_manufacturer)
                            } else {
                                tdBoosterBrand.html("N/A")
                            }

                            trBooster.append(tdBoosterDate)
                            trBooster.append(tdBoosterVaccinator)
                            trBooster.append(tdBoosterFacility)
                            trBooster.append(tdBoosterBatch)
                            trBooster.append(tdBoosterLot)
                            trBooster.append(tdBoosterBrand)
                            Booster.append(trBooster)

                            Booster.show()
                            noBooster.hide()

                        }
                    } else {
                        Booster.hide()
                        noBooster.show()
                    }

                    Test.empty()
                    if (received.userData.tests != "N/A") {

                        console.log("User has tests!")

                        var trHeader = $("<tr>")
                        var dateHeader = $("<td>")
                        var resultHeader = $("<td>")

                        dateHeader.addClass("b")
                        resultHeader.addClass("b")

                        dateHeader.html("Date")
                        resultHeader.html("Result")

                        trHeader.append(dateHeader)
                        trHeader.append(resultHeader)
                        Test.append(trHeader)

                        for (var i = 0; i < received.userData.tests.length; i++) {

                            var trTest = $("<tr>")
                            var tdTestDate = $("<td>")
                            var tdTestResult = $("<td>")

                            if (received.userData.tests[i].date != null || received.userData.tests[i].date != "") {
                                tdTestDate.html(received.userData.tests[i].date)
                            } else {
                                tdTestDate.html("N/A")
                            }
                            
                            if (received.userData.tests[i].result != null || received.userData.tests[i].result != "") {
                                tdTestResult.html(received.userData.tests[i].result)
                            } else {
                                tdTestResult.html("N/A")
                            }

                            trTest.append(tdTestDate)
                            trTest.append(tdTestResult)
                            Test.append(trTest)

                            Test.show()
                            noTest.hide()

                        }
                    } else {
                        Test.hide()
                        noTest.show()
                    }

                    // if user's verification status : false, enable notify button; else, disable
                    if (received.userData.verified == "No") {
                        notifyBtn.removeClass("actn-btn-disabled")
                        notifyBtn.addClass("actn-btn")
                    } else {
                        notifyBtn.removeClass("actn-btn")
                        notifyBtn.addClass("actn-btn-disabled")
                    }

                    // show user details div
                    notifyDiv.fadeIn()
                    userDetailsDiv.fadeIn()
                    userDetailsDiv.scrollTop(0)
                }      
            })   
        }
        
        // ////////////////////////////////// PAGINATION & SEARCH FUNCTIONS/LOGIC ////////////////////////////////// //

        // [ACTION] Page Navigation Logic
        $(".page-item").click(function() {

            // Identify context
            let page = $(this).find('a.page-link').text().trim()

            if (isNaN(parseInt(page))) {

                // If previous page
                if (page == "‹") {

                    // If page isn't [1], then user can go to the prev page
                    if (currPage != 1)  { jumpToPage(parseInt(currPage)-1) }

                }

                // If next page
                else if (page == "›") {

                    // If page isn't [last page], then user can go to the next page
                    if (currPage != totalPages)  { jumpToPage(parseInt(currPage)+1) }
                }
            }
            else {
                // User selected a specific page # (do nothing if user selected current page)
                if (page != currPage) {
                    jumpToPage(page)
                }
            }
        })

        // [ACTION] admin searched for a user
        userlist.change(function(){

            console.log(userlist.val())
            
            if (userlist.val() != null && userlist.val() != "") {

                $.ajax({
                    type: 'GET',
                    data: {uid: userlist.val()},
                    url: '/usersInfo/searchUserInPages',
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                    success:
                    function(data){
                        
                        console.log("Back to AJAX:")
                        console.log(data)

                        // update page
                        updatePage(data.currPage, data.users)

                        // set highlight to searched user
                        var target = usersTable.find("tr td:contains('" + data.mPhoneNo + "')").parent()
                        getProfileInfo(target)
                        
                    }      
                })
            }
        })
        
        // [PRE] User selected a specific page #
        function jumpToPage(pageNum) {
            
            $.ajax({
                type: 'GET',
                data: {pageNum: pageNum},
                url: '/usersInfo/jumpToPage',
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success:
                function(data){
                    updatePage(data.currPage, data.users)
                }      
            })
        }

        // [POST] update page (both list of users and pagination)
        function updatePage(currentPage, users) {

            // clear table
            usersTable.empty()

            // update current page (logically)
            currPage = currentPage

            // create elements and insert user data, then append to table
            for (var i = 0; i < users.length; i++) {

                var tr = $("<tr>")
                    tr.addClass("userinfo")
                
                var tdPhone = $("<td>")
                    tdPhone.addClass("mPhoneNo")
                    tdPhone.css("padding-left", "1em")
                    tdPhone.html(users[i].phone)
                    
                var tdName = $("<td>")
                    tdName.html(users[i].name)

                var tdCity = $("<td>")
                    tdCity.html(users[i].city)

                var tdVerification = $("<td>")
                    tdVerification.html(users[i].v_status)
                
                tr.append(tdPhone)
                tr.append(tdName)
                tr.append(tdCity)
                tr.append(tdVerification)

                usersTable.append(tr)
            }

            // update pagination
            $("li.page-item.page-no.active").removeClass("active")
            $("li.page-item.page-no").eq(currPage-1).addClass("active")
            if (currPage == 1) { prevBtn.addClass("disabled") }
            else               { prevBtn.removeClass("disabled") }
            if (currPage == totalPages) { nextBtn.addClass("disabled") }
            else                        { nextBtn.removeClass("disabled") }

            // set on click functionality
            $(".userinfo").click(function(){getProfileInfo($(this))}).css("cursor", "pointer")

            // show user details div
            notifyDiv.fadeOut()
            userDetailsDiv.fadeOut()

            // scroll to top
            $(window).scrollTop(0) 

            console.log("Current Page: " + currPage)

        }

        // pulls number of total pages from controller
        function getTotalPages() {
            $.ajax({
                type: 'GET',
                url: '/usersInfo/sendTotalPages',
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success:
                function(data){ setTotalPages(data.totalPages) }      
            }) 
        } function setTotalPages(total) { totalPages = total }


        
        // ////////////////////////////////// MODAL FUNCTIONS/LOGIC ////////////////////////////////// //

        // Get the modal
        var modal = document.getElementById("myModal");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        // ////////////////////////////////// OTHERS  ////////////////////////////////// //

        // (UI) adds CSS to clicked user; removes CSS to previous clicked
        function setFocusCSS(obj) {
            
            // remove previous selected css
            if (previousObj != 1) previousObj.removeClass("user-selected")
            previousObj = obj

            // add currently selected css
            obj.addClass("user-selected")

            // scroll to top
            $(window).scrollTop(0)        
        }

        // Notify User Logic : TODO: replace selector
        notifyBtn.click(function(){

            $.ajax({
                type: 'GET',
                data: {id: userUID.html()},
                url: '/usersInfo/notifyUser',
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success: function(){
                    modal.style.display = "block";
                    // $(self).closest("tr").find('.notification').html("Yes")
                    // $(self).css("display", "none")
                }
            })
            // var self = this
            // var id = $(this).next('span').text()
        })







        















    })
})