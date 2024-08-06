import sys
import json

def subnet(jsonFile, tfFile, configName):
  configText = ""

  with open(jsonFile, 'r') as f:
      data = json.load(f)

  for subnet in data:
    subnetName = subnet["name"]
    parentVPC = subnet["parentVPC"]
    cidrBlock = subnet["cidr"]
    az = subnet["az"]

    configText = configText + \
    'resource \"aws_subnet\" \"' + subnetName + '" {\n\
      vpc_id = aws_vpc.' + parentVPC + '.id\n\
      cidr_block              = "' + cidrBlock + '"\n\
      availability_zone       = "' + az + '"\n\
    \n\
      tags = {\n\
        Name  = "' + subnetName + '"\n\
        config_name = "' + configName + '"\n\
      }\n\
    }\n'

  with open(tfFile, 'w') as f:
      f.write(configText)

if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  configName = str(sys.argv[3])
  subnet(jsonFile, tfFile, configName)