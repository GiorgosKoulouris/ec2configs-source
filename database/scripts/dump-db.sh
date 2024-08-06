#!/bin/bash

databases="vpcprovisioner"
containerName="ec2c-database"

d=`date +%Y%m%d_%H%M%S`
f="/dumps/vpcprov_dump_$d.sql"

docker exec -it $containerName mariadb-dump --user root --password --add-drop-database --add-drop-table --databases $databases --result-file=$f
