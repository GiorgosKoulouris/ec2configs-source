import sys
import json

def aws(jsonFile, tfFile):
  configText = ""

  with open(jsonFile, 'r') as f:
      config = json.load(f)

  region    = config["region"]

  configText = '\
  provider "aws" {\n\
    region     = "' + region + '"\n\
  }'

  with open(tfFile, 'w') as f:
      f.write(configText)

if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  aws(jsonFile, tfFile)