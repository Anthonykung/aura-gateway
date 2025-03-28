
# Copyright (c) 2025 Anthony Kung <hi@anth.dev> (anth.dev)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# @file   publish.sh
# @author Anthony Kung <hi@anth.dev> (anth.dev)
# @date   Created on March 28 2025, 00:07 -07:00


#!/bin/bash

# Extract current version from file .env
if [ -f .env ]; then
  source .env
else
  echo ".env file not found!"
  exit 1
fi

# Set version
VERSION=$AURA_VERSION

# Increment version based on input
if [ ! -z "$1" ]; then
  case $1 in
    "M" | "m")
      VERSION=$(echo $VERSION | awk -F. -v OFS=. '{sub(/^v/, "", $1); $1 = $1 + 1; $2 = 0; $3 = 0;} 1' | sed 's/^/v/')
      ;;
    "I" | "i")
      VERSION=$(echo $VERSION | awk -F. -v OFS=. '{sub(/^v/, "", $1); $2 = $2 + 1; $3 = 0;} 1' | sed 's/^/v/')
      ;;
    "P" | "p")
      VERSION=$(echo $VERSION | awk -F. -v OFS=. '{sub(/^v/, "", $1); $NF = $NF + 1;} 1' | sed 's/^/v/')
      ;;
    *)
      echo -e "\033[31mInvalid input parameter\033[0m"
      exit 1
      ;;
  esac
else
  VERSION=$(echo $VERSION | awk -F. -v OFS=. '{sub(/^v/, "", $1); $NF = $NF + 1;} 1' | sed 's/^/v/')
fi

echo -e "\033[35mNew version: $VERSION\033[0m"

# Build the project
yarn build

# Update .env with new version
sed -i "s/AURA_VERSION=.*/AURA_VERSION=$VERSION/" .env

# Build docker image
echo -e "\033[38;2;255;182;193mBuilding docker image\033[0m"
docker build -t aura-gateway:$VERSION .
if [ $? -ne 0 ]; then
  echo -e "\033[31mFailed to build docker image\033[0m"
  exit 1
fi

# Set ACR details
ACR_LOGIN_SERVER="$AZURE_ACR_NAME.azurecr.io"
ACR_IMAGE="$ACR_LOGIN_SERVER/aura-gateway"

# Tag image for ACR
docker tag aura-gateway:$VERSION $ACR_IMAGE:$VERSION
docker tag aura-gateway:$VERSION $ACR_IMAGE:latest

# Login to ACR
echo -e "\033[38;2;255;182;193mLogging in to Azure ACR\033[0m"
az acr login --name $AZURE_ACR_NAME
if [ $? -ne 0 ]; then
  echo -e "\033[31mFailed to login to Azure ACR\033[0m"
  exit 1
fi

# Push image to ACR
echo -e "\033[38;2;255;182;193mPushing docker image to Azure ACR\033[0m"
docker push $ACR_IMAGE:$VERSION
docker push $ACR_IMAGE:latest
if [ $? -ne 0 ]; then
  echo -e "\033[31mFailed to push docker image to Azure ACR\033[0m"
  exit 1
fi

echo -e "\033[38;2;136;223;142mComplete\033[0m"
