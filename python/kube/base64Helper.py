import base64
import json
import yaml

kubeConfigFile = './aws/config.yml'
with open(kubeConfigFile, 'r') as file:
    kubeconfig = yaml.safe_load(file)

json_string = json.dumps(kubeconfig)

# Convert the string to bytes
byte_data = json_string.encode('utf-8')

# Encode the bytes
encoded_data = base64.b64encode(byte_data)

print(encoded_data)

