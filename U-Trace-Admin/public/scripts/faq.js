document.addEventListener("DOMContentLoaded", function(event) {

    $(document).ready(function(){

        // get elements
        subject = $('#subject')
        helpContent = $('#helpContent')
        helpbtn = $('#helpbtn')

        subject.on('input', function() {
            fieldCheck()
        })

        helpContent.on('input', function() {
            fieldCheck()
        })

        
        function fieldCheck() {
            if (subject.val().trim() != "" && helpContent.val().trim() != "") {
                helpbtn.prop( "disabled", false );
                helpbtn.removeClass("actn-btn-disabled")
                helpbtn.addClass("actn-btn")
            } else {
                helpbtn.prop( "disabled", true );
                helpbtn.removeClass("actn-btn")
                helpbtn.addClass("actn-btn-disabled")   
            }

        }
        
    })
})