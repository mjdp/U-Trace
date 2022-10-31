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

        const form = document.getElementById('deleteAccForm')

        confirmDeleteBtn = $("#confirmDeletion")
        passwordForDeletion = $("#passDelete")
        closePwModal = $('#closePwModal')
        wrongPwDiv = $('#wrongPassword')
        accToDelete = $('#accToDelete')
        deleteSuccessBanner =$('#deleteSuccessBanner')
        delBannerBtn = $('#delBannerBtn')
        var idToDelete
        

        // SAVE SUCCESS MODAL
        var modal = document.getElementById("myModal");
        var span = document.getElementsByClassName("close")[0];
        span.onclick = function() {
            modal.style.display = "none";
        }

        // CONFIRM ACC DELETE MODAL
        var pwModal = document.getElementById("pwModal");
        var pwBtn = document.getElementsByClassName("save-btn-v2-enabled")[0];
        pwBtn.onclick = function() {
            pwModal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        // ACCORDION SEARCH LOGIC
        $("#tableSearch").on("keyup", function() {
            $('.accordion-button').addClass('collapsed')
            $('.accordion-collapse').removeClass('show')
            var value = $(this).val().toLowerCase()
            $("#users-accordion button").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            })
        })

        // DELETE (INITIAL) BTN LOGIC
        deletebtn = $('.delete-btn')
        deletebtn.click(function(){
            idToDelete = $(this).closest('tr').find('.toDelete').text()
            accToDelete.val(idToDelete)
            pwModal.style.display = "block"
        })

        // CONFIRM DELETE BTN LOGIC
        confirmDeleteBtn.click(function(){
            console.log("PRE-SUBMIT: " + accToDelete.val())

            $.ajax({
                type: 'GET',
                data: {password: passwordForDeletion.val()},
                url: '/user/checkPasswordFromSettings',
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success: function(data){

                    if (data.result == "INCORRECT_PW") {
                        wrongPwDiv.attr("hidden", false)

                    } else if (data.result == "CORRECT_PW") {
                        console.log("REAUTHENTICATION SUCCESS! Submitting form...")
                        $(form).submit()

                    } else {
                        console.log("SETTINGS | ON CONFIRM DELETE: UNKNOWN ERROR OCCURED.")
                    }
                }
            })
        })  

        // GEN COUNT CHECK
        var initialCheck = parseInt($('#genCtr').val())
        if (initialCheck == 1) {
            $('#dec').removeClass('by1')
            $('#dec').addClass('by1Disabled')
            $('#dec').attr('disabled', true)
        }

        // INCREMENT/DECREMENT GEN COUNT LOGIC
        $('#inc').click(function(){
            var ctr = parseInt($('#genCtr').val())
            $('#genCtr').val(ctr + 1)
            $('#save').css("display", "inline-block")
            $('#dec').removeClass('by1Disabled')
            $('#dec').addClass('by1')
            $('#dec').attr('disabled', false)
        })
        $('#dec').click(function(){
            var ctr = parseInt($('#genCtr').val())
            if (ctr > 1) {
                ctr = ctr - 1
                $('#genCtr').val(ctr)
                $('#save').css("display", "inline-block")                
                if (ctr == 1) {
                    $('#dec').removeClass('by1')
                    $('#dec').addClass('by1Disabled')
                    $('#dec').attr('disabled', true)
                }
            }
        })

        // SAVE CHANGES LOGIC
        $('#save').click(function(){

            var ctr = parseInt($('#genCtr').val())

            $.ajax({
                type: 'GET',
                data: { genCount: ctr },
                url: '/settings/save-changes',
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success: function(){
                    $('#save').css("display", "none")
                    modal.style.display = "block"
                }
            })
        })

        // CONFIRM PASSWORD FOR DELETION LISTENER
        passwordForDeletion.on("keyup", function() {
            if (passwordForDeletion.val()) {
                console.log("enabled confirm delete button")
                confirmDeleteBtn.removeClass('delete-btn-v2-disabled')
                confirmDeleteBtn.addClass('delete-btn-v2-enabled')     
                confirmDeleteBtn.attr('disabled', false)
                wrongPwDiv.attr("hidden", true)

            } else {
                console.log("disabled confirm delete button")
                confirmDeleteBtn.removeClass('delete-btn-v2-enabled')
                confirmDeleteBtn.addClass('delete-btn-v2-disabled') 
                confirmDeleteBtn.attr('disabled', true)  
            }
        })

        // HIDE DELETION SUCCESS BANNER
        delBannerBtn.click(function(){
            deleteSuccessBanner.css("display", "none")
        })

        //
    })
})