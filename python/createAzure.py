import os

from scripts.azCreateConfigRG import rg
from scripts.azCreateConfigAzure import az
from scripts.azCreateConfigVPC import vpc
from scripts.azCreateConfigSubnet import subnet
from scripts.azCreateConfigPublicIP import ip


def createAzure(configFolder, configName, location):
    jsonFile = os.path.join(configFolder, "json", "rgConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "rg.tf")
    rg(jsonFile, tfFile, configName, location)

    jsonFile = os.path.join(configFolder, "json", "azConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "mainAzure.tf")
    az(jsonFile, tfFile)

    jsonFile = os.path.join(configFolder, "json", "vpcConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "vpc.tf")
    vpc(jsonFile, tfFile, configName)

    jsonFile = os.path.join(configFolder, "json", "subnetConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "subnet.tf")
    subnet(jsonFile, tfFile, configName)

    jsonFile = os.path.join(configFolder, "json", "publicIpConfig.json")
    tfFile = os.path.join(configFolder, "terraform", "publicIp.tf")
    ip(jsonFile, tfFile, configName)
