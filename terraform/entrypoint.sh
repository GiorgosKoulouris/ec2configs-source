#!/bin/sh

if [ $# -ne 2 ]; then
    echo "not correct number of arguements. exiting..."
    exit 1
fi

# configFolder checks
configUUID="$1"
configFolder="/configs/$configUUID/terraform"

if [ ! -d $configFolder ]; then
    echo "directory does not exist. exiting..."
    exit 1
fi

cd $configFolder
# action checks
action="$2"
if [[ $action != "plan" && $action != "apply" && $action != "destroy" ]]; then
    echo "No valid terraform command was given.." > ../lastError.log && \
    echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && cat ../lastError.log >&2 && exit 1
fi

if [ ! -d './.terraform' ]; then
    terraform providers lock -fs-mirror=/providers -platform=linux_amd64
    terraform init
fi

terraform fmt

if [ $action == "plan" ]; then
    terraform plan -no-color -out=tfplan > ../planLog.txt 2> ../lastError.log || \
    ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && cat ../lastError.log >&2 && exit 1 )
elif [ $action == "apply" ]; then
    terraform apply tfplan -no-color 2> ../lastError.log || \
    ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && cat ../lastError.log >&2 && exit 1 )
elif [ $action == "destroy" ]; then
    terraform destroy -no-color -auto-approve 2> ../lastError.log || \
    ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && cat ../lastError.log >&2 && exit 1 )
fi