import sys
import json

def az(jsonFile, tfFile):
  configText = ""

  with open(jsonFile, 'r') as f:
      config = json.load(f)

  tenant_id       = config["tenant_id"]
  subscription_id = config["subscription_id"]
  application_id  = config["application_id"]
  secret_value    = config["secret_value"]

  configText = '\
  provider "azurerm" {\n\
    features {}\n\
    subscription_id   = "' + subscription_id + '"\n\
    tenant_id         = "' + tenant_id + '"\n\
    client_id         = "' + application_id + '"\n\
    client_secret     = "' + secret_value + '"\n\
  }'

  with open(tfFile, 'w') as f:
      f.write(configText)

if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  az(jsonFile, tfFile)