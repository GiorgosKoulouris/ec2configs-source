import sys
import json

def peering(jsonFile, tfFile, configName):
  configText = ""

  with open(jsonFile, 'r') as f:
      data = json.load(f)

  for config in data:

    connectionName  = config["name"]
    attachedVpcId   = config["attachedVpcId"]
    attachedVpcName = config["attachedVpcName"]
    peerAccountName = config["peerAccountName"]
    peerAccountId   = config["peerAccountId"]
    peerVpcId       = config["peerVpcId"]
    peerVpcName     = config["peerVpcName"]


    configText = configText + \
    'resource "aws_vpc_peering_connection" "' + connectionName + '" {\n'

    if (attachedVpcName == "-- Other --"):
      configText = configText + \
      'vpc_id = "' + attachedVpcId + '"\n'
    else:
      configText = configText + \
      'vpc_id = aws_vpc.' + attachedVpcName + '.id\n'

    if (peerAccountName != "Same Account"):
      configText = configText + \
      'peer_owner_id = "' + peerAccountId + '"\n'

    if (peerVpcName == "-- Other --"):
      configText = configText + \
      'peer_vpc_id   = "' + peerVpcId + '"\n\n'
    else:
      configText = configText + \
      'peer_vpc_id   = aws_vpc.' + peerVpcName + '.id\n'

    configText = configText + \
      'tags = {\n\
        Name  = "' + connectionName + '"\n\
        config_name = "' + configName + '"\n\
      }\n\
    }\n'

  with open(tfFile, 'w') as f:
      f.write(configText)

if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  configName = str(sys.argv[3])
  peering(jsonFile, tfFile, configName)