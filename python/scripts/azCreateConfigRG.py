import sys
import json

def rg(jsonFile, tfFile, configName, location):
  configText = ""

  with open(jsonFile, 'r') as f:
      config = json.load(f)

  for data in config:
    rgName   = data["name"]

    configText = configText + \
    'resource "azurerm_resource_group" "' + rgName + '" {\n\
      name                  = "' + rgName + '"\n\
      location              = "' + location + '"\n\
    \n\
      tags = {\n\
        config_name = "' + configName + '"\n\
      }\n\
  }\n\n'

  with open(tfFile, 'w') as f:
      f.write(configText)

if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  configName = str(sys.argv[3])
  location = str(sys.argv[4])
  rg(jsonFile, tfFile, configName, location)