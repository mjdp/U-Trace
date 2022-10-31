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

        // submit form validation
        const form = document.getElementById('newUserForm')
        const newName = $('#newName')
        const newEmail = $('#newEmail')
        const newType = $('#newType')
        const newPw = $('#newPw')
        const newConfirmPw = $('#newConfirmPw')
        const newRegion = $('#newRegion')
        const newProvince = $('#newProvince')
        const newCity = $('#newCity')
        const newBarangay = $('#newBarangay')
        var usedEmails

        $(form).submit(function () {
            var result = validate()
            return result;
        })

        // get used emails for validation
        var usedEmails = []
        retrieveEmails()
        function retrieveEmails() {
            $.ajax({
                type: 'GET',
                url: '/addUser/retrieveEmails',
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success:
                function(data){ initEmails(data.emails) }      
            }) 
        } function initEmails(emails) { usedEmails = emails }

        function validate() {
            var check = true
            
            // name validation
            if (newName.val() == "") {
                setErrorFor(newName, "please input a name.")
                check = false
            } else {
                setSuccessFor(newName, "Looks good!")
            }
            // email validation
            if (newEmail.val() == "") {
                setErrorFor(newEmail, "please input an email.")
                check = false
            } else if (usedEmails.includes(newEmail.val())) {
                setErrorFor(newEmail, "This email has already been used.")
                check = false
            } else {
                setSuccessFor(newEmail, "Email is available!")
            }

            // user type validation
            if (newType.val() == "") {
                setErrorFor(newType, "Please input the type of user.")
                check = false
            } else {
                setSuccessFor(newType, "User type set.") 
            }

            // password validation
            if (newPw.val() == "" && newConfirmPw.val() != "") {
                setErrorFor(newPw, "Please input a password.")
                setErrorFor(newConfirmPw, "You have no password to confirm.")
                check = false
            } 
            else if (newConfirmPw.val() == "" && newPw.val() != "") {
                setErrorFor(newConfirmPw, "Please confirm the password.")
                setSuccessFor(newPw, "Password set.") 
                check = false
            }
            else if (newConfirmPw.val() == "" && newPw.val() == "") {
                setErrorFor(newPw, "Please input a password.")
                setErrorFor(newConfirmPw, "Please confirm the password.")
                check = false
            }
            else if (newConfirmPw.val() != newPw.val()) {
                setErrorFor(newPw, "Passwords do not match.")
                setErrorFor(newConfirmPw, "Passwords do not match.")
                check = false
            }
            else if (newPw.val().length < 5) {
                setErrorFor(newPw, "Password must be at least 6 characters.")
                setErrorFor(newConfirmPw, "Password must be at least 6 characters.")
                check = false
            }
            else if (newConfirmPw.val().length < 6) {
                setErrorFor(newPw, "Password must be at least 6 characters.")
                setErrorFor(newConfirmPw, "Password must be at least 6 characters.")
                check = false
            }
            else {
                setSuccessFor(newPw, "Password set.")
                setSuccessFor(newConfirmPw, "Passwords match!") 
            }

            // region validation
            if (newRegion.val() == "") {
                setErrorFor(newRegion, "Please select a region.")
                check = false
            } else {
                setSuccessFor(newRegion, "Region selected.")
            }

            // province validation
            if (newProvince.val() == "") {
                setErrorFor(newProvince, "Please select a province.")
                check = false
            } else {
                setSuccessFor(newProvince, "Province selected.")
            }

            // city validation
            if (newCity.val() == "") {
                setErrorFor(newCity, "Please select a city.")
                check = false
            } else {
                setSuccessFor(newCity, "City selected.")
            }

            // barangay validation
            if (newBarangay.val() == "") {
                setErrorFor(newBarangay, "Please select a barangay.")
                check = false
            } else {
                setSuccessFor(newBarangay, "Barangay selected.")
            }
            
            return check;
        }

        function setSuccessFor(input, message) {
            const holder = input.closest('.flex-child')
            const msg = holder.find('small')

            // reset
            holder.removeClass('success')
            holder.removeClass('error')
            msg.text("")

            // set
            holder.addClass('success')
            msg.text(message)
        }

        function setErrorFor(input, message) {
            const holder = input.closest('.flex-child')
            const msg = holder.find('small')

            // reset
            holder.removeClass('success')
            holder.removeClass('error')
            msg.text("")

            // set
            holder.addClass('error')
            msg.text(message)
        }
    })
})


