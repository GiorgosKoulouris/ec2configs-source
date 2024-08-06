import sys
import json

def vpc(jsonFile, tfFile, configName):
  configText = ""

  with open(jsonFile, 'r') as f:
      config = json.load(f)

  for data in config:
    vpcName = data["name"]
    cidrBlock = data["cidr"]
    dnsSupport = data["dnsSupport"]
    dnsHostnames = data["dnsHostnames"]
    tenancy = data["tenancy"]

    configText = configText + \
    'resource "aws_vpc" "' + vpcName + '" {\n\
      cidr_block           = "' + cidrBlock + '"\n\
      enable_dns_support   = "' + dnsSupport + '"\n\
      enable_dns_hostnames = "' + dnsHostnames + '"\n\
      instance_tenancy     = "' + tenancy + '"\n\
    \n\
      tags = {\n\
        Name  = "' + vpcName + '"\n\
        config_name = "' + configName + '"\n\
      }\n\
    }\n\
  resource "aws_internet_gateway" "' + vpcName + '-igw" {\n\
    vpc_id = aws_vpc.' + vpcName + '.id\n\
    tags = {\n\
      Name  = "' + vpcName + '-igw"\n\
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