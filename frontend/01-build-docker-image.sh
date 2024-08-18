#!/bin/bash

usage() {
    echo "Use this script to build the docker images with the proper naming and tags"
    echo
    echo "Options:"
    echo "    --no-build      Does not build the image, only pushes it to ECR"
    echo "    -h, --help      Prints this message"
    echo
}

BUILD='true'
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
        --no-build)
            BUILD='false'
            UPLOAD_TO_ECR='true'
            BUILD_FAILED='false'
            ;;
    esac
done

read -p "App version (Default: 1.0.0): " VERSION
if [ "$VERSION" == "" ]; then
	VERSION="1.0.0"
fi

if [ "$BUILD" == 'true' ]; then
    echo "The image will have the tag 'latest' in addition to the provided version."


    while true; do
        read -rp "Do you want to push the image to ECR with the same tags? (y/n): " yn
        case $yn in
            [Yy]* )
                UPLOAD_TO_ECR='true'
                
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
                break
                ;;
            [Nn]* )
                UPLOAD_TO_ECR='false'
                break
                ;;
            * )
                echo "Please answer y or n."
                ;;
        esac
    done

    BUILD_FAILED='false'
    echo "Building image..."
    docker build -t "ec2c-frontend-app:$VERSION" . && \
    docker tag ec2c-frontend-app:$VERSION ec2c-frontend-app:latest || \
    BUILD_FAILED='true'

fi

if [[ "$UPLOAD_TO_ECR" == 'true' && "$BUILD_FAILED" == 'false' ]]; then

    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com

    docker tag ec2c-frontend-app:latest $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ec2c-frontend-app:latest
    docker tag ec2c-frontend-app:$VERSION $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ec2c-frontend-app:$VERSION

    docker push $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ec2c-frontend-app:latest
    docker push $AWS_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ec2c-frontend-app:$VERSION

fi
