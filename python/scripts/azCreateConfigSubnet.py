import sys
import json

def subnet(jsonFile, tfFile, configName):
  configText = ""

  with open(jsonFile, 'r') as f:
      config = json.load(f)

  for data in config:
    name   = data["name"]
    cidrBlock = data["cidr"]
    rgName    = data["rg"]
    parentVPC = data["parentVPC"]

    configText = configText + \
    'resource "azurerm_subnet" "' + name + '" {\n\
      name                  = "' + name + '"\n\
      resource_group_name   = azurerm_resource_group.' + rgName + '.name\n\
      address_prefixes      = ["' + cidrBlock + '"]\n\
      virtual_network_name  = azurerm_virtual_network.' + parentVPC + '.name\n\
  }\n\n'

  with open(tfFile, 'w') as f:
      f.write(configText)

if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  configName = str(sys.argv[3])
  subnet(jsonFile, tfFile, configName)