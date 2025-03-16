import base64

with open("backend/test_healthy.wav", 'rb') as file:
    with open('temp.txt', 'w') as file2:
        content = file.read()
    
        file2.write(base64.b64encode(content).decode('ascii'))