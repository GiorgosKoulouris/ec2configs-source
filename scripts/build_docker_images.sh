#!/bin/bash

declare -a COMPONENT_NAMES=("ec2c-frontend-app" "ec2c-backend-app" "ec2c-database" "ec2c-terraform-job" "ec2c-python-job")
declare -a COMPONENT_PATHS=("frontend" "backend" "database" "terraform" "python")

usage() {
    echo "Use this script to build the docker images with the proper naming and tags"
    echo
    echo "Options:"
    echo "    --privateECR      Uploads the images to a private ECR"
    echo "    --publicECR       Uploads the images to public ECR"
    echo "    --both            Uploads the images to both private and public ECR"
    echo "    -h, --help        Prints this message"
    echo
}

UPLOAD_TO_ECR='false'
UPLOAD_TO_PUBLIC_ECR='false'

for arg in "$@"; do
    case "$arg" in
    --help)
        usage
        exit 0
        ;;
    -h)
        usage
        exit 0
        ;;
    --privateECR)
        shift
        UPLOAD_TO_ECR='true'
        BUILD_FAILED='false'
        ;;
    --publicECR)
        shift
        UPLOAD_TO_PUBLIC_ECR='true'
        BUILD_FAILED='false'
        ;;
    --both)
        shift
        UPLOAD_TO_ECR='true'
        UPLOAD_TO_PUBLIC_ECR='true'
        BUILD_FAILED='false'
        ;;
    esac
done

read -rp "App version (Default: 1.0.0): " VERSION
if [ "$VERSION" == "" ]; then
    VERSION="1.0.0"
fi

if [ "$UPLOAD_TO_ECR" == 'true' ]; then
    while true; do
        read -rp "AWS Account ID: " AWS_ID
        if [ "$AWS_ID" == '' ]; then
            echo "Account ID cannot be an empty string."
        else
            break
        fi
    done

    while true; do
        read -rp "Region: " AWS_REGION
        if [ "$AWS_REGION" == '' ]; then
            echo "Region cannot be an empty string."
        else
            break
        fi
    done

    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com
fi

if [ "$UPLOAD_TO_PUBLIC_ECR" == 'true' ]; then
    while true; do
        read -rp "Public registry alias: " ALIAS
        if [ "$ALIAS" == '' ]; then
            echo "Alias cannot be an empty string."
        else
            break
        fi
    done

    aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/gkoulouris
fi

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
MAIN_DIR="$(dirname "$SCRIPT_DIR")"

for i in "${!COMPONENT_NAMES[@]}"; do
    NAME="${COMPONENT_NAMES[$i]}"
    PATH="${COMPONENT_PATHS[$i]}"

    cd "$MAIN_DIR/$PATH"

    BUILD_FAILED='false'

    echo "Building image $NAME..."
    docker build -t "$NAME:$VERSION" . && \
    docker tag $NAME:$VERSION $NAME:latest || \
    BUILD_FAILED='true'

    if [[ "$UPLOAD_TO_ECR" == 'true' && "$BUILD_FAILED" == 'false' ]]; then

        docker tag $NAME:latest $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$NAME:latest
        docker tag $NAME:$VERSION $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$NAME:$VERSION

        docker push $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$NAME:latest
        docker push $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$NAME:$VERSION

        docker image remove --no-prune $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$NAME:latest
        docker image remove --no-prune $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$NAME:$VERSION
    fi

    if [[ "$UPLOAD_TO_PUBLIC_ECR" == 'true' && "$BUILD_FAILED" == 'false' ]]; then
        docker tag $NAME:$VERSION public.ecr.aws/$ALIAS/$NAME:$VERSION
        docker tag $NAME:latest public.ecr.aws/$ALIAS/$NAME:latest

        docker push public.ecr.aws/$ALIAS/$NAME:$VERSION
        docker push public.ecr.aws/$ALIAS/$NAME:latest

        docker image remove --no-prune public.ecr.aws/$ALIAS/$NAME:$VERSION
        docker image remove --no-prune public.ecr.aws/$ALIAS/$NAME:latest
    fi
done
