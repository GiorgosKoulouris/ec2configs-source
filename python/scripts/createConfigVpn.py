import sys
import json

def vpn(jsonFile, tfFile, configName):
  configText = ""

  with open(jsonFile, 'r') as f:
      config = json.load(f)

  for data in config:
    name = data["name"]
    custGwName = data["custGwName"]
    custGwId = data["custGwId"]
    staticRoutesOnly = data["staticRoutesOnly"]
    gwType = data["gwType"]
    gwName = data["gwName"]
    gwId = data["gwId"]

    configText = configText + \
    'resource "aws_vpn_connection" "' + name + '" {\n\
    type = "ipsec.1"\n\
    static_routes_only  = ' + staticRoutesOnly + '\n'

    if (custGwName == "-- Other --"):
      configText = configText + 'customer_gateway_id = "' + custGwId + '"\n'
    else:
      configText = configText + 'customer_gateway_id = aws_customer_gateway.' + custGwName + '.id\n'

    if (gwType == "VPN GW"):
      configText = configText + 'vpn_gateway_id = '

      if (gwName == "-- Other --"):
        configText = configText + '"' +  gwId + '"\n'
      else:
        configText = configText + 'aws_vpn_gateway.' + gwName + '.id\n'

    elif (gwType == "Transit GW"):
      configText = configText + 'transit_gateway_id = '

      if (gwName == "-- Other --"):
        configText = configText + '"' +  gwId + '"\n'
      else:
        configText = configText + 'aws_ec2_transit_gateway.' + gwName + '.id\n'

    configText = configText + '\n'


    for tnl in data["tunnels"]:
      tnlN = str(tnl["tnlNumber"])

      onStartAction = tnl["onStartAction"]
      ikeVersion = json.dumps(tnl["ikeVersion"])
      psk = tnl["psk"]
      dpdTimeout = tnl["dpdTimeout"]
      dpdAction = tnl["dpdAction"]
      p1DhGroups = json.dumps(tnl["p1DhGroups"])

      p1Encrypt = json.dumps(tnl["p1Encrypt"])
      p1Integrity = json.dumps(tnl["p1Integrity"])
      p1Lifetime = tnl["p1Lifetime"]

      p2DhGroups = json.dumps(tnl["p2DhGroups"])
      p2Encrypt = json.dumps(tnl["p2Encrypt"])
      p2Integrity = json.dumps(tnl["p2Integrity"])
      p2Lifetime = tnl["p2Lifetime"]

      if (psk != ""):
        configText = configText + 'tunnel' + tnlN + '_preshared_key = "' + psk + '"\n'

      configText = configText + \
      'tunnel' + tnlN + '_ike_versions = ' + ikeVersion + '\n\
      tunnel' + tnlN + '_startup_action = "' + onStartAction + '"\n\
      tunnel' + tnlN + '_dpd_timeout_seconds = ' + dpdTimeout + '\n\
      tunnel' + tnlN + '_dpd_timeout_action = "' + dpdAction + '"\n\
      tunnel' + tnlN + '_phase1_dh_group_numbers = ' + p1DhGroups + '\n\
      tunnel' + tnlN + '_phase1_encryption_algorithms = ' + p1Encrypt + '\n\
      tunnel' + tnlN + '_phase1_integrity_algorithms = ' + p1Integrity + '\n\
      tunnel' + tnlN + '_phase1_lifetime_seconds = ' + p1Lifetime + '\n\n\
      tunnel' + tnlN + '_phase2_dh_group_numbers = ' + p2DhGroups + '\n\
      tunnel' + tnlN + '_phase2_encryption_algorithms = ' + p2Encrypt + '\n\
      tunnel' + tnlN + '_phase2_integrity_algorithms = ' + p2Integrity + '\n\
      tunnel' + tnlN + '_phase2_lifetime_seconds = ' + p2Lifetime + '\n\
      '

      configText = configText + '\n'

    configText = configText + \
      'tags = {\n\
      Name  = "' + name + '"\n\
      config_name = "' + configName + '"\n\
      }\n\
    }\n\n'

    staticRoutes = data["staticRoutes"]
    for route in staticRoutes:
      configText = configText + \
      'resource "aws_vpn_connection_route" "' + route["name"] + '" {\n\
      destination_cidr_block = "' + route["cidr"] + '"\n\
      vpn_connection_id = aws_vpn_connection.' + name + '.id\n}\n\n'


  with open(tfFile, 'w') as f:
    f.write(configText)


if __name__ == '__main__':
  jsonFile = str(sys.argv[1])
  tfFile = str(sys.argv[2])
  configName = str(sys.argv[3])
  vpn(jsonFile, tfFile, configName)