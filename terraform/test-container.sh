#!/bin/bash

configsPath=/path/to/stored/configs
targetConfigFolder='1234-5678-45'
action=plan # plan/apply/destroy

docker run --rm -v $localDir:/configs ec2c-terraform-job $targetConfigFolder $action

