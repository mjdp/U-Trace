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

        // modal: Success
        var modal_success = document.getElementById("modal-success")
        var span_s = document.getElementsByClassName("close")[0]
        span_s.onclick = function() {
            modal_success.style.display = "none"
        }
        
        // modal: Password Discrepancy
        var modal_pwDiscrepancy = document.getElementById("modal-pwDiscrepancy")
        var span_pwd = document.getElementsByClassName("close")[1]
        span_pwd.onclick = function() {
            modal_pwDiscrepancy.style.display = "none"
        }

        // modal: Password Discrepancy
        var modal_incPw = document.getElementById("modal-incPw")
        var span_inc = document.getElementsByClassName("close")[2]
        span_inc.onclick = function() {
            modal_incPw.style.display = "none"
        }

        // modal: Unknown Error
        var modal_error = document.getElementById("modal-error")
        var span_inc = document.getElementsByClassName("close")[3]
        span_inc.onclick = function() {
            modal_error.style.display = "none"
        }

        // modal: Password Less Than 6
        var modal_pwLessThan6 = document.getElementById("modal-pwLessThan6")
        var span_6 = document.getElementsByClassName("close")[4]
        span_6.onclick = function() {
            modal_pwLessThan6.style.display = "none"
        }

        // modal event triggers
        window.onclick = function(event) {
            if (event.target == modal_success) {
                modal_success.style.display = "none"
            }
            if (event.target == modal_pwDiscrepancy) {
                modal_pwDiscrepancy.style.display = "none"
            }
            if (event.target == modal_incPw) {
                modal_incPw.style.display = "none"
            }
            if (event.target == modal_error) {
                modal_incPw.style.display = "none"
            }
        }

        // get elements
        const currPw = $('#currPw')
        const newPw = $('#newPw')
        const newConfirmPw = $('#newConfirmPw')
        const updatePwBtn = $('#updatePwBtn')

        // current pass input listener
        currPw.on("keyup", function() {
            if (passwordInputsCheck()) {
                updatePwBtn.css("background-color", "#2A8348")
                updatePwBtn.attr('disabled', false)
            }
        })

        // new pass input listener
        newPw.on("keyup", function() {
            if (passwordInputsCheck()) {
                updatePwBtn.css("background-color", "#2A8348")
                updatePwBtn.attr('disabled', false)
            }
        })

        // confirm new pass input listener
        newConfirmPw.on("keyup", function() {
            if (passwordInputsCheck()) {
                updatePwBtn.css("background-color", "#2A8348")
                updatePwBtn.attr('disabled', false)
            }
        })

        // send to controller for checking, and if all inputs are correct, update the user's password
        updatePwBtn.click(function () {
            console.log("update button triggered")
            $.ajax({
                type: 'GET',
                data: {currPw: currPw.val(), newPw: newPw.val(), confirmNewPw: newConfirmPw.val()},
                timeout: 5000,
                url: '/user/update-password',
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success: function(data){

                    if (data.result == "PW_DISCREPANCY") {
                        modal_pwDiscrepancy.style.display = "block"

                    } else if (data.result == "INCORRECT_PW") {
                        modal_incPw.style.display = "block"

                    } else if (data.result == "UNKNOWN_ERROR") {
                        modal_error.style.display = "block"

                    } else if (data.result == "PW_<6") {
                        modal_pwLessThan6.style.display = "block"

                    } else if (data.result == "SUCCESS") {
                        modal_success.style.display = "block"
                        resetPasswordFields()

                    } else {
                        console.log("Out of Bounds: An error has occured when updating your password.")
                    }
                    
                }
            })
        })

        // checks if all password inputs have value
        function passwordInputsCheck() { 
            if(currPw.val() && newPw.val() && newConfirmPw.val()) { console.log("true"); return true }
            else { console.log("false"); return false }
        }

        // resets the password fields and disables the update button (only triggers when the password update is successful)
        function resetPasswordFields() {
            currPw.val("")
            newPw.val("")
            newConfirmPw.val("")
            updatePwBtn.css("background-color", "#708978")
            updatePwBtn.attr('disabled', true)
        }
    })
})