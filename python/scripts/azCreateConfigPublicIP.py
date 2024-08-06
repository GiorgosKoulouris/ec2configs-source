import sys
import json

def ip(jsonFile, tfFile, configName):
  configText = ""

  with open(jsonFile, 'r') as f:
      data = json.load(f)

  for subnet in data:
    ipName = subnet["name"]
    rgName = subnet["rg"]
    allocType = subnet["allocType"]

    configText = configText + \
    'resource "azurerm_public_ip" "' + ipName + '" {\n\
      name                  = "' + ipName + '"\n\
      resource_group_name   = azurerm_resource_group.' + rgName + '.name\n\
      location              = azurerm_resource_group.' + rgName + '.location\n\
      allocation_method     = "' + allocType + '"\n\
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
  ip(jsonFile, tfFile, configName)