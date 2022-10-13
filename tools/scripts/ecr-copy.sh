#!/bin/bash
set -e

# CREATE AWS PROFILES - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

################################# UPDATE THESE #################################
SOURCE_REGION="us-east-2" 
DESTINATION_REGION="us-east-2" 

SOURCE_PROFILE="old"
DESTINATION_PROFILE="new"

SOURCE_BASE_PATH="894231352815.dkr.ecr.$SOURCE_REGION.amazonaws.com"
DESTINATION_BASE_PATH="410965620680.dkr.ecr.$DESTINATION_REGION.amazonaws.com"
#################################################################################

URI=($(aws ecr describe-repositories --profile $SOURCE_PROFILE --query 'repositories[].repositoryUri' --output text --region $SOURCE_REGION))
NAME=($(aws ecr describe-repositories --profile $SOURCE_PROFILE --query 'repositories[].repositoryName' --output text --region $SOURCE_REGION))

echo "Start repo copy: `date`"

# source account login 
aws --profile $SOURCE_PROFILE --region $SOURCE_REGION ecr get-login-password | docker login --username AWS --password-stdin $SOURCE_BASE_PATH
# destination account login
aws --profile $DESTINATION_PROFILE --region $DESTINATION_REGION ecr get-login-password | docker login --username AWS --password-stdin $DESTINATION_BASE_PATH


for i in ${!URI[@]}; do
  echo "====> Grabbing latest from ${NAME[$i]} repo"
  # create ecr repo if one does not exist in destination account
  aws ecr describe-repositories --profile $DESTINATION_PROFILE --repository-names ${NAME[$i]} || aws ecr create-repository --profile $DESTINATION_PROFILE --repository-name ${NAME[$i]}

  for tag in "main" "stage"
   do
   {
    echo "start pulling image ${URI[$i]}:$tag"
    docker pull ${URI[$i]}:$tag
    docker tag ${URI[$i]}:$tag $DESTINATION_BASE_PATH/${NAME[$i]}:$tag
    
    echo "start pushing image $DESTINATION_BASE_PATH/${NAME[$i]}:$tag"
    docker push $DESTINATION_BASE_PATH/${NAME[$i]}:$tag
    echo ""
   } || {}
  done
done

echo "Finish repo copy: `date`"
echo "Don't forget to purge you local docker images!"
#Uncomment to delete all
#docker rmi $(for i in ${!NAME[@]}; do docker images | grep ${NAME[$i]} | tr -s ' ' | cut -d ' ' -f 3 | uniq; done) -f