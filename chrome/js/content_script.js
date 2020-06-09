function convertImgToBase64() {
    let caCanvas = document.createElement("canvas");
    let captcha = document.getElementById('captcha-img');
    caCanvas.width = captcha.naturalWidth;
    caCanvas.height= captcha.naturalHeight;
    caCanvas.getContext('2d').drawImage(captcha, 0, 0);
    return caCanvas.toDataURL()
}

function recognize(){
    $.ajax({
        url: 'https://127.0.0.1:5000/',
        type: 'POST',
        data: JSON.stringify({'base64': convertImgToBase64()}),
        dataType: 'json',
        success: function(res){
            document.getElementById("captcha").value = res['captcha'];
        },
        error: function(res){
            console.log(res)
        }
    });
}

recognize();