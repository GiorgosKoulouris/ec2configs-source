import os

from scripts.createConfigAWS import aws
from scripts.createConfigVPC import vpc
from scripts.createConfigSubnet import subnet
from scripts.createConfigPeerings import peering
from scripts.createConfigGateways import gateway
from scripts.createConfigRouteTable import routeTable
from scripts.createConfigVpn import vpn


def createAWS(configFolder, configName):
    jsonFile = os.path.join(configFolder, "json", "awsConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "mainAWS.tf")
    aws(jsonFile, tfFile)

    jsonFile = os.path.join(configFolder, "json", "vpcConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "VPCs.tf")
    vpc(jsonFile, tfFile, configName)
    
    jsonFile = os.path.join(configFolder, "json", "subnetConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "subnets.tf")
    subnet(jsonFile, tfFile, configName)

    jsonFile = os.path.join(configFolder, "json", "peeringsConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "peerConnections.tf")
    peering(jsonFile, tfFile, configName)

    jsonFile = os.path.join(configFolder, "json", "gatewaysConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "gateways.tf")
    gateway(jsonFile, tfFile, configName)

    jsonFile = os.path.join(configFolder, "json", "routeTablesConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "rt.tf")
    routeTable(jsonFile, tfFile, configName)

    jsonFile = os.path.join(configFolder, "json", "vpnConnectionsConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "vpn.tf")
    vpn(jsonFile, tfFile, configName)

