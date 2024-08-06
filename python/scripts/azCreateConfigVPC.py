import sys
import json

def vpc(jsonFile, tfFile, configName):
  configText = ""

  with open(jsonFile, 'r') as f:
      config = json.load(f)

  for data in config:
    vpcName   = data["name"]
    cidrBlock = data["cidr"]
    rgName    = data["rg"]

    configText = configText + \
    'resource "azurerm_virtual_network" "' + vpcName + '" {\n\
      name                  = "' + vpcName + '"\n\
      address_space         = ["' + cidrBlock + '"]\n\
      resource_group_name   = azurerm_resource_group.' + rgName + '.name\n\
      location              = azurerm_resource_group.' + rgName + '.location\n\
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
  vpc(jsonFile, tfFile, configName)