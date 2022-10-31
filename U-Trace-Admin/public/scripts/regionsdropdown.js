$("#newProvince").prop("disabled", true);
$("#newCity").prop("disabled", true);
$("#newBarangay").prop("disabled", true);

$("#newRegion").change(function(){
    $.ajax({
        type: 'GET',
        data: {regionCode: $.parseJSON($(this).val())},
        url: '/addUser/add-userAdmin',
        contentType: "application/json",
        success: function(data){
           
            $("#newProvince").empty();
            $("#newCity").empty();
            $("#newBarangay").empty();

            var placeholder = $("<option>");
            placeholder.html("select a city");
            placeholder.attr("selected", true)
            placeholder.attr("disabled", true)
            placeholder.val("")
            $("#newCity").append(placeholder);

            var placeholder2 = $("<option>");
            placeholder2.html("select a barangay");
            placeholder2.attr("selected", true)
            placeholder2.attr("disabled", true)
            placeholder2.val("")
            $("#newBarangay").append(placeholder2);

            var placeholder3 = $("<option>");
            placeholder3.html("select a province");
            placeholder3.attr("selected", true)
            placeholder3.attr("disabled", true)
            placeholder3.val("")
            $("#newProvince").append(placeholder3);

            $("#newProvince").prop("disabled", false);
            $("#newCity").prop("disabled", true);
            $("#newBarangay").prop("disabled", true);
            for(let i = 0; i < data.provinceArray.length; i++){
                var provName = data.provinceArray[i].provinceName;
                var provCode = data.provinceArray[i].provinceId;
                var parent = $("#newProvince");
                var option = $("<option>");
                option.attr("value", '{"code":"' + provCode + '", "name":"' + provName + '"}');
                option.html(provName);
                parent.append(option);
            }
        }
    })

});

$("#newProvince").change(function(){
    $.ajax({
        type: 'GET',
        data: {provinceCode: $.parseJSON($(this).val())},
        url: '/addUser/add-userAdmin',
        dataType: 'json',
        contentType: "application/json",
        success: function(data){
          
            $("#newCity").prop("disabled", false);
            $("#newCity").empty();
            $("#newBarangay").prop("disabled", true);

            var placeholder = $("<option>");
            placeholder.html("select a city");
            placeholder.attr("selected", true)
            placeholder.attr("disabled", true)
            placeholder.val("")
            $("#newCity").append(placeholder);
            
            var placeholder2 = $("<option>");
            placeholder2.html("select a barangay");
            placeholder2.attr("selected", true)
            placeholder2.attr("disabled", true)
            placeholder2.val("")
            $("#newBarangay").append(placeholder2);

            for(let i = 0; i < data.citiesArray.length; i++){
                var cityName = data.citiesArray[i].cityName;
                var cityCode = data.citiesArray[i].cityId;
                var parent = $("#newCity");
                var option = $("<option>");
                option.attr("value", '{"code":"' + cityCode + '", "name":"' + cityName + '"}');
                option.html(cityName);
                parent.append(option);
            }
        }
    });

    
});

$("#newCity").change(function(){
    $.ajax({
        type: 'GET',
        data: {cityCode: $.parseJSON($(this).val())},
        url: '/addUser/add-userAdmin',
        dataType: 'json',
        contentType: "application/json",
        success: function(data){
           
            $("#newBarangay").prop("disabled", false);
            $("#newBarangay").empty();

            var placeholder = $("<option>");
            placeholder.html("select a barangay");
            placeholder.attr("selected", true)
            placeholder.attr("disabled", true)
            placeholder.val("")
            $("#newBarangay").append(placeholder);
            
            for(let i = 0; i < data.barangayArray.length; i++){
                var barangayName = data.barangayArray[i].barangayName;
                var barangayCode = data.barangayArray[i].barangayId;
                var parent = $("#newBarangay");
                var option = $("<option>");
                option.attr("value", '{"code":"' + barangayCode + '", "name":"' + barangayName + '"}');
                option.html(barangayName);
                parent.append(option);
            }
        }
    });
});
