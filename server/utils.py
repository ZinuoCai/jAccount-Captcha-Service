import base64
from io import BytesIO

import cv2 as cv
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

from LeNet import LeNet

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = LeNet().to(DEVICE)
model.load_state_dict(torch.load('lenet.pt'))
model.eval()


def str_to_gray_image(base64_data):
    img_data = base64.b64decode(str(base64_data))
    image = Image.open(BytesIO(img_data))
    return cv.cvtColor(np.array(image), cv.COLOR_BGR2GRAY)


def test_single(base64_data):
    ret_images = process(base64_data)

    if ret_images is None:
        return 'FAIL TO RECOGNIZE'

    # standardize
    for j in range(len(ret_images)):
        ret_images[j] = (ret_images[j] - np.mean(ret_images[j])) / (0.0001 + np.std(ret_images[j]))

    tensor_images = torch.from_numpy(np.array(ret_images)).float().to(DEVICE)
    tensor_images = tensor_images.unsqueeze(1)

    pred = F.softmax(model(tensor_images), dim=1)
    labels = pred.max(1)[1].detach()

    return ''.join([chr(ord('a') + x.item()) for x in labels])


def process(base64_data, output_size=32):
    ret_images = []
    rectangals = []

    base64_data = base64_data.split(',')[-1]
    gray_img = str_to_gray_image(base64_data)

    ret, binary = cv.threshold(gray_img, 127, 255, cv.THRESH_BINARY_INV)

    dilate_kernel = np.ones([2, 2], np.uint8)
    dilate = cv.dilate(binary, dilate_kernel, iterations=1)

    contours, hierarchy = cv.findContours(dilate, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    for contour in contours:
        x, y, w, h = cv.boundingRect(contour)
        rectangals.append([x, y, w, h])

    rectangals.sort(key=lambda x: x[0])
    # merge
    i = 0
    while i < len(rectangals) - 1:
        if rectangals[i + 1][0] - rectangals[i][0] < 10:
            x1, y1, w1, h1 = rectangals[i]
            x2, y2, w2, h2 = rectangals[i + 1]
            rectangals[i] = [min(x1, x2), min(y1, y2), max(w1, w2 + x2 - x1), max(h1, h2)]
            rectangals.remove(rectangals[i + 1])
        i += 1

    # split
    i = 0
    while i < len(rectangals):
        if rectangals[i][2] >= 20:
            x, y, w, h = rectangals[i]
            rectangals[i] = [x, y, w // 2, h]
            rectangals.insert(i + 1, [x + w // 2, y, w // 2, h])
        i += 1

    for rectangal in rectangals:
        x, y, w, h = rectangal
        ret_image = dilate[y:y + h, x:x + w]

        horizontal_padding = (output_size - w) // 2
        vertical_padding = (output_size - h) // 2
        if horizontal_padding >= 0 and vertical_padding >= 0:
            ret_image = cv.copyMakeBorder(ret_image, vertical_padding, vertical_padding,
                                          horizontal_padding, horizontal_padding,
                                          cv.BORDER_CONSTANT, value=0)
        ret_image = cv.resize(ret_image, (output_size, output_size))
        ret_images.append(ret_image)
    return ret_images
