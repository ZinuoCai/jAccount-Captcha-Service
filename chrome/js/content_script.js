function preprocess() {
    let rectangles = [];
    let ret_images = [];

    // // for debug
    // let canvas0 = document.createElement("canvas");
    // let canvas1 = document.createElement("canvas");
    // let canvas2 = document.createElement("canvas");
    // let canvas3 = document.createElement("canvas");
    // let canvas4 = document.createElement("canvas");
    // document.body.appendChild(canvas0);
    // document.body.appendChild(canvas1);
    // document.body.appendChild(canvas2);
    // document.body.appendChild(canvas3);
    // document.body.appendChild(canvas4);

    let color_img = cv.imread('captcha-img');
    // turn gray
    let gray_img = new cv.Mat();
    cv.cvtColor(color_img, gray_img, cv.COLOR_RGBA2GRAY, 0);

    // binary
    let binary = new cv.Mat();
    cv.threshold(gray_img, binary, 127, 255, cv.THRESH_BINARY_INV);

    // dilate
    let dilate_img = new cv.Mat();
    let dilate_kernel = cv.Mat.ones(2, 2, cv.CV_8U);
    cv.dilate(binary, dilate_img, dilate_kernel);

    // find countours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(dilate_img, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // find all rectangles and push into the array by increase order
    for (let contour_index = 0; contour_index < contours.size(); ++contour_index) {
        rectangles.push(cv.boundingRect(contours.get(contour_index)));
    }
    for (let i = 0; i < rectangles.length; ++i) {
        let min_index = i;
        for (let j = i + 1; j < rectangles.length; ++j) {
            if (rectangles[j].x < rectangles[min_index].x) {
                min_index = j;
            }
        }
        if (min_index !== i) {
            let tmp = rectangles[i];
            rectangles[i] = rectangles[min_index];
            rectangles[min_index] = tmp;
        }
    }

    // merge rectangles
    let i = 0;
    while (i < rectangles.length - 1) {
        if (rectangles[i + 1].x - rectangles[i].x < 10) {
            const x1 = rectangles[i].x, y1 = rectangles[i].y, w1 = rectangles[i].width, h1 = rectangles[i].height;

            const x2 = rectangles[i + 1].x, y2 = rectangles[i + 1].y, w2 = rectangles[i + 1].width,
                h2 = rectangles[i + 1].height;

            rectangles[i].x = Math.min(x1, x2);
            rectangles[i].y = Math.min(y1, y2);
            rectangles[i].width = Math.max(w1, w2 + x2 - x1);
            rectangles[i].height = Math.max(h1, h2);

            rectangles.splice(i + 1, 1);
        }
        i = i + 1;
    }

    // split rectangles
    i = 0;
    while (i < rectangles.length) {
        if (rectangles.width >= 20) {
            const x = rectangles[i].x, y = rectangles[i].y, w = rectangles[i].width, h = rectangles[i].height;
            rectangles[i].width = Math.round(w / 2);
            const insert_rect = {
                "x": x + Math.round(w / 2),
                "y": y,
                "width": Math.round(w / 2),
                "height": h
            };
            rectangles.splice(i + 1, 0, insert_rect);
        }
        i = i + 1;
    }

    // padding, resize
    const output_size = 32;
    for (let i = 0; i < rectangles.length; ++i) {
        const x = rectangles[i].x, y = rectangles[i].y, w = rectangles[i].width, h = rectangles[i].height;

        let ret_image = new cv.Mat();
        let rect = new cv.Rect(x, y, w, h);
        ret_image = dilate_img.roi(rect);

        let horizontal_padding = Math.round((output_size - w) / 2);
        let vertical_padding = Math.round((output_size - h) / 2);
        let dsize = new cv.Size(output_size, output_size);
        let resized_img = new cv.Mat();
        if (horizontal_padding >= 0 && vertical_padding >= 0) {
            let s = new cv.Scalar(255, 0, 0, 255);
            let padding_img = new cv.Mat();
            cv.copyMakeBorder(ret_image, padding_img,
                vertical_padding, vertical_padding,
                horizontal_padding, horizontal_padding,
                cv.BORDER_CONSTANT, s);
            cv.resize(padding_img, resized_img, dsize);
            padding_img.delete();
        } else {
            cv.resize(ret_image, resized_img, dsize);
        }
        ret_images.push(resized_img);

        // // for debug
        // switch (i) {
        //     case 0:
        //         cv.imshow(canvas0, resized_img)
        //         break;
        //     case 1:
        //         cv.imshow(canvas1, resized_img)
        //         break;
        //     case 2:
        //         cv.imshow(canvas2, resized_img)
        //         break;
        //     case 3:
        //         cv.imshow(canvas3, resized_img)
        //         break;
        //     case 4:
        //         cv.imshow(canvas4, resized_img)
        //         break;
        //     default:
        //         break;
        // }
        ret_image.delete();
    }

    color_img.delete();
    gray_img.delete();
    binary.delete();
    dilate_img.delete();
    contours.delete();
    hierarchy.delete();
    return ret_images;
}

async function predict() {
    const ret_images = preprocess();
    const input_size = 32;

    const model = await tf.loadLayersModel('localstorage://my-model');

    const shape = [ret_images.length, input_size, input_size, 1];
    let image_pixels = [];
    for (let i = 0; i < ret_images.length; ++i) {
        let ret_img = ret_images[i];
        for (let row = 0; row < input_size; ++row) {
            for (let col = 0; col < input_size; ++col) {
                image_pixels.push(ret_img.ucharAt(row, col * ret_img.channels()));
            }
        }
        ret_img.delete();
    }
    let tensor = tf.tensor(image_pixels, shape)
    let predict = model.predict(tensor);
    let results = Array.from(predict.argMax(1).dataSync())

    let captcha = "";
    results.forEach(element => {
        captcha += String.fromCharCode(97 + element);
    });

    document.getElementById("captcha").value = captcha;
}

function reset() {
    let uploadJSON = document.createElement("input");
    uploadJSON.value = "Upload Model";
    uploadJSON.type = "file";
    uploadJSON.id = "upload-json";
    let uploadWeights = document.createElement("input")
    uploadWeights.value = "Upload Weights";
    uploadWeights.type = "file";
    uploadWeights.id = "upload-weights";
    let btn = document.createElement("button");
    btn.id = "btn";
    btn.innerHTML = "Add Model";
    document.getElementById("footer").appendChild(uploadJSON);
    document.getElementById("footer").appendChild(uploadWeights);
    document.getElementById("footer").appendChild(btn);

    btn.onclick = async function () {
        console.log("start");
        const uploadJSONInput = document.getElementById('upload-json');
        const uploadWeightsInput = document.getElementById('upload-weights');
        const model = await tf.loadLayersModel(tf.io.browserFiles(
            [uploadJSONInput.files[0], uploadWeightsInput.files[0]]));

        const saveResult = await model.save('localstorage://my-model');
        alert("Successfully add model!");
    }
}

reset();
predict();