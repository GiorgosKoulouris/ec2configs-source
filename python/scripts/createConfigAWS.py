import sys
import json

def aws(jsonFile, tfFile):
  configText = ""

  with open(jsonFile, 'r') as f:
      config = json.load(f)

  accessKey = config["awsAccessKey"]
  secretKey = config["awsSecret"]
  region    = config["region"]

  configText = '\
  provider "aws" {\n\
    access_key = "' + accessKey + '"\n\
    secret_key = "' + secretKey + '"\n\
    region     = "' + region + '"\n\
  }'

  with open(tfFile, 'w') as f:
      f.write(configText)

if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  aws(jsonFile, tfFile)