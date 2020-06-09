import json

from flask import Flask, request
from flask_cors import CORS

from utils import test_single

app = Flask(__name__)
CORS(app, resources=r'/*')


@app.route('/', methods=["POST"])
def get_captcha():
    data = request.get_data()
    json_data = json.loads(data)
    base64 = json_data['base64']
    print(base64)
    ret = test_single(base64)
    return {
        'captcha': ret
    }


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
