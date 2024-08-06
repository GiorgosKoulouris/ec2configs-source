import os
import sys
from dotenv import load_dotenv

from createAWS import createAWS
from createAzure import createAzure

def runScripts(provider, configUUID, configName, location):
    load_dotenv()

    env = os.getenv('ENV')
    if ( env == 'docker' or env == 'kubernetes' ):
        dataRootFolder = "/data"
    else:
        dataRootFolder = os.getenv('HOST_CONF_ROOT_FOLDER')

    configFolder = os.path.join(dataRootFolder, configUUID)

    if (provider == 'aws'):
        createAWS(configFolder, configName)
    elif (provider == 'az'): 
        location = str(sys.argv[4])
        createAzure(configFolder, configName, location)


if __name__ == "__main__":
    provider = str(sys.argv[1])
    configUUID = str(sys.argv[2])
    configName = str(sys.argv[3])
    if (provider == 'aws'):
        runScripts(provider, configUUID, configName, "dummy")
    elif (provider == 'az'): 
        location = str(sys.argv[4])
        runScripts(provider, configUUID, configName, location)
