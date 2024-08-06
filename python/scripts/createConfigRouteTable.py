import sys
import json

def routeTable(jsonFile, tfFile, configName):
  configText = ""

  with open(jsonFile, 'r') as f:
      data = json.load(f)

  tables = data["tables"]
  assocs = data["assocs"]
  tgwAtt = data["tgwAttachments"]

  for config in tables:

    tableName  = config["name"]
    attachedVpcName = config["attachedVpcName"]
    attachedVpcId   = config["attachedVpcId"]
    routes          = config["routes"]

    configText = configText + \
    'resource "aws_route_table" "' + tableName + '" {\n'

    if (attachedVpcName == "-- Other --"):
      configText = configText + \
      'vpc_id = "' + attachedVpcId + '"\n\n'
    else:
      configText = configText + \
      'vpc_id = aws_vpc.' + attachedVpcName + '.id\n\n'

    configText = configText + '\
      tags = {\n\
        Name  = "' + tableName + '"\n\
        config_name = "' + configName + '"\n\
      }\n\
    }\n'

    for route in config["routes"]:
      configText = configText + '\
      resource "aws_route" "' + route["name"] + '" {\n\
      route_table_id  = aws_route_table.' + tableName + '.id\n'

      if (route["targetType"] != "Egress GW"):
        configText = configText + 'destination_cidr_block = "' + route["dest"] + '"\n'
      else:
        configText = configText + 'destination_ipv6_cidr_block = "' + route["dest"] + '"\n'

      match route["targetType"]:
        case "Transit GW":
          if (route["targetName"] == "-- Other --"):
            configText = configText + 'transit_gateway_id = "' + route["targetId"] + '"\n}\n'
          else:
            configText = configText + 'transit_gateway_id = aws_ec2_transit_gateway.' + route["targetName"] + '.id\n}\n'

        case "VP GW":
          if (route["targetName"] == "-- Other --"):
            configText = configText + 'gateway_id = "' + route["targetId"] + '"\n}\n'
          else:
            configText = configText + 'gateway_id = aws_vpn_gateway.' + route["targetName"] + '.id\n}\n'

        case "Peering connection":
          if (route["targetName"] == "-- Other --"):
            configText = configText + 'vpc_peering_connection_id = "' + route["targetId"] + '"\n}\n'
          else:
            configText = configText + 'vpc_peering_connection_id = aws_vpc_peering_connection.' + route["targetName"] + '.id\n}\n'

        case "Egress GW":
          if (route["targetName"] == "-- Other --"):
            configText = configText + 'egress_only_gateway_id = "' + route["targetId"] + '"\n}\n'
          else:
            configText = configText + 'egress_only_gateway_id = aws_egress_only_internet_gateway.' + route["targetName"] + '.id\n}\n'

        case "NAT GW":
          if (route["targetName"] == "-- Other --"):
            configText = configText + 'nat_gateway_id = "' + route["targetId"] + '"\n}\n'
          else:
            configText = configText + 'nat_gateway_id = aws_nat_gateway.' + route["targetName"] + '.id\n}\n'

        case "Network Interface":
          configText = configText + 'network_interface_id = "' + route["targetId"] + '"\n}\n'

        case "Internet GW":
          if (route["targetName"] == "-- Other --"):
            configText = configText + 'gateway_id = "' + route["targetId"] + '"\n}\n'
          else:
            configText = configText + 'gateway_id = aws_internet_gateway.' + attachedVpcName + '-igw.id\n}\n'

  configText = configText + '\n'

  rtaCount = 0
  for config in assocs:
    name = 'rta-' + str(rtaCount)
    routeTableName = config["routeTableName"]
    routeTableId = config["routeTableId"]
    subnetName = config["subnetName"]
    subnetId = config["subnetId"]

    configText = configText + '\
    resource "aws_route_table_association" "' + name + '" {\n'

    if (routeTableName == "-- Other --"):
      configText = configText + 'route_table_id = "' + routeTableId + '"\n'
    else:
      configText = configText + 'route_table_id = aws_route_table.' + routeTableName + '.id\n'

    if (subnetName == "-- Other --"):
      configText = configText + 'subnet_id = "' + subnetId + '"\n'
    else:
      configText = configText + 'subnet_id = aws_subnet.' + subnetName + '.id\n'

    configText = configText + '}\n'

    rtaCount += 1

  configText = configText + '\n'

  rtaCount = 0
  for config in tgwAtt:
    configText = configText + '\
    resource "aws_ec2_transit_gateway_vpc_attachment" "tgwa-' + str(rtaCount) + '" {\n'

    if (config["tgwName"] == "-- Other --"):
      configText = configText + 'transit_gateway_id = "' + config["tgwId"] + '"\n'
    else:
      configText = configText + 'transit_gateway_id = aws_ec2_transit_gateway.' + config["tgwName"] + '.id\n'

    if (config["vpcName"] == "-- Other --"):
      configText = configText + \
      'vpc_id = "' + config["vpcId"] + '"\n\
      subnet_ids = ["' + config["subnetId"] + '"]\n'
    else:
      configText = configText + 'vpc_id = aws_vpc.' + config["vpcName"] + '.id\n'
      if (config["subnetName"] == "-- Other --"):
        configText = configText + 'subnet_ids = ["' + config["subnetId"] + '"]\n'
      else:
        configText = configText + 'subnet_ids = [aws_subnet.' + config["subnetName"] + '.id]\n'

    configText = configText + '\
      tags = {\n\
        config_name = "' + configName + '"\n\
      }\n\
    }\n'

    rtaCount += 1

  with open(tfFile, 'w') as f:
      f.write(configText)

if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  configName = str(sys.argv[3])
  routeTable(jsonFile, tfFile, configName)