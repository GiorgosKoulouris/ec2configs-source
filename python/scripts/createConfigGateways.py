import sys
import json

def gateway(jsonFile, tfFile, configName):
  configText = ""

  with open(jsonFile, 'r') as f:
      data = json.load(f)

  for gw in data["natGwsConfig"]:
    name          = gw["name"]
    subnet        = gw["subnet"]
    connection    = gw["connection"]
    privateIp     = gw["privateIp"]
    eipAllocation = gw["eipAllocation"]


    if (connection == "public" and eipAllocation == "new"):
      eipAllocation = name + "-natEIP"
      configText = configText + \
      'resource "aws_eip" "' + eipAllocation + '" {\n\
        domain = "vpc"\n\
      }\n'

    configText = configText + \
    'resource "aws_nat_gateway" "' + name + '" {\n\
      connectivity_type = "' + connection + '"\n\
      subnet_id         = aws_subnet.' + subnet + '.id\n\
      private_ip        = "' + privateIp + '"\n'

    if (connection == "public"):
      configText = configText + \
        'allocation_id     = aws_eip.' + eipAllocation + '.id\n'

    configText = configText + \
    '\ntags = {\n\
      Name = "' + name + '"\n\
      config_name = "' + configName + '"\n\
    }\n\
    }\n'

  configText = configText + '\n'

  for config in data["transitGwsConfig"]:

    name        = config["name"]
    dnsSupport  = config["dnsSupport"]
    ecmpSupport = config["ecmpSupport"]
    cidr        = config["cidr"]
    rtAssoc     = config["rtAssoc"]
    rtProp      = config["rtProp"]
    multicast   = config["multicast"]


    configText = configText + \
    'resource "aws_ec2_transit_gateway" "' + name + '" {\n\
    dns_support = "' + dnsSupport + '"\n\
    vpn_ecmp_support = "' + ecmpSupport + '"\n\
    default_route_table_association = "' + rtAssoc + '"\n\
    default_route_table_propagation = "' + rtProp + '"\n\
    multicast_support = "' + multicast + '"\n'

    if (cidr == ""):
      configText = configText + '\n'
    else:
      configText = configText + 'transit_gateway_cidr_blocks = "' + cidr + '"\n\n'

    configText = configText + \
    'tags = {\n\
      Name = "' + name + '"\n\
      config_name = "' + configName + '"\n\
    }\n\
    }\n'

  configText = configText + '\n'

  for config in data["egressGwsConfig"]:

    name            = config["name"]
    attachedVpcName = config["attachedVpcName"]
    attachedVpcId   = config["attachedVpcId"]

    configText = configText + \
    'resource "aws_egress_only_internet_gateway" "' + name + '" {\n'

    if (attachedVpcName == "-- Other --"):
      configText = configText + \
      'vpc_id = "' + attachedVpcId + '"\n\n'
    else:
      configText = configText + \
      'vpc_id = aws_vpc.' + attachedVpcName + '.id\n\n'

    configText = configText + \
        'tags = {\n\
        Name  = "' + name + '"\n\
        config_name = "' + configName + '"\n\
      }\n\
    }\n'

  configText = configText + '\n'

  for config in data["custGwsConfig"]:
    name = config["name"]
    bgpASN = str(config["bgpASN"])
    ipAddress = config["ipAddress"]

    configText = configText + \
    'resource "aws_customer_gateway" "' + name + '" {\n\
    bgp_asn    = ' + bgpASN + '\n\
    ip_address = "' + ipAddress + '"\n\
    type       = "ipsec.1"\n\n\
    tags = {\n\
      Name = "' + name + '"\n\
      config_name = "' + configName + '"\n\
    }\n}\n'

  configText = configText + '\n'

  for config in data["vpGwsConfig"]:
    name = config["name"]
    asnType = config["asnType"]
    asn = config["asn"]
    az = config["az"]
    vpcName = config["attachedVpcName"]
    vpcId = config["attachedVpcId"]

    configText = configText + \
    'resource "aws_vpn_gateway" "' + name + '" {\n'

    if (asnType != "Default"):
      configText = configText + 'amazon_side_asn = "' + asn + '"\n'

    if (az != "-- Optional --"):
      configText = configText + 'availability_zone = "' + az + '"\n'

    if (vpcName != "-- Optional --"):
      if (vpcName == "-- Other --"):
        configText = configText + 'vpc_id = "' + vpcId + '"\n'
      else:
        configText = configText + 'vpc_id = aws_vpc.' + vpcName + '.id\n'

    configText = configText + \
    'tags = {\n\
      Name = "' + name + '"\n\
      config_name = "' + configName + '"\n\
    }\n}\n'


  with open(tfFile, 'w') as f:
      f.write(configText)

if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  configName = str(sys.argv[3])
  gateway(jsonFile, tfFile, configName)