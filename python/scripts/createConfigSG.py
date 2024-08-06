import os
import sys
import json

configText = ""

jsonFile = str(sys.argv[1])
tfFile = str(sys.argv[2])
configName = str(sys.argv[3])

with open(jsonFile, 'r') as f:
    config = json.load(f)

for data in config:
  ruleName = data["name"]
  attachedVPC = data["attachedVPC"]

  configText = configText + \
  'resource "aws_security_group" "' + ruleName + '" {\n\
    name   = "' + ruleName + '"\n\
    vpc_id = aws_vpc.' + attachedVPC + '.id\n\
  \n'

  for rule in (data["rules"]):
    ruleType = rule["ruleType"]
    startPort = str(rule["startPort"])
    endPort = str(rule["endPort"])
    protocol = rule["protocol"]
    cidrBlock = str(rule["cidr"])[2:].rstrip("']")

    configText = configText + \
    ' ' + ruleType + ' {\n\
      from_port   = ' + startPort + '\n\
      to_port     = ' + endPort + '\n\
      protocol    = "' + protocol + '"\n\
      cidr_blocks = ["' + cidrBlock + '"]\n\
    }\n'

  configText = configText + '\
  \n\
    tags = {\n\
      Name  = "' + ruleName + '"\n\
      config_name = "' + configName + '"\n\
    }\n\
  }\n'

with open(tfFile, 'w') as f:
  f.write(configText)

