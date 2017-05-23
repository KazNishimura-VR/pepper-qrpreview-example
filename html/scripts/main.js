
function activatePanel(id) {
    document.getElementById(id).classList.remove("inactive")
    document.getElementById(id).classList.add("active")
}

function inactivatePanel(id) {
    document.getElementById(id).classList.remove("active")
    document.getElementById(id).classList.add("inactive")
}

var previewRunning = false;
var imgData;
var context;

function getImage(ALVideoDevice, subscriberId) {
    ALVideoDevice.getImageRemote(subscriberId).then(function (image) {
        if(image) {
            var imageWidth = image[0];
            var imageHeight = image[1];
            var imageBuf = image[6];
            console.log("Get image: " + imageWidth + ", " + imageHeight);

            if (!context) {
                context = document.getElementById("canvas").getContext("2d");
            }
            if (!imgData || imageWidth != imgData.width || imageHeight != imgData.height) {
                imgData = context.createImageData(imageWidth, imageHeight);
            }
            var data = imgData.data;

            for (var i = 0, len = imageHeight * imageWidth; i < len; i++) {
                var v = imageBuf[i];
                data[i * 4 + 0] = v;
                data[i * 4 + 1] = v;
                data[i * 4 + 2] = v;
                data[i * 4 + 3] = 255;
            }

            context.putImageData(imgData, 0, 0);
        }
        
        if(previewRunning) {
            setTimeout(function() { getImage(ALVideoDevice, subscriberId) }, 100)
        }
    })
}

function startSession() {
    QiSession(
        function(session) {
            session.service("ALVideoDevice").then(function (ALVideoDevice) {
                session.service("ALMemory").then(function (ALMemory) {
                    var currentImage = null
                    
                    document.getElementById("abort").addEventListener("touchend", function(e) {
                        ALMemory.raiseEvent("ProgrammingPepperSample/AbortPressed", 1).then(function () {
                                console.log("Sent event")
                            })
                        });
                    ALMemory.subscriber("ProgrammingPepperSample/PreviewMode").then(function(subscriber) {
                            subscriber.signal.connect(function(subscriberId) {
                                if(subscriberId.length > 0) {
                                    console.log("Subscribing...: " + subscriberId)
                                    previewRunning = true
                                    activatePanel("camera")
                                    activatePanel("common")
                                    getImage(ALVideoDevice, subscriberId)
                                }else{
                                    previewRunning = false
                                    inactivatePanel("camera")
                                    inactivatePanel("common")
                                }
                            })
                        });
                });
            });
        }, function() {
            console.log("disconnected")
        }
    );
}
